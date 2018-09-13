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
  path: 'deploy/config',
  component: require('../../client/containers/MiddlewareCenter/DeployManage/DeployConfigs').default,
}, {
  path: 'deploy',
  component: require('../../client/containers/MiddlewareCenter/DeployManage').default,
}, {
  path: 'deploy/detail/:app_name',
  component: require('../../client/containers/MiddlewareCenter/DeployManage/DeployDetail').default,
}]

export default middlewareCenterRoutes
