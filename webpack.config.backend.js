/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * App webpack server config
 *
 * v0.1 - 2017-12-13
 * @author Zhangpc
 */

const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const nodeModules = {}
const env = process.env
const clientConfig = require('./webpack.config.prod')
const _ = require('lodash')
const rules = _.cloneDeep(clientConfig.module.rules)
const site = 'tenxcloud.com'

rules[0] = {
  test: /\.js$/,
  loader: 'babel-loader',
  exclude: [
    path.resolve(__dirname, './node_modules'),
  ],
  options: {
    babelrc: false,
    presets: [
      [
        '@babel/env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
    ],
  },
}

fs.readdirSync(path.join(__dirname, './node_modules')).filter(x => {
  return [ '.bin' ].indexOf(x) === -1
}).forEach(mod => {
  nodeModules[mod] = 'commonjs ' + mod
})

module.exports = {
  // devtool: 'source-map',
  entry: [
    './app.js'
  ],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'app.js',
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  externals: nodeModules,
  context: __dirname,
  node: {
    __filename: false,
    __dirname: false,
  },
  module: {
    rules,
  },
  resolve: {
    extensions: [ '.js', '.json' ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
      'process.env.RUNNING_MODE': JSON.stringify(env.RUNNING_MODE),
    }),
    new webpack.BannerPlugin({
      banner: `Licensed Materials - Property of ${site}\n(C) Copyright 2017~2020 ${site}. All Rights Reserved.\nhttp://${site}`,
    }),
    /* new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),*/
  ],
}
