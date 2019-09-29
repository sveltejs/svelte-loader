const { createMakeHot } = require('svelte-hmr');

const hotApi = require.resolve('./hot-api.js');

const makeHot = createMakeHot(hotApi);

module.exports = makeHot;
