/**
 * API handler for hub
 *
 * v0.1 - 2016-09-22
 *
 * @author Zhangpc
 */

'use strict';

const logger = require('../utils/logger.js').getLogger('api-router')
const volumeController = require('../controllers/volume')
const appController = require('../controllers/app_manage')
const serviceController = require('../controllers/service_manage')
const containerController = require('../controllers/container')
const configController = require('../controllers/configs')
const registryController = require('../controllers/registry')

module.exports = function (Router) {
  const router = new Router({
    prefix: '/api/v2'
  })

  // Storage
  router.get('/storage-pools/:pool/volumes', volumeController.getVolumeListByPool)
  router.post('/storage-pools/:pool/volumes/batch-delete', volumeController.deleteVolume)
  router.post('/storage-pools/:pool/volumes', volumeController.createVolume)
  router.put('/storage-pools/:pool/volumes/format', volumeController.formateVolume)
  router.put('/storage-pools/:pool/volumes/size', volumeController.resizeVolume)
  router.get('/storage-pools/:pool/volumes/:name', volumeController.getVolumeDetail)
  router.post('/storage-pools/:pool/volumes/:name/beforeimport', volumeController.beforeUploadFile)
  router.post('/storage-pools/:pool/volumes/:name/import', volumeController.uploadFile)
  router.get('/storage-pools/:pool/volumes/:name/filehistory', volumeController.getFileHistory)
  // Apps 
  router.post('/clusters/:cluster/apps', appController.createApp)
  router.get('/clusters/:cluster/apps', appController.getApps)
  router.post('/clusters/:cluster/apps/batch-delete', appController.deleteApps)
  router.put('/clusters/:cluster/apps/batch-stop', appController.stopApps)
  router.put('/clusters/:cluster/apps/batch-start', appController.startApps)
  router.put('/clusters/:cluster/apps/batch-restart', appController.restartApps)
  router.put('/clusters/:cluster/apps/batch-status', appController.getAppsStatus)
  router.get('/clusters/:cluster/apps/:app_name/services', appController.getAppServices)
  router.post('/clusters/:cluster/apps/:app_name/services', appController.addService)
  router.post('/clusters/:cluster/apps/:app_name/services/batch-delete', appController.deleteServices)
  router.get('/clusters/:cluster/apps/:app_name/orchfile', appController.getAppOrchfile)
  // spi
  router.get('/clusters/:cluster/apps/:app_name/logs', appController.getAppLogs)

  // Services
  router.put('/clusters/:cluster/services/batch-start', serviceController.startServices)
  router.put('/clusters/:cluster/services/batch-stop', serviceController.stopServices)
  router.put('/clusters/:cluster/services/batch-restart', serviceController.restartServices)
  router.get('/clusters/:cluster/services/batch-status', serviceController.getServicesStatus)
  router.get('/clusters/:cluster/services/:service_name/detail', serviceController.getServiceDetail)
  router.get('/clusters/:cluster/services/:service_name/containers', serviceController.getServiceContainers)
  router.put('/clusters/:cluster/services/:service_name/manualscale', serviceController.manualScaleService)
  router.put('/clusters/:cluster/services/:service_name/autoscale', serviceController.autoScaleService)
  router.put('/clusters/:cluster/services/:service_name/quota', serviceController.changeServiceQuota)
  router.put('/clusters/:cluster/services/:service_name/ha', serviceController.changeServiceHa)
  // spi
  router.post('/clusters/:cluster/services/:service_name/domain', serviceController.bindServiceDomain)

  // Containers
  router.get('/clusters/:cluster/containers', containerController.getContainers)
  router.get('/clusters/:cluster/containers/:container_name/detail', containerController.getContainerDetail)
  
  // Configs
  router.get('/clusters/:cluster/configgroups',configController.getConfigGroup)
  // router.get('/clusters/:cluster/configgroups/:name',configController.getConfigGroupName)
  router.post('/clusters/:cluster/configs',configController.createConfigGroup)
  router.post('/clusters/:cluster/configs/delete',configController.deleteConfigGroup)

  // Registries
  router.get('/registries/:registry', registryController.getImages)
  router.get('/registries/:registry/:user/:name/tags', registryController.getImageTags)
  router.get('/registries/:registry/:user/:name/tags/:tag/configs', registryController.getImageConfigs)

  return router.routes()
}