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
// var WebpackMd5Hash = require('webpack-md5-hash')

module.exports = {
  // devtool: 'cheap-source-map',

  entry: {
    main: './src/entry/index.js',
    en: './src/entry/en.js',
    zh: './src/entry/zh.js',
    // vendor: ['react', 'lodash', 'moment', 'codemirror', 'antd'],
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },

  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '',
    filename: '[name].js',
    chunkFilename: 'chunk.[id].js',
    // filename: '[name].[chunkhash].js',
    // chunkFilename: 'chunk.[id].[chunkhash].js',
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
    // 删除重复数据
    new webpack.optimize.DedupePlugin(),
    // 设置分块传输最大数量和最小size
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 18}),
    new webpack.optimize.MinChunkSizePlugin({minChunkSize: 200000}),
    // new webpack.optimize.CommonsChunkPlugin('common', 'common.[chunkhash].js'),
    new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    // new ExtractTextPlugin('index.[chunkhash].css', { allChunks: true }),
    new ExtractTextPlugin('index.css', { allChunks: true }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.BannerPlugin('Licensed Materials - Property of tenxcloud.com\n\
    (C) Copyright 2016 TenxCloud. All Rights Reserved.\n\
    https://www.tenxcloud.com'),
    // function() {
    //   this.plugin('done', function(stats) {
    //     require('fs').writeFileSync(
    //       path.join(__dirname, 'stats.json'),
    //       JSON.stringify(stats.toJson()))
    //   })
    // }
  ]
}