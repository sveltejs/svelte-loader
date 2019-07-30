const posixify = require('../posixify');

const hotApi = require.resolve('./hot/hot-api.js');

const nativeApi = require.resolve('../svelte-native/hot/proxy-adapter-native.js')

const quote = JSON.stringify;

function makeHot(id, code, hotOptions = {}) {
	const options = JSON.stringify(hotOptions);
	
	let replacement = `
		if (module.hot) {
			${ hotOptions.native ? `global.__SvelteLoader__ProxyAdapter = require('${posixify(nativeApi)}').default` : ''}
			const { applyHMR } = require('${posixify(hotApi)}');
			$2 = applyHMR(${options}, ${quote(id)}, module.hot, $2);
		}
		export default $2;
	`;
	
	return code.replace(/(export default ([^;]*));/, replacement);
}

module.exports = makeHot;
