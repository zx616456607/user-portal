const vmController = require('../../../3rd_account/openstack/vm')
const imageController = require('../../../3rd_account/openstack/image')
const networkController = require('../../../3rd_account/openstack/network')
const volumeController = require('../../../3rd_account/openstack/volume')
const middlewares = require('../../../services/middlewares')
const redirect = require('../../../3rd_account/openstack/redirect')
const validate = require('../../../3rd_account/openstack/validate')

module.exports = function (Router) {
  const router = new Router({
    prefix: '/api/v2/openstack'
  })
  router.use(function* (next) {
    if (this.query['_']) delete this.query['_']
    yield next
  })
  router.use(middlewares.auth)
  router.get("/", redirect.redirect)
  router.get('/servers', vmController.getServerList)
  router.post('/servers', vmController.createServer)
  router.get('/servers/:ID', vmController.getServerByID)
  router.delete('/servers/:ID', vmController.deleteByServerID)
  router.put('/servers/:ID/rename/:newName', vmController.renameServer)
  router.put('/servers/:ID/actions/:action', vmController.updateServer)

  router.get('/az', vmController.getAZList)

  router.get('/networks', networkController.getNetworkList)
  router.get('/networks/:networkID', networkController.getNetworkDetail)
  router.post('/networks', networkController.createNetwork)
  router.delete('/networks/:networkID', networkController.deleteByNetwordID)
  router.get('/networks/ports', networkController.getPortsList)
  router.get('/networks/ports/:portID', networkController.getPortsDetail)
  router.post('/networks/ports', networkController.createPorts)
  router.put('/networks/ports/:portID', networkController.putPorts)
  router.delete('/networks/ports/:portID', networkController.deleteByPortID)
  router.get('/networks/subnets', networkController.getSubnetsList)
  router.get('/networks/subnets/ownandcanuse', networkController.listOwnAndCanUseSubnet)
  router.get('/networks/subnets/:subnetID', networkController.getSubnetsDetail)
  router.post('/networks/subnets', networkController.createSubnets)
  router.put('/networks/subnets/:subnetID', networkController.updateSubnets)
  router.delete('/networks/subnets/:subnetID', networkController.deleteBySubnetID)
  router.get('/networks/floatingips', networkController.getFloatingipsList)
  router.get('/networks/floatingips/:floatingipID', networkController.getFloatingipsDetail)
  router.post('/networks/floatingips', networkController.createFloatingips)
  router.delete('/networks/floatingips/:floatingipID', networkController.deleteByFloatingipID)
  router.post('/networks/:serverID/floatingips/manage', networkController.ManageFloatingips)

  router.get('/networks/routers', networkController.getRoutersList)
  router.get('/networks/routers/:id/subnet', networkController.getBindSubnet)
  router.get('/networks/routers/:id', networkController.getRouterDetail)
  router.put('/networks/routers/:id', networkController.updateRouter)
  router.put('/networks/routers/:id/subnets/:subnet', networkController.routerBindSubnet)
  router.delete('/networks/routers/:id/subnets/:subnet', networkController.routerRemoveSubnet)
  router.post('/networks/routers', networkController.createRouter)
  router.delete('/networks/routers/:id', networkController.deleteRouter)


  router.get('/images', imageController.getImageList)
  router.get('/images/:imageID', imageController.getImageDetail)
  router.delete('/images/:imageID', imageController.deleteImage)
  router.post('/images', imageController.uploadImage)

  router.get('/flavors', vmController.getFlavorList)
  router.post('/flavors', vmController.createFlavor)
  router.delete('/flavors/:falvorID', vmController.deleteFlavor)

  router.get('/meter/cpu/:ID', vmController.getCPUUsageByServerID)
  router.get('/meter/memory/:ID', vmController.getMemoryUsageByServerID)
  router.get('/meter/diskwrite/:ID', vmController.getDiskWriteBytesRateByServerID)
  router.get('/meter/diskread/:ID', vmController.getDiskReadBytesRateByServerID)
  router.get('/meter/incoming/:ID', vmController.getIncomingBytesRateByVMID)
  router.get('/meter/outcoming/:ID', vmController.getOutgoingBytesRateByVMID)

  router.get('/resource', vmController.getResourceInfo)

  router.get('/volumes/types', volumeController.getVolumeTypes)
  router.get('/volumes', volumeController.getVolumes)
  router.post('/volumes', volumeController.createVolumes)
  router.put('/volumes/:volumeID/', volumeController.updateVolumes)
  router.put('/volumes/:volumeID/actions/:action', volumeController.volumeAction)
  router.delete('/volumes/:volumeID', volumeController.deleteVolumes)
  router.post('/volumes/snapshots', volumeController.createVolumesSnapshot)
  router.get('/volumes/snapshots', volumeController.getSnapshotList)
  router.delete('/volumes/snapshots/:snapshotID', volumeController.deleteSnapshot)
  router.post('/validate', validate.validateConfig)
  return router.routes()
}