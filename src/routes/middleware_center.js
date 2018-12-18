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
  component: require('../../client/containers/MiddlewareCenter/App/index').default,
}, {
  path: 'deploy/config',
  component: require('../../client/containers/MiddlewareCenter/DeployManage/DeployConfigs').default,
}, {
  path: 'deploy',
  component: require('../../client/containers/MiddlewareCenter/DeployManage/index.js').default,
}, {
  path: 'deploy/detail/:app_name',
  component: require('../../client/containers/MiddlewareCenter/DeployManage/DeployDetail').default,
}, {
  path: 'deploy/cluster-mysql-redis/:database',
  component: require('../../client/containers/MiddlewareCenter/DeployManage/DeployCluster/MysqlRedisDeploy').default,
}, {
  path: 'deploy/cluster-rabbitmq/rabbitmq',
  component: require('../../client/containers/MiddlewareCenter/DeployManage/DeployCluster/RabbitmqDeploy').default,
}, {
  path: 'deploy/cluster-stateful/:database',
  component: require('../../client/containers/MiddlewareCenter/DeployManage/DeployCluster/EsZkDeploy').default,
}, {
  path: 'deploy/cluster/detail/:database/:dbName',
  component: require('../../client/containers/MiddlewareCenter/DeployManage/ClusterDetail/OldClusterDetail/index').default,
}, {
  path: 'deploy/cluster/detail-rabbitmq/:database/:dbName',
  component: require('../../client/containers/MiddlewareCenter/DeployManage/ClusterDetail/RabbitMqDetail/index').default,
}]

export default middlewareCenterRoutes
