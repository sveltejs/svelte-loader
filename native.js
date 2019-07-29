// Native needs its own entry point because its proxy requires NativeScript
// modules that are not available in non-native project.
//
// This could also gives us the opportunity to better customize default loader
// configuration for native projects (in the future).

global.__SvelteLoader__ProxyAdapter = require.resolve(
	'./lib/svelte-native/hot/proxy-adapter-native'
);

module.exports = require('./index');
