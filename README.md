# svelte-loader

[![Build Status](https://travis-ci.org/sveltejs/svelte-loader.svg?branch=master)](https://travis-ci.org/sveltejs/svelte-loader)

A [webpack](https://webpack.js.org) loader for [svelte](https://svelte.technology).


## Install

```
npm install --save svelte svelte-loader
```


## Usage

Configure inside your `webpack.config.js`:

```javascript
  ...
  resolve: {
    // see below for an explanation
    alias: {
      svelte: path.resolve('node_modules', 'svelte')
    },
    extensions: ['.mjs', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main']
  },
  module: {
    rules: [
      ...
      {
        test: /\.(html|svelte)$/,
        exclude: /node_modules/,
        use: 'svelte-loader'
      },
      {
        // required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: {
          fullySpecified: false
        }
      }
      ...
    ]
  }
  ...
```

Check out the [example project](https://github.com/sveltejs/template-webpack).

### resolve.alias

The [`resolve.alias`](https://webpack.js.org/configuration/resolve/#resolvealias) option is used to make sure that only one copy of the Svelte runtime is bundled in the app, even if you are `npm link`ing in dependencies with their own copy of the `svelte` package. Having multiple copies of the internal scheduler in an app, besides being inefficient, can also cause various problems.

### resolve.mainFields

Webpack's [`resolve.mainFields`](https://webpack.js.org/configuration/resolve/#resolve-mainfields) option determines which fields in package.json are used to resolve identifiers. If you're using Svelte components installed from npm, you should specify this option so that your app can use the original component source code, rather than consuming the already-compiled version (which is less efficient).

### Extracting CSS

If your Svelte components contain `<style>` tags, by default the compiler will add JavaScript that injects those styles into the page when the component is rendered. That's not ideal, because it adds weight to your JavaScript, prevents styles from being fetched in parallel with your code, and can even cause CSP violations.

A better option is to extract the CSS into a separate file. Using the `emitCss` option as shown below would cause a virtual CSS file to be emitted for each Svelte component. The resulting file is then imported by the component, thus following the standard Webpack compilation flow. Add [ExtractTextPlugin](https://github.com/webpack-contrib/extract-text-webpack-plugin) to the mix to output the css to a separate file.

```javascript
  ...
  module: {
    rules: [
      ...
      {
        test: /\.(html|svelte)$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader',
          options: {
            emitCss: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
      ...
    ]
  },
  ...
  plugins: [
    new ExtractTextPlugin('styles.css'),
    ...
  ]
  ...
```

Alternatively, if you're handling styles in some other way and just want to prevent the CSS being added to your JavaScript bundle, use `css: false`.

### Source maps

JavaScript source maps are enabled by default, you just have to use an appropriate [webpack devtool](https://webpack.js.org/configuration/devtool/).

To enable CSS source maps, you'll need to use `emitCss` and pass the `sourceMap` option to the `css-loader`. The above config should look like this:

```javascript
module.exports = {
    ...
    devtool: "source-map", // any "source-map"-like devtool is possible
    ...
    module: {
      rules: [
        ...
        {
          test: /\.(html|svelte)$/,
          exclude: /node_modules/,
          use: {
            loader: 'svelte-loader',
            options: {
              emitCss: true,
            },
          },
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [{ loader: 'css-loader', options: { sourceMap: true } }],
          }),
        },
        ...
      ]
    },
    ...
    plugins: [
      new ExtractTextPlugin('styles.css'),
      ...
    ]
    ...
};
```

This should create an additional `styles.css.map` file.

### Hot Reload

This loader supports component-level HMR via the community supported [svelte-hmr](https://github.com/rixo/svelte-hmr) package. This package serves as a testbed and early access for Svelte HMR, while we figure out how to best include HMR support in the compiler itself (which is tricky to do without unfairly favoring any particular dev tooling). Feedback, suggestion, or help to move HMR forward is welcomed at [svelte-hmr](https://github.com/rixo/svelte-hmr/issues) (for now).

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
          loader: 'svelte-loader',
          options: {
            compilerOptions: {
              // NOTE Svelte's dev mode MUST be enabled for HMR to work
              // -- in a real config, you'd probably set it to false for prod build,
              //    based on a env variable or so
              dev: true,
            },

            // NOTE emitCss: true is currently not supported with HMR
            // Enable it for production to output separate css file
            emitCss: false,
            // Enable HMR only for dev mode
            hotReload: true, // Default: false
            // Extra HMR options
            hotOptions: {
              // Prevent preserving local component state
              noPreserveState: false,

              // If this string appears anywhere in your component's code, then local
              // state won't be preserved, even when noPreserveState is false
              noPreserveStateKey: '@!hmr',

              // Prevent doing a full reload on next HMR update after fatal error
              noReload: false,

              // Try to recover after runtime errors in component init
              optimistic: false,

              // --- Advanced ---

              // Prevent adding an HMR accept handler to components with
              // accessors option to true, or to components with named exports
              // (from <script context="module">). This have the effect of
              // recreating the consumer of those components, instead of the
              // component themselves, on HMR updates. This might be needed to
              // reflect changes to accessors / named exports in the parents,
              // depending on how you use them.
              acceptAccessors: true,
              acceptNamedExports: true,
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

#### External Dependencies

If you rely on any external dependencies (files required in a preprocessor for example) you might want to watch these files for changes and re-run svelte compile.

Webpack allows [loader dependencies](https://webpack.js.org/contribute/writing-a-loader/#loader-dependencies) to trigger a recompile. svelte-loader exposes this API via `options.externalDependencies`.
 For example:

```js
...
const variables = path.resolve('./variables.js');
...
{
    test: /\.(html|svelte)$/,
    use: [
      {
        loader: 'svelte-loader',
        options: {
          externalDependencies: [variables]
        }
      }
    ]
  }
```

## License

MIT
