const { walk } = require('../resolve-svelte');
const { createMakeHot } = require('svelte-hmr');

const hotApi = require.resolve('./hot-api.js');

const makeHot = createMakeHot({
	walk,
	meta: 'module',
	hotApi,
});

module.exports = makeHot;
