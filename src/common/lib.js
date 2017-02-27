/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App require common modules
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

import './version'
import './polyfill'

if (process.env.RUNNING_MODE === 'standard') { // Magic code, do not change
  module.exports = require('./lib.standard')
} else {
  module.exports = require('./lib.enterprise')
}