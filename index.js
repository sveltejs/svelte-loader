const { basename, extname, posix, relative } = require('path');
const { compile, preprocess } = require('svelte');
const { getOptions } = require('loader-utils');
const { statSync, utimesSync, writeFileSync } = require('fs');
const { tmpdir } = require('os');

function makeHot(id, code, hotOptions) {
	const options = JSON.stringify(hotOptions);
	const replacement = `

if (module.hot) {

	const { configure, register, reload } = require('svelte-loader/lib/hot-api');

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

module.exports = function(source, map) {
	this.cacheable();

	const options = Object.assign({}, this.options, getOptions(this));
	const callback = this.async();

	const isServer = this.target === 'node' || (options.generate && options.generate == 'ssr');
	const isProduction = this.minimize || process.env.NODE_ENV === 'production';

	options.filename = this.resourcePath;
	if (!options.format) {
		options.format = this.version === 1 ? options.format || 'cjs' : 'es';
	}
	if (!options.shared) {
		options.shared = options.format === 'es' && 'svelte/shared.js';
	}

	if (options.emitCss) options.css = false;

	if (!options.name) options.name = capitalize(sanitize(options.filename));

	if (!options.onwarn) options.onwarn = warning => this.emitWarning(new Error(warning));

	preprocess(source, options).then(processed => {
		let { code, map, css, cssMap, ast } = compile(processed.toString(), options);

		if (options.emitCss && css) {
			const posixTmpdir = posixify(tmpdir());
			const tmpFile = posix.join(posixTmpdir, 'svelte-' + ast.hash + '.css');

			css += '\n/*# sourceMappingURL=' + cssMap.toUrl() + '*/';
			code = code + `\nrequire('${tmpFile}');\n`;

			writeFileSync(tmpFile, css);
			const { atime, mtime } = statSync(tmpFile);
			utimesSync(tmpFile, new Date(atime.getTime() - 99999), new Date(mtime.getTime() - 99999));
		}

		if (options.hotReload && !isProduction && !isServer) {
			const hotOptions = Object.assign({}, options.hotOptions);
			const id = JSON.stringify(relative(process.cwd(), options.filename));
			code = makeHot(id, code, hotOptions);
		}

		callback(null, code, map);
	}, err => callback(err)).catch(err => {
		// wrap error to provide correct
		// context when logging to console
		callback(new Error(`${err.name}: ${err.toString()}`));
	});
};
