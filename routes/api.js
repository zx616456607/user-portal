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
const appController = require('../controllers/app_manage')


module.exports = function (Router) {
  const router = new Router({
    prefix: '/api/v2'
  })

  // Storage
  router.get('/storage-pools/:pool/volumes', storageController.getStorageListByPool)
  router.post('/storage-pools/:pool/volumes/batch-delete', storageController.deleteStorage)
  
  // Apps 
  router.get('/clusters/:master/apps', appController.getApps)

  // Containers
  router.get('/clusters/:master/apps/:app_name/containers', appController.getContainers)
  

  return router.routes()
}