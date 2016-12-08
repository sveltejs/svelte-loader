const { compile } = require('svelte');
const { parseQuery } = require('loader-utils');

module.exports = function(source, map) {
  this.cacheable();

  const filename = this.resourcePath;
  const query = parseQuery(this.query);

  try {
    let { code, map } = compile(source, {
      filename: filename,
      format: query.format || 'es',
      name: query.name,
      onerror: (err) => {
        this.emitError(err);
      },
      onwarn: (warn) => {
        this.emitWarn(warn);
      }
    });

    this.callback(null, code, map);
  } catch (err) {
    // wrap error to provide correct
    // context when logging to console
    this.callback(new Error(err.toString()));
  }
};
