/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
* Product modes
*
* v0.1 - 2016-12-13
* @author Zhangpc
*/

const constants = require('./constants')
if (process.env.RUNNING_MODE === constants.STANDARD_MODE) {
  module.exports = require('./model.standard')
} else {
  module.exports = require('./model.enterprise')
}
// For development, change mode here
// module.exports = require('./model.standard')