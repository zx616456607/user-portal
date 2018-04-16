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
var WebpackMd5Hash = require('webpack-md5-hash')
var tsImportPluginFactory = require('ts-import-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var postcssConfig = require('./webpack.config.postcss')

module.exports = {
  // devtool: 'cheap-source-map',
  // !入口文件的顺序不能动！
  entry: {
    main: './src/entry/index.js',
    zh: './src/entry/zh.js',
    en: './src/entry/en.js',
    vendor: [
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
      path.join(__dirname, './src'),
      'node_modules',
    ],
    extensions: [ '.js', '.jsx', '.json', '.ts', '.tsx' ],
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
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            getCustomTransformers: () => ({
              before: [
                tsImportPluginFactory({
                  libraryName: 'antd',
                  libraryDirectory: 'lib',
                })
              ]
            }),
            compilerOptions: {
              module: 'es2015'
            }
          },
        },
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          // 'thread-loader',
          'babel-loader',
        ]
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
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
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
        }),
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true,
              },
            },
            {
              loader: 'less-loader',
              options: {
                modifyVars: {
                  // "@primary-color": "#2db7f5",
                  // "@success-color": "#5cb85c",
                  // "@warning-color": "#ffbf00",
                  // "@error-color": "#f85a5a",
                  // "@a-hover-color": "#57cfff",
                  // "@font-size-base": "12px",
                  "@icon-url": "'/font/antd_local_webfont/1.11/iconfont'"
                }
              }
            },
            {
              loader: 'postcss-loader',
              options: postcssConfig,
            },
          ],
        }),
      },
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: false, // disabled inject
      chunks: ['zh', 'main', 'commons', 'vendor' ],
      minify: {
        collapseWhitespace: true,
        minifyJS: true,
      },
      title: '<%= title %>',
      body: '<%- body %>',
      intl_locale: '<%= intl_locale %>',
      randomStr: '<%= +new Date() %>',
      timestrap: (+ new Date()),
      template: path.join(__dirname, 'src/templates/index.html'),
      filename: path.join(__dirname, 'index.html'),
    }),
    // 设置分块传输最大数量和最小 size
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 18}),
    new webpack.optimize.MinChunkSizePlugin({minChunkSize: 200000}),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      comments: false,
      unused: true,
      dead_code: true,
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new ExtractTextPlugin({
      filename: 'styles.[contenthash:8].css',
      allChunks: true,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.[chunkhash:8].js',
      // (Give the chunk a different name)
      minChunks: Infinity,
      // (with more entries, this ensures that no other module
      //  goes into the vendor chunk)
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'commons.[hash:8].js',
    }),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
}