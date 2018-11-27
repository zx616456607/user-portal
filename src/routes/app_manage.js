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
    // component: require('../components/StorageModule/Storage').default,
    onEnter: (nextState, replace) => {
      const { location: { search, hash } = {} } = nextState
      replace(`/storage-management/privateStorage${search}${hash}`)
    }
  },{
    path: 'shared',
    // component: require('../components/StorageModule/ShareMemory').default,
    onEnter: (nextState, replace) => {
      const { location: { search, hash } = {} } = nextState
      replace(`/storage-management/shareStorage${search}${hash}`)
    }
  },{
    path: 'host',
    // component: require('../components/StorageModule/HostMemory').default,
    onEnter: (nextState, replace) => {
      const { location: { search, hash } = {} } = nextState
      replace(`/storage-management/localStorage${search}${hash}`)
    }
  }]
},{
  path: 'storage/exclusiveMemory/:pool/:cluster/:storage_name',
  // component: require('../components/StorageModule/StorageDetail').default,
  onEnter: (nextState, replace) => {
    const { location: { search, hash } = {}, params: { pool, cluster, storage_name }= {} } = nextState
    replace(`/storage-management/exclusiveMemory/${pool}/${cluster}/${storage_name}${search}${hash}`)
  }
},{
  path: 'storage/host/:host_name',
  // component: require('../components/StorageModule/HostMemory/HostStorageDetail').default,
  onEnter: (nextState, replace) => {
    const { location: { search, hash } = {}, params: { host_name }= {} } = nextState
    replace(`/storage-management/localStorage/${host_name}${search}${hash}`)
  }
},{
  path: 'storage/shared/:cluster/:share_name',
  // component: require('../components/StorageModule/ShareMemory/ShareStorageDetail').default,
  onEnter: (nextState, replace) => {
    const { location: { search, hash } = {}, params: { cluster, share_name }= {} } = nextState
    replace(`/storage-management/shareStorage/${cluster}/${share_name}${search}${hash}`)
  }
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
    // component: require('../../client/containers/ServiceDiscover').default,
    onEnter: (nextState, replace) => {
      const { location: { search, hash } = {} } = nextState
      replace(`/net-management/dnsRecord${search}${hash}`)
    }
  },
},{
  path: 'security_group',
  indexRoute: {
    // component: require('../../client/containers/SecurityGroup').default,
    onEnter: (nextState, replace) => {
      const { location: { search, hash } = {} } = nextState
      replace(`/net-management/securityGroup${search}${hash}`)
    }
  },
  childRoutes: [{
    path: 'create',
    // component: require('../../client/containers/SecurityGroup/CreateSecurityGroup').default
    onEnter: (nextState, replace) => {
      const { location: { search, hash } = {} } = nextState
      replace(`/net-management/securityGroup/create${search}${hash}`)
    }
  }, {
    path: 'network_isolation',
    indexRoute: {
      // component: require('../components/AppModule/NetworkIsolation').default,
      onEnter: (nextState, replace) => {
        const { location: { search, hash } = {} } = nextState
        replace(`/net-management/securityGroup/network_isolation${search}${hash}`)
      }
    },
  }, {
    path: 'edit/:name',
    indexRoute: {
      // component: require('../../client/containers/SecurityGroup/CreateSecurityGroup').default,
      onEnter: (nextState, replace) => {
        const { location: { search, hash } = {}, params: { name } = {} } = nextState
        replace(`/net-management/securityGroup/edit/${name}${search}${hash}`)
      }
    },
  }, {
    path: ':name',
    // component: require('../../client/containers/SecurityGroup/SecurityGroupDetail').default,
    onEnter: (nextState, replace) => {
      const { location: { search, hash } = {}, params: { name } = {}  } = nextState
      replace(`/net-management/securityGroup/${name}${search}${hash}`)
    }
  }]
},{
  path: 'load_balance',
  indexRoute: {
    // component: require('../components/AppModule/LoadBalance').default,
    onEnter: (nextState, replace) => {
      const { location: { search, hash } = {} } = nextState
      replace(`/net-management/appLoadBalance${search}${hash}`)
    }
  },
  childRoutes: [{
    path: 'balance_config',
    // component: require('../components/AppModule/LoadBalance/LoadBalanceConfig').default
    onEnter: (nextState, replace) => {
      const { location: { search, hash } = {} } = nextState
      replace(`/net-management/appLoadBalance/balance_config${search}${hash}`)
    }
  }]
}, {
  path: 'snapshot',
  indexRoute: {
    // component: require('../components/AppModule/AppSnapshot').default,
    onEnter: (nextState, replace) => {
      const { location: { search, hash } = {} } = nextState
      replace(`/storage-management/snapshot`)
    }
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
},
{
  path: 'vm_wrap/import',
  indexRoute: {
    component: require('../../client/containers/AppModule/VMWrap/ImportService').default,
  },
}
]

export default appManageRoutes