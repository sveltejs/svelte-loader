const { readFileSync } = require('fs');

const babelSettings = JSON.parse(readFileSync('.babelrc'));


module.exports = {
  entry: {
    'index': [ './src/index' ]
  },
  resolve: {
    extensions: [ '.js', '.html' ]
  },
  output: {
    path: __dirname + '/public',
    filename: '[name].js',
    chunkFilename: '[name].[id].js'
  },
  module: {
    loaders: [
      {
        test: /\.(html|js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: babelSettings
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'svelte-loader'
      }
    ]
  },
  devtool: 'inline-source-map'
};