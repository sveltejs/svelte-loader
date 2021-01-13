const { getOptions } = require('loader-utils');

const { compile, preprocess } = require('svelte/compiler');

const pluginOptions = {
	preprocess: true,
	emitCss: true,

	// legacy
	onwarn: true,
	style: true,
	script: true,
	markup: true
};

function posixify(file) {
	return file.replace(/[/\\]/g, '/');
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

const virtualModules = new Map();
let index = 0;

module.exports = function(source, map) {
	this.cacheable();

	const options = Object.assign({}, getOptions(this));
	const callback = this.async();

	if (options.cssPath) {
		const css = virtualModules.get(options.cssPath);
		virtualModules.delete(options.cssPath);
		callback(null, css);
		return;
	}

	const compileOptions = {
		filename: this.resourcePath,
		format: options.format || 'esm'
	};

	const handleWarning = warning => this.emitWarning(new Error(warning));

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

		warnings.forEach(
			options.onwarn
				? warning => options.onwarn(warning, handleWarning)
				: handleWarning
		);

		if (options.emitCss && css.code) {
			const resource = posixify(compileOptions.filename);
			const cssPath = `${resource}.${index++}.css`;
			css.code += '\n/*# sourceMappingURL=' + css.map.toUrl() + '*/';
			js.code += `\nimport '${cssPath}!=!svelte-loader?cssPath=${cssPath}!${resource}'\n;`;
			virtualModules.set(cssPath, css.code);
		}

		callback(null, js.code, js.map);
	}, err => callback(err)).catch(err => {
		// wrap error to provide correct
		// context when logging to console
		callback(new Error(`${err.name}: ${err.toString()}`));
	});
};
