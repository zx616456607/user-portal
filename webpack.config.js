/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App webpack config
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
'use strict'

const webpack = require('webpack')
const packageJson = require('./package.json')
const env = process.env
const plugin = new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
  'process.env.RUNNING_MODE': JSON.stringify(env.RUNNING_MODE),
  'process.env.TENX_PORTAL_VERSION': JSON.stringify(packageJson.version),
})
let config

if (process.env.NODE_ENV === 'production') {
  config = require('./webpack.config.prod')
} else {
  config = require('./webpack.config.dev')
}

config.plugins.unshift(plugin)
module.exports = config