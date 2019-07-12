const { basename, extname, relative } = require('path');
const { getOptions } = require('loader-utils');
const VirtualModules = require('./lib/virtual');

const hotApi = require.resolve('./lib/hot-api.js');

const { version } = require('svelte/package.json');
const major_version = +version[0];
const { compile, preprocess } = major_version >= 3
	? require('svelte/compiler')
	: require('svelte');

const pluginOptions = {
	externalDependencies: true,
	hotReload: true,
	hotOptions: true,
	preprocess: true,
	emitCss: true,

	// legacy
	onwarn: true,
	shared: true,
	style: true,
	script: true,
	markup: true
};

function makeHot(id, code, hotOptions) {
	const options = JSON.stringify(hotOptions);
	const replacement = `
if (module.hot) {
	const { configure, register, reload } = require('${posixify(hotApi)}');

	module.hot.accept();

	if (!module.hot.data) {
		// initial load
		configure(${options});
		$2 = register(${id}, $2);
	} else {
		// hot update
		$2 = reload(${id}, $2);
	}
}

export default $2;
`;

	return code.replace(/(export default ([^;]*));/, replacement);
}

function posixify(file) {
	return file.replace(/[/\\]/g, '/');
}

function sanitize(input) {
	return basename(input)
		.replace(extname(input), '')
		.replace(/[^a-zA-Z_$0-9]+/g, '_')
		.replace(/^_/, '')
		.replace(/_$/, '')
		.replace(/^(\d)/, '_$1');
}

function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
}

function normalize(compiled) {
	// svelte.compile signature changed in 1.60 — this avoids
	// future deprecation warnings while preserving backwards
	// compatibility
	const js = compiled.js || { code: compiled.code, map: compiled.map };

	const css = compiled.css && typeof compiled.css === 'object'
		? compiled.css
		: { code: compiled.css, map: compiled.cssMap };

	return { js, css, ast: compiled.ast, warnings: compiled.warnings || compiled.stats.warnings || [] };
}

const warned = {};
function deprecatePreprocessOptions(options) {
	const preprocessOptions = {};

	['markup', 'style', 'script'].forEach(kind => {
		if (options[kind]) {
			if (!warned[kind]) {
				console.warn(`[svelte-loader] DEPRECATION: options.${kind} is now options.preprocess.${kind}`);
				warned[kind] = true;
			}
			preprocessOptions[kind] = options[kind];
		}
	});

	options.preprocess = options.preprocess || preprocessOptions;
}

const virtualModuleInstances = new Map();

module.exports = function(source, map) {
	if (this._compiler && !virtualModuleInstances.has(this._compiler)) {
		virtualModuleInstances.set(this._compiler, new VirtualModules(this._compiler));
	}

	const virtualModules = virtualModuleInstances.get(this._compiler);

	this.cacheable();
	
	const options = Object.assign({}, getOptions(this));
	const callback = this.async();

	const isServer = this.target === 'node' || (options.generate && options.generate == 'ssr');
	const isProduction = this.minimize || process.env.NODE_ENV === 'production';

	const compileOptions = {
		filename: this.resourcePath,
		format: options.format || (major_version >= 3 ? 'esm' : 'es')
	};

	const handleWarning = warning => this.emitWarning(new Error(warning));

	if (major_version >= 3) {
		// TODO anything?
	} else {
		compileOptions.shared = options.shared || 'svelte/shared.js';
		compileOptions.name = capitalize(sanitize(compileOptions.filename));
		compileOptions.onwarn = options.onwarn || handleWarning;
	}

	for (const option in options) {
		if (!pluginOptions[option]) compileOptions[option] = options[option];
	}

	if (options.emitCss) compileOptions.css = false;

	deprecatePreprocessOptions(options);
	options.preprocess.filename = compileOptions.filename;

	preprocess(source, options.preprocess).then(processed => {
		if (processed.dependencies && this.addDependency) {
			for (let dependency of processed.dependencies) {
				this.addDependency(dependency);
			}
		}

		let { js, css, warnings } = normalize(compile(processed.toString(), compileOptions));

		if (major_version >= 3) {
			warnings.forEach(
				options.onwarn
					? warning => options.onwarn(warning, handleWarning)
					: handleWarning
			);
		}

		if (options.hotReload && !isProduction && !isServer) {
			const hotOptions = Object.assign({}, options.hotOptions);
			const id = JSON.stringify(relative(process.cwd(), compileOptions.filename));
			js.code = makeHot(id, js.code, hotOptions);
		}

		if (options.emitCss && css.code) {
			const cssFilepath = compileOptions.filename.replace(
				/\.[^/.]+$/,
				`.svelte.css`
			);

			css.code += '\n/*# sourceMappingURL=' + css.map.toUrl() + '*/';
			js.code = js.code + `\nimport '${posixify(cssFilepath)}';\n`;

			if (virtualModules) {
				virtualModules.writeModule(cssFilepath, css.code);
			}
		}

		callback(null, js.code, js.map);
	}, err => callback(err)).catch(err => {
		// wrap error to provide correct
		// context when logging to console
		callback(new Error(`${err.name}: ${err.toString()}`));
	});
};
