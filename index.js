const { compile } = require('svelte');
const { getOptions } = require('loader-utils');

module.exports = function(source, map) {
  this.cacheable();

  const filename = this.filename;
  const options = getOptions(this) || {};

  try {
    let { code, map } = compile(source, {
      filename: filename,
      generate: options.generate,
      format: 'es',
      shared: require.resolve('svelte/shared.js'),
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
