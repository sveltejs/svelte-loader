# svelte-loader-hot

This is a copy of official [svelte-loader](https://github.com/sveltejs/svelte-loader) with added HMR support.

HMR is not officially supported by Svelte 3 yet. Progress can be tracked in [this issue](https://github.com/sveltejs/svelte/issues/3632).

Meanwhile, please report your issues regarding HMR (with Webpack) in this project's [issue tracker](https://github.com/rixo/svelte-loader-hot/issues).

**:warning: Experimental :warning:**

This HMR implementation relies on Svelte's private & non documented API. This means that it could stop working with any new version of Svelte.

## Templates

To quickly bootstrap a new project, or for example purpose, you can use the following templates. They are copies of the official templates, with the bare minimum added to support HMR with this plugin.

- [svelte-template-webpack-hot](https://github.com/rixo/svelte-template-webpack-hot): hot version of the official Svelte template for Webpack.

- [sapper-template-hot#webpack](https://github.com/rixo/sapper-template-hot/tree/webpack): Sapper + Webpack template with HMR.

## Installation

```bash
npm install --save-dev svelte-loader-hot
```

## Usage

This plugin can be used as a drop-in replacement for `svelte-loader`. It aims to remain as close to the official plugin as possible. Please refer to [official docs](https://github.com/sveltejs/svelte-loader) for general usage of the plugin. For HMR specific stuff, see bellow.

Configure inside your `webpack.config.js`:

```javascript
module.exports = {
  ...
  module: {
    rules: [
      ...
      {
        test: /\.(html|svelte)$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader-hot',
          options: {
            // NOTE emitCss: true is currently not supported with HMR
            emitCss: false,
            // Enable HMR
            hotReload: true, // Default: false
            // Extra HMR options
            hotOptions: {
              // Do not preserve local state (i.e. non exported `let` variables)
              // between HMR updates
              noPreserveState: false, // Default: false
              // Try to recover from runtime errors happening during reloaded
              // component init
              optimistic: true, // Default: false
            }
          }
        }
      }
      ...
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    ...
  ]
}
```

You also need to add the [HotModuleReplacementPlugin](https://webpack.js.org/plugins/hot-module-replacement-plugin/). There are multiple ways to achieve this.

If you're using webpack-dev-server, you can just pass it the [`hot` option](https://webpack.js.org/configuration/dev-server/#devserverhot) to add the plugin automatically.

Otherwise, you can add it to your webpack config directly:

```js
const webpack = require('webpack');

module.exports = {
  ...
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    ...
  ]
}
```
