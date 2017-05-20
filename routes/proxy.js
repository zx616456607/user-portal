/**
 * API handler for user portal
 *
 * v0.1 - 2017-05-19
 *
 * @author YangYuBiao
 */

const pluginsProxyController = require('../controllers/plugins_proxy')
const middlewares = require('../services/middlewares')

module.exports = function (Router) {
  const router = new Router({
  })
  router.use(middlewares.auth)

  //plugin proxy
  router.get('/proxy/clusters/:cluster/plugins/:plugins/', pluginsProxyController.pluginsProxy)
  router.post('/proxy/clusters/:cluster/plugins/:plugins/', pluginsProxyController.pluginsProxy)
  router.put('/proxy/clusters/:cluster/plugins/:plugins/', pluginsProxyController.pluginsProxy)
  router.delete('/proxy/clusters/:cluster/plugins/:plugins/', pluginsProxyController.pluginsProxy)

  //plugins static file
  router.get(/\/proxy\/clusters\/[-a-zA-z0-9_]+\/plugins\/[-a-zA-z0-9_]+(\/[-a-zA-z0-9_\.\/]+)?/, pluginsProxyController.pluginsProxy)
  return router.routes()
}
