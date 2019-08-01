const { version } = require.main.require('svelte/package.json');

const major_version = +version[0];

const { compile, preprocess } = major_version >= 3
	? require.main.require('svelte/compiler')
	: require.main.require('svelte');

module.exports = {
	major_version,
	compile,
	preprocess,
};
