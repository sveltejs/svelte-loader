const { compile } = require('svelte');
const { getOptions } = require('loader-utils');

module.exports = function(source, map) {
  this.cacheable();

  const filename = this.resourcePath;
  const options = getOptions(this) || {};

  try {
    let { code, map } = compile(source, {
      filename: filename,
      generate: options.generate,
      format: options.format || 'es',
      shared: options.shared || false,
      name: options.name,
      css: options.css !== false,
    });

    this.callback(null, code, map);
  } catch (err) {
    // wrap error to provide correct
    // context when logging to console
    this.callback(new Error(err.toString()));
  }
};
