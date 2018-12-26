/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App webpack production config
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackMd5Hash = require('webpack-md5-hash')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const postcssConfig = require('./webpack.config.postcss')
const webpack_base = require('./webpack.config.base')
const webpackMerge = require('webpack-merge')
const UglifyJsPlugin=require('uglifyjs-webpack-plugin');
const customTheme = require('./theme.json')

const defaultTheme = {
  "@primary-color": "#2db7f5",
  "@success-color": "#5cb85c",
  "@warning-color": "#ffbf00",
  "@error-color": "#f85a5a",
  "@a-hover-color": "#57cfff",
  // "@font-size-base": "12px",
  "@icon-url": "'/font/antd_local_webfont/1.11/iconfont'",
}
const theme = Object.assign(defaultTheme, customTheme)

module.exports = webpackMerge(webpack_base, {
  mode: 'production',
  // devtool: 'cheap-source-map',
  // !入口文件的顺序不能动！
  entry: {
    main: './src/entry/index.js',
    zh: './src/entry/zh.js',
    en: './src/entry/en.js',
  },

  resolve: {
    alias: {
      '@': path.join(__dirname, './src'),
    },
  },

  output: {
    path: path.join(__dirname, 'static/bundles'),
    filename: '[name].[chunkhash:8].js',
    chunkFilename: 'chunk.[id].[chunkhash:8].js',
    publicPath: '/bundles/'
  },


  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          // 'thread-loader',
          'babel-loader',
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              minimize: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: postcssConfig,
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              minimize: true,
            },
          },
          {
            loader: 'less-loader',
            options: {
              modifyVars: theme,
            }
          },
          {
            loader: 'postcss-loader',
            options: postcssConfig,
          },
        ],
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false, // disabled inject
      chunks: [ 'zh', 'main', 'commons', 'vendors' ],
      minify: {
        collapseWhitespace: true,
        minifyJS: true,
      },
      title: '<%= title %>',
      body: '<%- body %>',
      intl_locale: '<%= intl_locale %>',
      randomStr: '<%= +new Date() %>',
      initialConfig: '<%- initialConfig %>',
      timestrap: (+ new Date()),
      template: path.join(__dirname, 'src/templates/index.html'),
      filename: path.join(__dirname, 'index.html'),
    }),
    // 设置分块传输最大数量和最小 size
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 18}),
    new webpack.optimize.MinChunkSizePlugin({minChunkSize: 200000}),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new MiniCssExtractPlugin({
      filename: 'styles.[contenthash:8].css',
      chunkFilename: '[id].[contenthash:8].css',
      // allChunks: true,
    }),
  ],
})
