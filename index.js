const path = require('path');
const { getOptions } = require('loader-utils');
const { buildMakeHot } = require('./lib/make-hot.js');
const { compile, preprocess } = require('svelte/compiler');

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
	const config = require(path.resolve(process.cwd(), configFile));
	if (!config.resolve || !config.resolve.conditionNames || !config.resolve.conditionNames.includes('svelte')) {
		console.warn('\n\u001B[1m\u001B[31mWARNING: You should add "svelte" to the "resolve.conditionNames" array in your webpack config.\u001B[39m\u001B[22m\n');
	}
} catch (e) {
	// do nothing and hope for the best
}

module.exports = function(source, map) {
	this.cacheable();

	const options = { ...getOptions(this) };
	const callback = this.async();

	if (options.cssPath) {
		const css = virtualModules.get(options.cssPath);
		virtualModules.delete(options.cssPath);
		callback(null, css);
		return;
	}

	const isServer = this.target === 'node' || (options.compilerOptions && options.compilerOptions.generate == 'ssr');
	const isProduction = this.minimize || process.env.NODE_ENV === 'production';

	const compileOptions = {
		filename: this.resourcePath,
		css: !options.emitCss,
		...options.compilerOptions,
		format: (options.compilerOptions && options.compilerOptions.format) || 'esm'
	};

	const handleWarning = warning => this.emitWarning(new Error(warning));

	options.preprocess = options.preprocess || {};
	options.preprocess.filename = compileOptions.filename;

	preprocess(source, options.preprocess).then(processed => {
		if (processed.dependencies && this.addDependency) {
			for (let dependency of processed.dependencies) {
				this.addDependency(dependency);
			}
		}

		if (processed.map) compileOptions.sourcemap = processed.map;

		const compiled = compile(processed.toString(), compileOptions);
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

		if (options.emitCss && css.code) {
			const resource = posixify(compileOptions.filename);
			const cssPath = `${resource}.${index++}.css`;
			css.code += '\n/*# sourceMappingURL=' + css.map.toUrl() + '*/';
			js.code += `\nimport '${cssPath}!=!svelte-loader?cssPath=${cssPath}!${resource}'\n;`;
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
