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

const clusterRoutes = [
  {
    path: '/cluster/:clusterID/host/:cluster_name',
    component: require('../components/ClusterModule/ClusterDetail').default,
  },
  {
    path: '/cluster/globalConfig',
    component: require('../components/SettingModal/GlobalConfig').default,
  },
  {
    path: '/cluster',
    component: require('../components/ClusterModule').default,
  },{
    path: '/cluster/createWorkLoad',
    component: require('../../client/containers/AppStack/AppStackIframe').default,
  },{
    path: '/cluster/sysServiceManageDetail',
    component: require('../../client/containers/ClusterSysServiceManage/Detail').default,
  },
  {
    path: '/cluster/plugin',
    component: require('../components/ClusterModule/clusterPlugin').default,
  },
  {
    path: '/cluster/iaas',
    component: require('../../client/containers/IaasModule').default,
  },
  {
    path: '/cluster/cluster_autoscale',
    component: require('../../client/containers/ClusterModule/ClusterAutoScale').default,
  },
  {
    path: '/cluster/monitor',
    component: require('../../client/containers/Monitor').default,
  },
  {
    path: '/cluster/backup',
    component: require('../../client/containers/Monitor').default,
  },
  {
    path: '/cluster/alarmSetting',
    component: require('../../client/containers/Monitor').default,
  },
  {
    path: '/cluster/alarmRecord',
    component: require('../../client/containers/Monitor').default,
  },
  {
    path: '/cluster/integration',
    component: require('../components/IntegrationModule').default,
  },
  {
    path: '/cluster/integration/rightCloud',
    component: require('../../client/containers/IntegrationModule/RightCloud').default,
    indexRoute: {
      onEnter: (nextState, replace) => replace('/cluster/integration/rightCloud/host')
    },
    childRoutes: [{
      path: 'host',
      component: require('../../client/containers/IntegrationModule/RightCloud/HostManage').default,
    }, {
      path: 'env',
      component: require('../../client/containers/IntegrationModule/RightCloud/CloudEnv').default,
      indexRoute: {
        onEnter: (nextState, replace) => replace('/cluster/integration/rightCloud/env/disk')
      },
      childRoutes: [{
        path: 'disk',
        component: require('../../client/containers/IntegrationModule/RightCloud/Disk').default,
      }, {
        path: 'subnet',
        component: require('../../client/containers/IntegrationModule/RightCloud/Subnet').default,
      }, {
        path: 'virtual',
        component: require('../../client/containers/IntegrationModule/RightCloud/VirtualNet').default,
      }]
    }]
  },
  {
    path: '/cluster/create',
    component: require('../../client/containers/ClusterModule/CreateCluster').default,
  },
  {
    path: '/cluster/addHosts',
    component: require('../../client/containers/ClusterModule/CreateCluster/AddHosts').default,
  }
]

export default clusterRoutes
