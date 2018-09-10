/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Middlerare center routes
 *
 * v0.1 - 2018-08-06
 * @author Zhangxuan
*/

const middlewareCenterRoutes = [{
  path: 'app',
  component: require('../../client/containers/MiddlewareCenter/App').default,
}, {
  path: 'app/config',
  component: require('../../client/containers/MiddlewareCenter/App/AppConfigs').default,
}, {
  path: 'deploy',
  component: require('../../client/containers/MiddlewareCenter/DeployManage').default,
}]

export default middlewareCenterRoutes
