# svelte-loader

[![Build Status](https://travis-ci.org/sveltejs/svelte-loader.svg?branch=master)](https://travis-ci.org/sveltejs/svelte-loader)

A [webpack](https://webpack.js.org) loader for [svelte](https://svelte.technology).


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

Hot reloading is turned off by default, you can turn it on using the `hotReload` option as shown below:

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
            hotReload: true
          }
        }
      }
      ...
    ]
  }
  ...
```

#### Hot reload rules and caveats:

 - `_rerender` and `_register` are reserved method names, please don't use them in `methods:{...}`
 - Turning `dev` mode on (`dev:true`) is **not** necessary.
 - Modifying the HTML (template) part of your component will replace and re-render the changes in place. Current local state of the component will also be preserved (this can be turned off per component see [Stop preserving state](#stop-preserving-state)).
 - When modifying the `<script>` part of your component, instances will be replaced and re-rendered in place too.
  However if your component has lifecycle methods that produce global side-effects, you might need to reload the whole page.
 - If you are using `svelte/store`, a full reload is required if you modify `store` properties


Components will **not** be hot reloaded in the following situations:
 1. `process.env.NODE_ENV === 'production'`
 2. Webpack is minifying code
 3. Webpack's `target` is `node` (i.e SSR components)
 4. `generate` option has a value of `ssr`

#### Stop preserving state

Sometimes it might be necessary for some components to avoid state preservation on hot reload.

This can be configured on a per-component basis by adding a property `noPreserveState = true` to the component's constructor using the `setup()` method. For example:
```js
export default {
  setup(comp){
    comp.noPreserveState = true;
  },
  data(){return {...}},
  oncreate(){...}
}
```

Or, on a global basis by adding `{noPreserveState: true}` to `hotOptions`. For example:
```js
{
    test: /\.(html|svelte)$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'svelte-loader',
        options: {
          hotReload: true,
          hotOptions: {
            noPreserveState: true
          }
        }
      }
    ]
  }
```

**Please Note:** If you are using `svelte/store`, `noPreserveState` has no effect on `store` properties. Neither locally, nor globally.

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
