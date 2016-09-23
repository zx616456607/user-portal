/**
 * API handler for hub
 *
 * v0.1 - 2016-09-22
 *
 * @author Zhangpc
 */

'use strict';

const logger         = require('../utils/logger.js').getLogger("api-router")
const storageController = require('../controllers/storage')


module.exports = function(Router) {
  const router = new Router({
    prefix: '/api/v1'
  })
  

  //Storage

  router.get('/storage/:master/list', storageController.getStorageListByMaster)
  router.post('/storage/delete', storageController.deleteStorage)
  return router.routes()
}