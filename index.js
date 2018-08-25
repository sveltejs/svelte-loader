const { basename, extname, relative } = require('path');
const { compile, preprocess } = require('svelte');
const { getOptions } = require('loader-utils');
const VirtualModules = require('./lib/virtual');
const requireRelative = require('require-relative');

const hotApi = require.resolve('./lib/hot-api.js');

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
	return basename(input).
			replace(extname(input), '').
			replace(/[^a-zA-Z_$0-9]+/g, '_').
			replace(/^_/, '').
			replace(/_$/, '').
			replace(/^(\d)/, '_$1');
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

	return { js, css, ast: compiled.ast };
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

	const options = Object.assign({}, this.options, getOptions(this));
	const callback = this.async();

	const isServer = this.target === 'node' || (options.generate && options.generate == 'ssr');
	const isProduction = this.minimize || process.env.NODE_ENV === 'production';

	options.filename = this.resourcePath;
	if (!('format' in options)) options.format = 'es';
	if (!('shared' in options)) options.shared = options.format === 'es' && requireRelative.resolve('svelte/shared.js', process.cwd());
	if (!('name' in options)) options.name = capitalize(sanitize(options.filename));
	if (!('onwarn' in options)) options.onwarn = warning => this.emitWarning(new Error(warning));
	if (options.emitCss) options.css = false;
	if (options.externalDependencies) options.externalDependencies.forEach(dep => this.addDependency(dep));

	deprecatePreprocessOptions(options);
	options.preprocess.filename = options.filename;

	preprocess(source, options.preprocess).then(processed => {
		let { js, css } = normalize(compile(processed.toString(), options));

		if (options.hotReload && !isProduction && !isServer) {
			const hotOptions = Object.assign({}, options.hotOptions);
			const id = JSON.stringify(relative(process.cwd(), options.filename));
			js.code = makeHot(id, js.code, hotOptions);
		}

		if (options.emitCss && css.code) {
			const cssFilepath = options.filename.replace(
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