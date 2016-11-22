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
  devtool: 'source-map',

  entry: {
    main: [
      hotMiddleWareConfig,
      './src/entry/index.js'
    ],
    en: './src/entry/en.js',
    zh: './src/entry/zh.js'
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    publicPath: '/public/'
  },

  externals: {
    'clipboard': 'Clipboard',
    'emojify.js': 'emojify'
  },

  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules/,
      include: __dirname
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract(
        'css?sourceMap'
      )
    }, {
      test: /\.less$/,
      loader: ExtractTextPlugin.extract(
        // activate source maps via loader query
        'css?sourceMap!' +
        'less?sourceMap'
      )
    }]
  },

  plugins: [
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./manifest.json'),
    }),
    new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('[name].css'),
    // new ExtractTextPlugin('[name].css', { allChunks: true }), // or user style-loader ?
    new webpack.BannerPlugin('Licensed Materials - Property of tenxcloud.com\n(C) Copyright 2016 TenxCloud. All Rights Reserved.\nhttps://www.tenxcloud.com')
  ]
}
