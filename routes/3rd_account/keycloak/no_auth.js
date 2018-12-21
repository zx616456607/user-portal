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

const keycloak = require('../../../3rd_account/keycloak')
const middlewares = require('../../../services/middlewares')

module.exports = function (Router) {
  const router = new Router({})
  router.get('/keycloak/login', keycloak.keycloakLogin, middlewares.verifyUser)
  return router.routes()
}
