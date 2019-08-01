const path = require('path');

// Svelte location can be overriden by env variable. This can be needed
// to use some external tools targetting a whole app, during development
// of svelte-loader.

const resolveSvelte = () => {
	const { SVELTE } = process.env;
	if (SVELTE) {
		const ensureAbsolute = name =>
			path.isAbsolute(name) ? name : path.resolve(process.cwd(), name);
		return {
			req: require,
			svelte: ensureAbsolute(SVELTE),
		};
	} else {
		return {
			req: require.main.require.bind(require.main),
			svelte: 'svelte',
		};
	}
};

const { req, svelte } = resolveSvelte();

const { version } = req(`${svelte}/package.json`);

const major_version = +version[0];

const { compile, preprocess } =
	major_version >= 3 ? req(`${svelte}/compiler`) : req(svelte);

module.exports = {
	major_version,
	compile,
	preprocess,
};
