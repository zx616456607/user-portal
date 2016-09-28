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
const serviceController = require('../controllers/service_manage')
const containerController = require('../controllers/container')
const configController = require('../controllers/configs')

module.exports = function (Router) {
  const router = new Router({
    prefix: '/api/v2'
  })

  // Storage
  router.get('/storage-pools/:pool/volumes', storageController.getStorageListByPool)
  router.post('/storage-pools/:pool/volumes/batch-delete', storageController.deleteStorage)
  router.post('/storage-pools/:pool/volumes', storageController.createStorage)
  router.put('/storage-pools/:pool/volumes/format', storageController.formateStorage)
  router.put('/storage-pools/:pool/volumes/size', storageController.resizeStorage)
  router.get('/storage-pools/:pool/volumes/:name', storageController.getStorageDetail)

  // Apps 
  router.get('/clusters/:master/apps', appController.getApps)
  router.get('/clusters/:master/apps/:app_name/services', appController.getAppServices)
  
  // Services
  router.get('/clusters/:master/services/:service_name/containers', serviceController.getServiceContainers)

  // Containers
  router.get('/clusters/:master/containers', containerController.getContainers)
  
  //Configs
  router.get('/clusters/:master/configs',configController.getConfigGroup)
  
  return router.routes()
}