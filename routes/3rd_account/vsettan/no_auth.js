/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * No auth route
 *
 * v0.1 - 2017-02-18
 * @author Yangyubiao
*/
'use strict'

const vsettan = require('../../../3rd_account/vsettan')
const middlewares = require('../../../services/middlewares')

module.exports = function (Router) {
  const router = new Router({})
  router.get('/vsettan/login', vsettan.vsettanLogin, middlewares.verifyUser)
  return router.routes()
}
