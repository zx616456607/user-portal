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
  // component: require('../../client/containers/MiddlewareCenter/DeployManage/index-bak.js').default,
}, {
  path: 'deploy/detail/:app_name',
  component: require('../../client/containers/MiddlewareCenter/DeployManage/DeployDetail').default,
}, {
  path: 'deploy/cluster/:database',
  component: require('../../client/containers/MiddlewareCenter/DeployManage/DeployCluster/MysqlRedisDeploy').default,
}, {
  path: 'deploy/cluster/detail/:database/:dbName',
  component: require('../../client/containers/MiddlewareCenter/DeployManage/ClusterDetail').default,
}]

export default middlewareCenterRoutes
