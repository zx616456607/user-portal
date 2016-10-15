/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App webpack config
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./webpack.config.prod')
} else {
  module.exports = require('./webpack.config.dev')
}