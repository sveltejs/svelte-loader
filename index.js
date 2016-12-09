const { compile } = require('svelte');
const { parseQuery } = require('loader-utils');

module.exports = function(source, map) {
  this.cacheable();

  const filename = this.resourcePath;
  const query = parseQuery(this.query);

  try {
    let { code, map } = compile(source, {
      // name: CamelCase component name
      filename: filename,
      format: query.format || 'es',
      name: query.name,
      css: Boolean(query.css !== false),
      onerror: (err) => {
        console.log(err.message);
        this.emitError(err.message);
      },
      onwarn: (warn) => {
        console.log(warn.message);
        this.emitWarn(warn.message);
      }
    });

    this.callback(null, code, map);
  } catch (err) {
    this.callback(err);
  }
};
