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
const mode = require('../configs/model').mode
const middlewares = require('../services/middlewares')

module.exports = function (Router) {
  const router = new Router()
  router.use(middlewares.auth)

  // for frontend reload page
  router.get('/', indexCtl.index)
  router.get('/quickentry', indexCtl.index)
  router.get(/^(\/app_manage|\/app_manage\/[a-zA-Z0-9_-]+|\/app_manage\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+.+)(\/|)$/, indexCtl.index)
  router.get(/^(\/app_center|\/app_center\/[a-zA-Z0-9_-]+|\/app_center\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+|\/app_center\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  router.get(/^(\/database_cache|\/database_cache\/[a-zA-Z0-9_-]+|\/database_cache\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  router.get(/^(\/container|\/container\/[a-zA-Z0-9_-]+|\/container\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  router.get(/^(\/backup|\/backup\/[a-zA-Z0-9_-]+|\/backup\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  router.get(/^(\/devops|\/devops\/[a-zA-Z0-9_-]+|\/devops\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+|\/devops\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  router.get(/^(\/account|\/account\/[a-zA-Z0-9_-]+|\/account\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+|\/account\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  router.get(/^(\/manange_monitor|\/manange_monitor\/[a-zA-Z0-9_-]+|\/manange_monitor\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  router.get(/^(\/middleware_center|\/middleware_center\/[a-zA-Z0-9_-]+|\/middleware_center\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)/, indexCtl.index)
  // router.get(/^(\/workloads|\/workloads\/[a-zA-Z0-9_-]+|\/workloads\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  // router.get(/^(\/app\-stack|\/app\-stack\/[a-zA-Z0-9_-]+|\/app\-stack\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  // router.get(/^(\/net\-management|\/net\-management\/[a-zA-Z0-9_-]+|\/net\-management\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  router.get(/^(\/storage\-management|\/storage\-management\/[a-zA-Z0-9_-]+|\/storage\-management\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  // iframe portal routes
  router.get(/^\/app\-stack(\/|)/, indexCtl.index)
  router.get(/^\/workloads(\/|)/, indexCtl.index)
  router.get(/^\/net\-management(\/|)/, indexCtl.index)
  router.get(/^\/ai\-deep\-learning(\/|)/, indexCtl.index)
  if (mode === 'enterprise') {
    router.get(/^(\/tenant_manage|\/tenant_manage\/[a-zA-Z0-9_-]+|\/tenant_manage\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+|\/tenant_manage\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
    router.get(/^(\/setting|\/setting\/[a-zA-Z0-9_-]+|\/setting\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+|\/setting\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
    router.get(/^(\/cluster|\/cluster\/[a-zA-Z0-9\._-]+|\/cluster\/[a-zA-Z0-9\._-]+\/[\.a-zA-Z0-9_-]+|\/cluster\/[a-zA-Z0-9\._-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+|\/cluster\/[a-zA-Z0-9\._-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
    router.get(/^(\/OpenStack|\/OpenStack\/[a-zA-Z0-9\._-]+|\/OpenStack\/[a-zA-Z0-9\._-]+\/[\.a-zA-Z0-9_-]+|\/OpenStack\/[a-zA-Z0-9\._-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
    router.get(/^(\/work-order|\/work-order\/create|\/work-order\/system-notice|\/work-order\/my-order\/[a-zA-Z0-9_-]+|\/work-order\/my-order|\/work-order\/system-notice\/[a-zA-Z0-9_-]+)(\/|)$/, indexCtl.index)
  }
  return router.routes()
}
