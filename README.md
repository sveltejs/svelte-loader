# svelte-loader

[![Build Status](https://travis-ci.org/sveltejs/svelte-loader.svg?branch=master)](https://travis-ci.org/sveltejs/svelte-loader)

A [webpack](https://webpack.js.org) loader for [svelte](https://svelte.technology).


## Usage

Configure inside your `webpack.config.js`:

```javascript
  ...
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

Checkout [example setup](./example).


## Loader Options

- `mapGeneratedSource`: use the generated-code as the "source" for code coverage tools (like Istanbul). Defaults to *false*.

## License

MIT
