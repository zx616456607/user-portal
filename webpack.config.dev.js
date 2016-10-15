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
    alias: {
      'antd': path.join(nodeModulesPath, '/antd'),
      // 'antd': path.join(nodeModulesPath, '/antd/dist/antd.js'),
      // 'babel-polyfill': path.join(nodeModulesPath, '/babel-polyfill/dist/polyfill.js'),
      'babel-polyfill': path.join(nodeModulesPath, '/babel-polyfill'),
      // 'classnames': path.join(nodeModulesPath, '/classnames'),
      // 'lodash': path.join(nodeModulesPath, '/lodash'),
      // 'react': path.join(nodeModulesPath, '/react/dist/react.js'),
      'normalizr': path.join(nodeModulesPath, '/normalizr'),
      'react': path.join(nodeModulesPath, '/react'),
      'react-redux': path.join(nodeModulesPath, '/react-redux/dist/react-redux.js'),
      'react-router': path.join(nodeModulesPath, '/react-router'),
      'react-router-redux': path.join(nodeModulesPath, '/react-router-redux'),
      'redux': path.join(nodeModulesPath, '/redux/dist/redux.js'),
      'redux-devtools': path.join(nodeModulesPath, '/redux-devtools'),
      'redux-devtools-log-monitor': path.join(nodeModulesPath, '/redux-devtools-log-monitor'),
      'redux-devtools-dock-monitor': path.join(nodeModulesPath, '/redux-devtools-dock-monitor'),
      'redux-logger': path.join(nodeModulesPath, '/redux-logger/dist/index.js'),
      'redux-thunk': path.join(nodeModulesPath, '/redux-thunk'),
    }
  },

  output: {
    path: path.join(__dirname, 'dist'),
    // filename: 'bundle.js',
    filename: '[name].js',
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
  devServer: {
    contentBase: "./public",//本地服务器所加载的页面所在的目录
    colors: false,//终端中输出结果为彩色
    historyApiFallback: true,//不跳转
    inline: true//实时刷新
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('[name].css'),
    new webpack.BannerPlugin('Licensed Materials - Property of tenxcloud.com\n(C) Copyright 2016 TenxCloud. All Rights Reserved.\nhttps://www.tenxcloud.com')
  ]
}
