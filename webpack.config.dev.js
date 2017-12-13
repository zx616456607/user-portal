/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App webpack dev config
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var nodeModulesPath = path.join(__dirname, '/node_modules/')
var hotMiddleWareConfig = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000'

console.log('Use development webpack config ...')

module.exports = {
  devtool: '#cheap-module-eval-source-map',

  entry: {
    main: [
      hotMiddleWareConfig,
      'react-hot-loader/patch',
      './src/entry/index.js'
    ],
    en: './src/entry/en.js',
    zh: './src/entry/zh.js',
    vendor: [
      // 'babel-polyfill',
      '@babel/polyfill',
      'echarts',
      'moment',
      'js-yaml',
      'codemirror',
      'jquery'
    ],
  },

  resolve: {
    modules: [
      path.join(__dirname, '../src'),
      'node_modules',
    ],
    extensions: [ '.js', '.jsx', '.json' ],
    alias: {
      '@': path.join(__dirname, '../src'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    publicPath: '/public/'
  },

  /* externals: {
    'clipboard': 'Clipboard',
    'emojify.js': 'emojify'
  }, */

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
  　　　 test: /\.(jpe?g|png|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 5192, // 5KB 以下图片自动转成 base64 码
          name: 'img/[name].[hash:8].[ext]',
        },
  　　 },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          /* {
            loader: 'postcss-loader',
            options: postcssConfig,
          }, */
        ],
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
          /* {
            loader: 'postcss-loader',
            options: postcssConfig,
          }, */
        ],
      }
    ]
  },

  plugins: [
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./manifest.json'),
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.js',
      // (Give the chunk a different name)
      minChunks: Infinity,
      // (with more entries, this ensures that no other module
      //  goes into the vendor chunk)
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'commons.js',
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ]
}
