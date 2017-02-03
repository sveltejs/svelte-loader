const { compile } = require('svelte');
const { parseQuery } = require('loader-utils');

module.exports = function(source, map) {
  this.cacheable();

  const filename = this.resourcePath;
  const query = parseQuery(this.query);

  try {
    let { code, map } = compile(source, {
      filename: filename,
      generate: query.generate,
      format: query.format || 'es',
      shared: query.shared || false,
      name: query.name,
      css: query.css !== false,
      generate: query.generate || 'dom',
    });

    this.callback(null, code, map);
  } catch (err) {
    // wrap error to provide correct
    // context when logging to console
    this.callback(new Error(err.toString()));
  }
};
