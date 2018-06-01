/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * integration routes
 *
 * v0.1 - 2017-1-22
 * @author GaoJian
*/

const clusterRoutes = [{
  path: ':clusterID/:cluster_name',
  component: require('../components/ClusterModule/ClusterDetail').default,

}, {
  path: '/cluster/globalConfig',
  component: require('../components/SettingModal/GlobalConfig').default,
},{
  path: '/cluster',
  component: require('../components/ClusterModule').default,
},{
  path: '/cluster/cluster_autoscale',
  component: require('../../client/containers/ClusterModule/ClusterAutoScale').default,
},{
  path: '/cluster/monitor',
  component: require('../../client/containers/Monitor').default,
}]

export default clusterRoutes
