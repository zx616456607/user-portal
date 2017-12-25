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

const cas = require('../../../3rd_account/cas')
const middlewares = require('../../../services/middlewares')

module.exports = function (Router) {
  const router = new Router({})
  router.get('/cas/login', cas.casLogin, middlewares.verifyUser)
  return router.routes()
}
