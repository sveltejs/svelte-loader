const path = require('path');
const fs = require('fs');
const { getOptions } = require('loader-utils');
const { buildMakeHot } = require('./lib/make-hot.js');
const svelte = require('svelte/compiler');

function posixify(file) {
	return file.replace(/[/\\]/g, '/');
}

const virtualModules = new Map();
let index = 0;

let configFile = 'webpack.config.js';
for (let i = 0; i < process.argv.length; i++) {
	if (process.argv[i] === '--config') {
		configFile = process.argv[i + 1];
		break;
	}

	if (process.argv[i].startsWith('--config=')) {
		configFile = process.argv[i].split('=')[1];
		break;
	}
}

try {
	const configPath = path.resolve(process.cwd(), configFile);
	const config = require(configPath);
	let found = false;
	if (Array.isArray(config)) {
		found = config.some(check);
	} else {
		found = check(config);
	}

	if (!found) {
		console.warn('\n\u001B[1m\u001B[31mWARNING: You should add "svelte" to the "resolve.conditionNames" array in your webpack config. See https://github.com/sveltejs/svelte-loader#resolveconditionnames for more information\u001B[39m\u001B[22m\n');
	}

	function check(config) {
		if (typeof config === 'function') {
			// We could try to invoke it but that could maybe have side unintended side effects
			// and/or fail due to missing parameters, so we read the file instead
			const configString = fs.readFileSync(configPath, 'utf-8');
			const result = /conditionNames\s*:[\s|\n]*\[([^\]]+?)\]/.exec(configString);
			return !!result && !!result[1].includes('svelte');
		} else {
			return !!config.resolve && !!config.resolve.conditionNames && config.resolve.conditionNames.includes('svelte');
		}
	}
} catch (e) {
	// do nothing and hope for the best
}

let warned = false;

function getMajor() {
	return Number(svelte.VERSION.split('.')[0]);
}

module.exports = function(source, map) {
	this.cacheable();

	const options = { ...getOptions(this) };
	const callback = this.async();

	if (options.cssPath || options.cssData) {
		const css = options.cssData
			? Buffer.from(options.cssData, 'base64').toString('utf-8')
			: virtualModules.get(options.cssPath);
		if (options.cssPath)
			virtualModules.delete(options.cssPath);
		callback(null, css);
		return;
	}

	const isServer = this.target === 'node' || (options.compilerOptions && options.compilerOptions.generate == 'ssr');
	const isProduction = this.minimize || process.env.NODE_ENV === 'production';
	const compileOptions = {
		filename: this.resourcePath,
		css: getMajor() === 3 ? !options.emitCss : (options.emitCss ? 'external' : 'injected'),
		...options.compilerOptions
	};
	const handleWarning = warning => this.emitWarning(new Error(warning));

	if (getMajor() >= 5 && (this.resourcePath.endsWith('.svelte.js') || this.resourcePath.endsWith('.svelte.ts'))) {
		try {
			const { js, warnings } = svelte.compileModule(
				source,
				{ filename: this.resourcePath, dev: compileOptions.dev, generate: compileOptions.generate }
			);

			warnings.forEach(
				options.onwarn
					? warning => options.onwarn(warning, handleWarning)
					: handleWarning
			);

			callback(null, js.code, js.map);
		} catch (err) {
			// wrap error to provide correct
			// context when logging to console
			callback(new Error(`${err.name}: ${err.toString()}`));
		}

		return;
	}

	if (getMajor() === 3) {
		compileOptions.format = (options.compilerOptions && options.compilerOptions.format) || 'esm';
	} else {
		if (options.compilerOptions && options.compilerOptions.format && !warned) {
			warned = true;
			console.warn(`[svelte-loader] Svelte's "format" compiler option was removed in version 4, the output is always ESM now.` +
				` Remove the format option from your webpack config to remove this warning.`);
		}
	}

	options.preprocess = options.preprocess || {};
	options.preprocess.filename = compileOptions.filename;

	svelte.preprocess(source, options.preprocess).then(processed => {
		if (processed.dependencies && this.addDependency) {
			for (let dependency of processed.dependencies) {
				this.addDependency(dependency);
			}
		}

		if (processed.map) compileOptions.sourcemap = processed.map;

		const compiled = svelte.compile(processed.toString(), compileOptions);
		let { js, css, warnings } = compiled;

		if (!js.map.sourcesContent) {
			js.map.sourcesContent = [source];
			js.map.sources = [compileOptions.filename];
		}

		warnings.forEach(
			options.onwarn
				? warning => options.onwarn(warning, handleWarning)
				: handleWarning
		);

		if (options.hotReload && !isProduction && !isServer) {
			const hotOptions = { ...options.hotOptions };
			const makeHot = buildMakeHot(hotOptions);
			const id = JSON.stringify(path.relative(process.cwd(), compileOptions.filename));
			js.code = makeHot(id, js.code, hotOptions, compiled, source, compileOptions);
		}

		if (options.emitCss && css && css.code) {
			const resource = posixify(compileOptions.filename);
			const threadLoaderUsed = this.emitFile === undefined;
			const cssPath = threadLoaderUsed
				? `${resource}.css`
				: `${resource}.${index++}.css`;
			const cssQuery = threadLoaderUsed
				? `cssData=${Buffer.from(css.code).toString('base64')}`
				: `cssPath=${cssPath}`;
			css.code += '\n/*# sourceMappingURL=' + css.map.toUrl() + '*/';
			js.code += `\nimport '${cssPath}!=!svelte-loader?${cssQuery}!${resource}'\n;`;
			if (!threadLoaderUsed)
				virtualModules.set(cssPath, css.code);
		}

		callback(null, js.code, js.map);
	}, err => {
		const file = err.file || err.filename;
		if (typeof file === 'string' && file !== this.resourcePath) {
			this.addDependency(file);
		}
		callback(err);
	}).catch(err => {
		// wrap error to provide correct
		// context when logging to console
		callback(new Error(`${err.name}: ${err.toString()}`));
	});
};
