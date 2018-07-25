/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * App manage routes
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/

const appManageRoutes = [{
  path: 'detail/:app_name',
  component: require('../components/AppModule/AppDetail').default,
}, {
  path: 'app_create',
  component: require('../components/AppModule/AppCreate').default,
  indexRoute: {
    component: require('../components/AppModule/AppCreate/CreateModel').default,
  },
  childRoutes: [{
    path: 'app_store',
    component: require('../components/AppModule/AppCreate/AppStore').default,
  }, {
    path: 'compose_file',
    component: require('../components/AppModule/AppCreate/ComposeFile').default,
  }]
}, {
    path: 'deploy_wrap',
    component: require('../components/AppModule/AppCreate/DeployWrap').default,
}, {
  path: 'app_create/quick_create',
  component: require('../components/AppModule/QuickCreateApp').default,
}, {
  path: 'service',
  indexRoute: {
    component: require('../components/AppModule/AllServiceList').default,
  },
}, {
  path: 'container',
  indexRoute: {
    component: require('../components/ContainerModule/ContainerList').default,
  },
  childRoutes: [{
    path: ':container_name',
    component: require('../components/ContainerModule/ContainerDetail').default,
  }]
}, {
  path: 'storage',
  component: require('../components/StorageModule').default,
  indexRoute: {
    onEnter: (nextState, replace) => replace('/app_manage/storage/rbd')
  },
  childRoutes: [{
    path: 'shareMemory',
    onEnter: (nextState, replace) => replace('/app_manage/storage/shared')
  }, {
    path: 'hostMemory',
    onEnter: (nextState, replace) => replace('/app_manage/storage/host')
  }, {
    path: 'rbd',
    component: require('../components/StorageModule/Storage').default,
  },{
    path: 'shared',
    component: require('../components/StorageModule/ShareMemory').default,
  },{
    path: 'host',
    component: require('../components/StorageModule/HostMemory').default,
  }]
},{
  path: 'storage/exclusiveMemory/:pool/:cluster/:storage_name',
  component: require('../components/StorageModule/StorageDetail').default,
},{
  path: 'storage/host/:host_name',
  component: require('../components/StorageModule/HostMemory/HostStorageDetail').default,
},{
  path: 'storage/shared/:cluster/:share_name',
  component: require('../components/StorageModule/ShareMemory/ShareStorageDetail').default,
},{
  path: 'configs',
  component: require('../components/ServiceConfig').default,
  indexRoute: {
    component: require('../components/ServiceConfig/Service').default,
  },
  childRoutes: [{
    path: 'secrets',
    component: require('../components/ServiceConfig/Secrets').default
  }]
},{
  path: 'discover',
  // component: require('../components/ServiceConfig').default,
  indexRoute: {
    component: require('../../client/containers/ServiceDiscover').default,
  },
},{
  path: 'security_group',
  indexRoute: {
    component: require('../../client/containers/SecurityGroup').default,
  },
  childRoutes: [{
    path: 'create',
    component: require('../../client/containers/SecurityGroup/CreateSecurityGroup').default
  }, {
    path: ':name',
    component: require('../../client/containers/SecurityGroup/SecurityGroupDetail').default,
  }]
},{
  path: 'load_balance',
  indexRoute: {
    component: require('../components/AppModule/LoadBalance').default,
  },
  childRoutes: [{
    path: 'balance_config',
    component: require('../components/AppModule/LoadBalance/LoadBalanceConfig').default
  }]
}, {
  path: 'snapshot',
  indexRoute: {
    component: require('../components/AppModule/AppSnapshot').default,
  },
}, {
  path: 'network_isolation',
  indexRoute: {
    component: require('../components/AppModule/NetworkIsolation').default,
  },
}, {
  path: 'auto_scale',
  indexRoute: {
    component: require('../components/AppModule/AutoScale').default,
  },
},{
  path: 'vm_wrap',
  indexRoute: {
    component: require('../components/AppModule/VMWrap/VMServiceList').default,
  },
}, {
  path: 'vm_list',
  indexRoute: {
    component: require('../components/AppModule/VMWrap/VMList').default,
  },
}, {
  path: 'vm_wrap/create',
  indexRoute: {
    component: require('../components/AppModule/VMWrap/CreateService/CreateService').default,
  },
}]

export default appManageRoutes