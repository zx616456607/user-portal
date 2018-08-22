/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * No auth route
 *
 * v0.1 - 2018-08-09
 * @author Lihaorong
*/
'use strict'

const saml2 = require('../../../3rd_account/saml2')
const middlewares = require('../../../services/middlewares')

module.exports = function (Router) {
  const router = new Router({})
  router.get('/saml2/login', saml2.login)
  router.post('/saml2/logout', saml2.logout)
  router.get('/saml2/metadata', saml2.metadata)
  router.post('/saml2/consume', saml2.consume, middlewares.verifyUser)
  return router.routes()
}
