const posixify = require('./posixify');

const hotApi = require.resolve('./hot-api.js');

function makeHot(id, code, hotOptions) {
	const options = JSON.stringify(hotOptions);
	const replacement = `
if (module.hot) {
	const { configure, register, reload } = require('${posixify(hotApi)}');

	module.hot.accept();

	if (!module.hot.data) {
		// initial load
		configure(${options});
		$2 = register(${id}, $2);
	} else {
		// hot update
		$2 = reload(${id}, $2);
	}
}

export default $2;
`;

	return code.replace(/(export default ([^;]*));/, replacement);
}

module.exports = makeHot;
