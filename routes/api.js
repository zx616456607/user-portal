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
// const appController = require('../controllers/app_manage')


module.exports = function (Router) {
  const router = new Router({
    prefix: '/api/v2'
  })

  // Storage
  router.get('/storage-pools/:pool/storages', storageController.getStorageListByPool)
  router.post('/storage-pools/:pool/volumes/batch-delete', storageController.deleteStorage)
  // router.post('/clusters/:master/apps', appController.getApps)

  return router.routes()
}