/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App webpack production config
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  // devtool: 'source-map',

  entry: {
    main: './src/entry/index.js',
    en: './src/entry/en.js',
    zh: './src/entry/zh.js'
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },

  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '',
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    publicPath: '/js/'
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
        'css'
      )
    }, {
      test: /\.less$/,
      loader: ExtractTextPlugin.extract(
        // activate source maps via loader query
        'css!' +
        'less'
      )
    }]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('[name].css', { allChunks: true }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.BannerPlugin('Licensed Materials - Property of tenxcloud.com\n(C) Copyright 2016 TenxCloud. All Rights Reserved.\nhttps://www.tenxcloud.com')
  ]
}