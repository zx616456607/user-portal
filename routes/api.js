/**
 * API handler for hub
 *
 * v0.1 - 2016-09-22
 *
 * @author Zhangpc
 */

'use strict';

const logger = require('../utils/logger.js').getLogger('api-router')
const storageController = require('../controllers/storage')


module.exports = function (Router) {
  const router = new Router({
    prefix: '/api/v2'
  })

  //Storage
  router.get('/clusters/:master/storages', storageController.getStorageListByMaster)
  router.post('/clusters/:master/storages/delete', storageController.deleteStorage)
  
  return router.routes()
}