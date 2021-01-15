module.exports = function posixify(file) {
	return file.replace(/[/\\]/g, '/');
};
