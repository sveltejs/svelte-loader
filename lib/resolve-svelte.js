const { version } = require('svelte/package.json');

const major_version = +version[0];

const { compile, preprocess } = major_version >= 3
	? require('svelte/compiler')
	: require('svelte');

module.exports = {
	major_version,
	compile,
	preprocess,
};
