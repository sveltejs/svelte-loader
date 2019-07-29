const posixify = require('../posixify');

const hotApi = require.resolve('./hot/hot-api.js');

const quote = JSON.stringify;

function makeHot(id, code, hotOptions = {}) {
	const options = JSON.stringify(hotOptions);
	const replacement = `
		if (module.hot) {
			const { applyHMR } = require('${posixify(hotApi)}');
			$2 = applyHMR(${options}, ${quote(id)}, module.hot, $2);
		}
		export default $2;
	`;
	return code.replace(/(export default ([^;]*));/, replacement);
}

module.exports = makeHot;
