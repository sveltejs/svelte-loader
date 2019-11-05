const path = require('path');

const resolveSvelte = () => {
	const { SVELTE } = process.env;

	const absolute = (name, base) =>
		path.isAbsolute(name) ? name : path.join(base, name);

	if (SVELTE) {
		const base = absolute(SVELTE, process.cwd());
		console.log(
			'ℹ ｢svelte-loader｣:',
			`Use Svelte location from SVELTE env variable: ${base}`
		);
		return {
			req: require,
			base,
		};
	} else {
		return {
			req: require.main.require.bind(require.main),
			base: 'svelte',
		};
	}
};

const { req, base } = resolveSvelte();

const { version } = req(`${base}/package.json`);

const major_version = +version[0];

const { compile, preprocess } =
	major_version >= 3 ? req(`${base}/compiler`) : req(`${base}`);

const makeHot =
	major_version >= 3 ? require('./svelte3/make-hot') : require('./make-hot');

module.exports = {
	major_version,
	compile,
	preprocess,
	makeHot,
};
