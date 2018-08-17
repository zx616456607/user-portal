/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.js page
 *
 * @author zhangtao
 * @date Friday August 17th 2018
 */
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./index.prod')
} else {
  module.exports = require('./index.dev')
}