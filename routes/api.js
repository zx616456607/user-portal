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
const metricsController = require('../controllers/metrics')

module.exports = function (Router) {
  const router = new Router({
    prefix: '/api/v2'
  })

  // Storage
  router.get('/storage-pools/:pool/:cluster/volumes', volumeController.getVolumeListByPool)
  router.post('/storage-pools/:pool/:cluster/volumes/batch-delete', volumeController.deleteVolume)
  router.post('/storage-pools/:pool/:cluster/volumes', volumeController.createVolume)
  router.put('/storage-pools/:pool/:cluster/volumes/format', volumeController.formateVolume)
  router.put('/storage-pools/:pool/:cluster/volumes/size', volumeController.resizeVolume)
  router.get('/storage-pools/:pool/:cluster/volumes/:name', volumeController.getVolumeDetail)
  router.post('/storage-pools/:pool/:cluster/volumes/:name/beforeimport', volumeController.beforeUploadFile)
  router.post('/storage-pools/:pool/:cluster/volumes/:name/import', volumeController.uploadFile)
  router.get('/storage-pools/:pool/:cluster/volumes/:name/filehistory', volumeController.getFileHistory)
  router.get('/storage-pools/:pool/:cluster/volumes/:name/bindinfo', volumeController.getBindInfo)
  router.get('/storage-pools/:pool/:cluster/volumes/:name/exportfile', volumeController.exportFile)
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
  router.get('/clusters/:cluster/apps/:app_name/orchfile', appController.getAppOrchfile)
  router.get('/clusters/:cluster/apps/:app_name/detail', appController.getAppDetail)
  // spi
  router.get('/clusters/:cluster/apps/:app_name/logs', appController.getAppLogs)
  router.get('/clusters/:cluster/apps/:app_name/existence', appController.checkAppName)
  router.get('/clusters/:cluster/services/:service/existence', appController.checkServiceName)

  // Services
  router.put('/clusters/:cluster/services/batch-start', serviceController.startServices)
  router.put('/clusters/:cluster/services/batch-stop', serviceController.stopServices)
  router.put('/clusters/:cluster/services/batch-restart', serviceController.restartServices)
  router.put('/clusters/:cluster/services/batch-quickrestart', serviceController.quickRestartServices)
  router.post('/clusters/:cluster/services/batch-delete', serviceController.deleteServices)
  router.get('/clusters/:cluster/services/batch-status', serviceController.getServicesStatus)
  router.get('/clusters/:cluster/services/:service_name/detail', serviceController.getServiceDetail)
  router.get('/clusters/:cluster/services/:service_name/containers', serviceController.getServiceContainers)
  router.put('/clusters/:cluster/services/:service_name/manualscale', serviceController.manualScaleService)
  router.get('/clusters/:cluster/services/:service_name/autoscale', serviceController.getServiceAutoScale)
  router.put('/clusters/:cluster/services/:service_name/autoscale', serviceController.autoScaleService)
  router.del('/clusters/:cluster/services/:service_name/autoscale', serviceController.delServiceAutoScale)
  router.put('/clusters/:cluster/services/:service_name/quota', serviceController.changeServiceQuota)
  router.put('/clusters/:cluster/services/:service_name/ha', serviceController.changeServiceHa)
  router.put('/clusters/:cluster/services/:service_name/rollingupdate', serviceController.rollingUpdateService)
  router.get('/clusters/:cluster/services/:service_name/events', serviceController.getServiceDetailEvents)
  router.post('/clusters/:cluster/services/:service_name/logs', serviceController.getServiceLogs)
  router.get('/clusters/:cluster/services/:service_name/k8s-service', serviceController.getK8sService)
  // spi
  router.post('/clusters/:cluster/services/:service_name/binddomain', serviceController.bindServiceDomain)
  router.put('/clusters/:cluster/services/:service_name/binddomain', serviceController.deleteServiceDomain)
  // Containers
  router.get('/clusters/:cluster/containers', containerController.getContainers)
  router.get('/clusters/:cluster/containers/:container_name/detail', containerController.getContainerDetail)
  router.get('/clusters/:cluster/containers/:container_name/events', containerController.getContainerDetailEvents)
  router.post('/clusters/:cluster/containers/:name/logs', containerController.getContainerLogs)

  // Configs
  router.get('/clusters/:cluster/configgroups', configController.getConfigGroup)
  router.get('/clusters/:cluster/configgroups/:name', configController.getConfigGroupName)
  router.get('/clusters/:cluster/configgroups/:group/configs/:name', configController.loadConfigFiles)
  router.post('/clusters/:cluster/configs', configController.createConfigGroup)
  router.post('/clusters/:cluster/configgroups/:group/configs/:name', configController.createConfigFiles)
  router.put('/clusters/:cluster/configgroups/:group/configs/:name', configController.updateConfigName)
  router.post('/clusters/:cluster/configs/delete', configController.deleteConfigGroup)
  router.post('/clusters/:cluster/configgroups/:group/configs-batch-delete', configController.deleteConfigFiles)

  // Registries of TenxCloud
  router.get('/registries/:registry', registryController.getImages)
  router.get('/registries/:registry/:user/:name/detailInfo', registryController.getImageInfo)
  router.get('/registries/:registry/:user/:name/tags', registryController.getImageTags)
  router.get('/registries/:registry/:user/:name/tags/:tag/configs', registryController.getImageConfigs)
  router.get('/registries/:registry/private', registryController.getPrivateImages)
  router.get('/registries/:registry/favourite', registryController.getFavouriteImages)
  router.put('/registries/:registry/:image*', registryController.updateImageInfo)

  // Private docker registry integration
  router.get('/docker-registry', registryController.getPrivateRegistries)
  router.post('/docker-registry/:name', registryController.addPrivateRegistry)
  router.del('/docker-registry/:id', registryController.deletePrivateRegistry)
  // Docker registry spec API
  router.get('/docker-registry/:id/images', registryController.specListRepositories)
  router.get('/docker-registry/:id/images/:image*/tags', registryController.specGetImageTags)
  router.get('/docker-registry/:id/images/:image*/tags/:tag', registryController.specGetImageTagInfo)
  // Tag size is merged to specGetImageTagConfig
  //router.get('/docker-registry/:id/images/:image*/tags/:tag/size', registryController.specGetImageTagSize)
  router.post('/docker-registry/update', registryController.imageStore)

  // Metrics
  router.get('/clusters/:cluster/containers/:container_name/metrics', metricsController.getContainerMetrics)
  router.get('/clusters/:cluster/services/:service_name/metrics', metricsController.getServiceMetrics)
  router.get('/clusters/:cluster/apps/:app_name/metrics', metricsController.getAppMetrics)

  return router.routes()
}