const webpack = require('atool-build/lib/webpack');
const Copy = require('copy-webpack-plugin');

module.exports = function (webpackConfig, env) {
  webpackConfig.babel.plugins.push('transform-runtime');
  webpackConfig.babel.plugins
    .push([
      'import', {
        libraryName: 'antd',
        style: true,
      },
    ])

  webpackConfig.plugins.push(
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
    new Copy([{
      from: `${__dirname}/assets/img`,
      to: `${__dirname}/dist/assets/img`,
    }, {
      from: `${__dirname}/assets/audio`,
      to: `${__dirname}/dist/assets/audio`,
    }], {
      ignore: ['*.DS_Store', '*.log'],
    })
  );

  // Support hmr
  if (env === 'development') {
    webpackConfig.devtool = '#eval'
    webpackConfig.babel.plugins
      .push([
        'dva-hmr', {
          entries: ['./src/index.js'],
        },
      ])
  } else {
    webpackConfig.babel.plugins.push('dev-expression');
    webpackConfig.entry = {
      index: './src/index.js',
    }
  }

  // Don't extract common.js and common.css
  webpackConfig.plugins = webpackConfig
    .plugins
    .filter((plugin) => {
      return !(plugin instanceof webpack.optimize.CommonsChunkPlugin);
    })

  // Support CSS Modules Parse all less files as css module.
  webpackConfig.module.loaders
    .forEach((loader) => {
      if (typeof loader.test === 'function' && loader.test.toString().indexOf('\\.less$') > -1) {
        loader.include = /node_modules/
        loader.test = /\.less$/
      }
      if (loader.test.toString() === '/\\.module\\.less$/') {
        loader.exclude = /node_modules/
        loader.test = /\.less$/
      }
      if (typeof loader.test === 'function' && loader.test.toString().indexOf('\\.css$') > -1) {
        loader.include = /node_modules/
        loader.test = /\.css$/
      }
      if (loader.test.toString() === '/\\.module\\.css$/') {
        loader.exclude = /node_modules/
        loader.test = /\.css$/
      }
    })

  return webpackConfig;
}
