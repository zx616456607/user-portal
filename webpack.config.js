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

let config

if (process.env.NODE_ENV === 'production') {
  config = require('./webpack.config.prod')
} else {
  config = require('./webpack.config.dev')
}

module.exports = config