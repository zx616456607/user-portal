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
    symlinks: false,
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    publicPath: '/public/'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        // exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
        use: [{
          loader: "thread-loader",
          // 有同样配置的 loader 会共享一个 worker 池(worker pool)
          options: {
            // 产生的 worker 的数量，默认是 cpu 的核心数
            // workers: 2,

            // 一个 worker 进程中并行执行工作的数量
            // 默认为 20
            workerParallelJobs: 50,

            // 额外的 node.js 参数
            workerNodeArgs: [ '--max-old-space-size=1024' ],

            // 闲置时定时删除 worker 进程
            // 默认为 500ms
            // 可以设置为无穷大， 这样在监视模式(--watch)下可以保持 worker 持续存在
            poolTimeout: 2000,

            // 池(pool)分配给 worker 的工作数量
            // 默认为 200
            // 降低这个数值会降低总体的效率，但是会提升工作分布更均一
            poolParallelJobs: 50,

            // 池(pool)的名称
            // 可以修改名称来创建其余选项都一样的池(pool)
            name: "webpack-js-loader-pool"
          }
        },
          // 'cache-loader',
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
