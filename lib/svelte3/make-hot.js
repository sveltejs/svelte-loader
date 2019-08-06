const posixify = require('../posixify');

const hotApi = require.resolve('./hot/hot-api.js');

const nativeAdapter = require.resolve('../svelte-native/hot/proxy-adapter-native.js');

const quote = JSON.stringify;

function makeHot(id, code, hotOptions = {}, compiled) {
	const options = JSON.stringify(hotOptions);

	const compileData = JSON.stringify({
		vars: compiled.vars
	});

	// NOTE Native adapter cannot be required in code (as opposed to this
	// generated code) because it requires modules from NativeScript's code that
	// are not resolvable for non-native users (and those missing modules would
	// prevent webpack from building).
	const adapter = hotOptions.native
		? `require('${posixify(nativeAdapter)}').default`
		: 'undefined';

	const replacement = `
		if (module.hot) {
			const { applyHMR } = require('${posixify(hotApi)}');
			$2 = applyHMR(
				${options},
				${quote(id)},
				module.hot,
				$2,
				${adapter},
				${compileData}
			);
		}
		export default $2;
	`;

	return code.replace(/(export default ([^;]*));/, replacement);
}

module.exports = makeHot;
