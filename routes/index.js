/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Index route
 * 
 * v0.1 - 2016-09-05
 * @author Zhangpc
 */
'use strict'

const indexCtl = require('../controllers')

module.exports = function (Router) {
  const router = new Router()
  
  router.get('/', indexCtl.index)
  router.get(/^(\/app_manage|\/app_manage\/[a-zA-Z0-9_-]+|\/app_manage\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  router.get(/^(\/app_center|\/app_center\/[a-zA-Z0-9_-]+|\/app_center\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  router.get(/^(\/database_cache|\/database_cache\/[a-zA-Z0-9_-]+|\/database_cache\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  router.get(/^(\/container|\/container\/[a-zA-Z0-9_-]+|\/container\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  
  return router.routes()
}