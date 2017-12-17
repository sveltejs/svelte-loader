const { basename, extname, join } = require('path');
const { compile, preprocess } = require('svelte');
const { getOptions } = require('loader-utils');
const { statSync, utimesSync, writeFileSync } = require('fs');
const { tmpdir } = require('os');

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

module.exports = function(source, map) {
	this.cacheable();

	const options = Object.assign({}, this.options, getOptions(this));
	const callback = this.async();

	options.filename = this.resourcePath;
	options.format = this.version === 1 ? options.format || 'cjs' : 'es';
	options.shared =
			options.format === 'es' && require.resolve('svelte/shared.js');

	if (options.emitCss) options.css = false;

	if (!options.name) options.name = capitalize(sanitize(options.filename));

	preprocess(source, options).then(processed => {
		let { code, map, css, cssMap, ast } = compile(processed.toString(), options);

		if (options.emitCss && css) {
			const tmpFile = join(tmpdir(), 'svelte-' + ast.hash + '.css');

			css += '\n/*# sourceMappingURL=' + cssMap.toUrl() + '*/';
			code = code + `\nrequire('${tmpFile}');\n`;

			writeFileSync(tmpFile, css);
			const { atime, mtime } = statSync(tmpFile);
			utimesSync(tmpFile, atime.getTime() - 99999, mtime.getTime() - 99999);
		}

		callback(null, code, map);
	}, err => callback(err)).catch(err => {
		// wrap error to provide correct
		// context when logging to console
		callback(new Error(`${err.name}: ${err.toString()}`));
	});
};
