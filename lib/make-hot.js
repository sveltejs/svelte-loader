const { walk } = require('svelte/compiler');
const { createMakeHot } = require('svelte-hmr');

const hotApi = require.resolve('./hot-api.js');

const makeHot = createMakeHot({
	walk,
	meta: 'module',
	hotApi,
});

module.exports.makeHot = makeHot;
