/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Root routes - enterprise
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/

const rootRoutes = {
  childRoutes: [
    {
    path: '/password',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../containers/Activation/Password').default)
      })
    }
  },
  {
    path: '/activation',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../containers/Activation').default)
      })
    }
  },
  {
    path: '/login',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../containers/Login/Enterprise').default)
      })
    },
  },
  {
    path:'/email/email_Approval',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../../client/containers/EmailApproval').default)
      })
    },
  },
  {
    path: '/signup',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../containers/Register').default)
      })
    },
  },
  {
    path: '/rpw',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../containers/ResetPassWord').default)
      })
    },
  },
  {
    path: '/teams/invite',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../containers/Invite').default)
      })
    },
  },
  {
    path: '/notfound',
    component: require('../containers/ErrorPage').default,
  },
  {
      path:'/email/invitations/join',
      // path:'/alerts/invitations/join',
      component: require('../containers/Template').default
  },
  {
    path: '/',
    component: require('../containers/App/Enterprise').default,
    indexRoute: {
      getComponent: (location, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/IndexPage/Enterprise').default)
        })
      },
    },
    childRoutes: [
    //   {
    //   path: 'quickentry',
    //   component: require('../components/QuickEntry').default,
    // },
      {
        path: 'app_manage',
        component: require('../containers/Application').default,
        indexRoute: {
          component: require('../components/AppModule/AppList').default,
        },
        getChildRoutes: (location, cb) => {
          require.ensure([], function (require) {
            cb(null, require('./app_manage').default)
          })
        },
      },
      {
        path: 'app-stack',
        component: require('../../client/containers/AppStack').default,
        indexRoute: {
          onEnter: (nextState, replace) => replace('/app-stack/Deployment')
        },
        childRoutes: [
          {
            path: 'Deployment',
            component: require('../../client/containers/AppStack/AppStackIframe').default,
          },
          {
            path: 'StatefulSet',
            component: require('../../client/containers/AppStack/AppStackIframe').default,
          },
          {
            path: 'Job',
            component: require('../../client/containers/AppStack/AppStackIframe').default,
          },
          {
            path: 'CronJob',
            component: require('../../client/containers/AppStack/AppStackIframe').default,
          },
          {
            path: 'Pod',
            component: require('../../client/containers/AppStack/AppStackIframe').default,
          },
          {
            path: 'createWorkLoad',
            component: require('../../client/containers/AppStack').default,
          },
          {
            path: 'Design',
            component: require('../../client/containers/AppStack/AppStackIframe').default,
          },
        ],
      },
      {
        path: 'app-stack-pro',
        component: require('../../client/containers/AppStackPro').default,
        indexRoute: {
          component: require('../../client/containers/AppStack/AppStackIframe').default,
        },
        childRoutes: [
          {
            path: 'templates',
            component: require('../../client/containers/AppStack/AppStackIframe').default,
          },
          {
            path: 'designer',
            component: require('../../client/containers/AppStack/AppStackIframe').default,
          },
        ],
      },
      {
        path: 'net-management',
        component: require('../../client/containers/NetManagement').default,
        indexRoute: {
          onEnter: (nextState, replace) => replace('/net-management/Service')
        },
        childRoutes: [
          {
            path: 'Service',
            component: require('../../client/containers/AppStack/AppStackIframe').default,
          },
          {
            path: 'appLoadBalance',
            component: require('../components/AppModule/LoadBalance').default,
          },
          {
            path: 'appLoadBalance/createLoadBalance',
            component: require('../components/AppModule/LoadBalance/LoadBalanceModal').default,
          },
          {
            path: 'appLoadBalance/editLoadBalance',
            component: require('../components/AppModule/LoadBalance/LoadBalanceModal').default,
          },
          {
            path: 'appLoadBalance/balance_config',
            component: require('../components/AppModule/LoadBalance/LoadBalanceConfig').default
          },{
            path: 'dnsRecord',
            component: require('../../client/containers/ServiceDiscover').default,
          },
          {
            path: 'securityGroup',
            component: require('../../client/containers/SecurityGroup').default,
          },{
            path: 'securityGroup/create',
            component: require('../../client/containers/SecurityGroup/CreateSecurityGroup').default,
          },{
            path: 'securityGroup/network_isolation',
            component: require('../components/AppModule/NetworkIsolation').default,
          },{
            path: 'securityGroup/edit/:name',
            component: require('../../client/containers/SecurityGroup/CreateSecurityGroup').default,
          },{
            path: 'securityGroup/:name',
            component: require('../../client/containers/SecurityGroup/SecurityGroupDetail').default,
          }
        ],
      },{
        path: 'storage-management',
        component: require('../../client/containers/StorageManagement').default,
        indexRoute: {
          onEnter: (nextState, replace) => replace('/storage-management/privateStorage')
        },
        childRoutes: [
          {
            path: 'privateStorage',
            component: require('../components/StorageModule/Storage').default,
          },
          {
            path: 'exclusiveMemory/:pool/:cluster/:storage_name',
            component: require('../components/StorageModule/StorageDetail').default,
          },
          {
            path: 'shareStorage',
            component: require('../components/StorageModule/ShareMemory').default,
          },{
            path: 'shareStorage/:cluster/:share_name',
            component: require('../components/StorageModule/ShareMemory/ShareStorageDetail').default,
          },
          {
            path: 'localStorage',
            component: require('../components/StorageModule/HostMemory').default,
          },
          {
            path: 'localStorage/:host_name',
            component: require('../components/StorageModule/HostMemory/HostStorageDetail').default,
          },{
            path: 'snapshot',
            component: require('../components/AppModule/AppSnapshot').default,
          }
        ],
      },{
        path: 'app_center',
        component: require('../containers/AppCenter').default,
        indexRoute: {
          component: require('../../client/containers/AppCenter/AppTemplate').default,
        },
        getChildRoutes: (location, cb) => {
          require.ensure([], function (require) {
            cb(null, require('./app_center').default)
          })
        },
      },
      {
        path: 'database_cache',
        component: require('../containers/Database').default,
        indexRoute: {
          component: require('../components/DatabaseCache/MysqlCluster').default,
        },
        getChildRoutes: (location, cb) => {
          require.ensure([], function (require) {
            cb(null, require('./database_cache').default)
          })
        },
      },
      {
        path: 'ci_cd',
        component: require('../containers/CICD').default,
        indexRoute: {
          component: require('../components/CICDModule/CodeStore').default,
        },
        getChildRoutes: (location, cb) => {
          require.ensure([], function (require) {
            cb(null, require('./ci_cd').default)
          })
        },
      },
      {
        path: 'middleware_center',
        component: require('../../client/containers/MiddlewareCenter').default,
        indexRoute: {
          component: require('../../client/containers/MiddlewareCenter/App').default,
        },
        getChildRoutes: (location, cb) => {
          require.ensure([],function (require) {
            cb(null, require('./middleware_center').default)
          })
        },
      },
      {
        path: 'account',
        component: require('../containers/Account').default,
        indexRoute: {
          // component: require('../components/AccountModal/UserInfo').default,
          component: require('../components/TenantManage/UserInfo').default,
        },
        getChildRoutes: (location, cb) => {
          require.ensure([], function (require) {
            cb(null, require('./account').default)
          })
        },
      },
      {
        path: 'setting',
        component: require('../containers/Setting').default,
        indexRoute: {
          component: require('../components/SettingModal/Version').default,
        },
        getChildRoutes: (location, cb) => {
          require.ensure([], function (require) {
            cb(null, require('./setting').default)
          })
        },
      },
      {
        path: 'manange_monitor',
        component: require('../containers/ManageMonitor').default,
        indexRoute: {
          onEnter: (nextState, replace) => replace('/manange_monitor/audit'),
        },
        getChildRoutes: (location, cb) => {
          require.ensure([], function (require) {
            cb(null, require('./manange_monitor').default)
          })
        },
      },
      {
        path: 'cluster',
        component: require('../containers/Cluster').default,
        indexRoute: {
          component: require('../components/ClusterModule').default,
        },
        getChildRoutes: (location, cb) => {
          require.ensure([], function (require) {
            cb(null, require('./cluster').default)
          })
        },
      },
      {
        path: 'tenant_manage',
        component: require('../containers/Tenant').default,
        indexRoute: {
          component: require('../components/TenantManage').default,
        },
        getChildRoutes: (location, cb) => {
          require.ensure([], function (require) {
            cb(null, require('./tenant').default)
          })
        },
      },
      {
        path: 'ai-deep-learning',
        component: require('../../client/containers/AIDeepLearning').default,
        indexRoute: {
          onEnter: (nextState, replace) => replace('/ai-deep-learning/notebook')
        },
        childRoutes: [
          {
            path: 'notebook',
            component: require('../../client/containers/AIDeepLearning').default,
          },
          {
            path: 'large-scale-train',
            component: require('../../client/containers/AIDeepLearning').default,
          },
          {
            path: 'data-set',
            component: require('../../client/containers/AIDeepLearning').default,
          },
          {
            path: 'model-set',
            component: require('../../client/containers/AIDeepLearning').default,
          },
          {
            path: 'ai-model-service',
            component: require('../../client/containers/AIDeepLearning/ModelService').default,
          },
        ],
      },
      {
        path: 'OpenStack',
        // component: require('../containers/Integration').default,
        indexRoute: {
          component: require('../components/IntegrationModule/OpenStack').default,
        },
        getChildRoutes: (location ,cb) => {
          require.ensure([], function (require) {
            cb(null, require('./openstack').default)
          })
        }
      },
      {
        path: 'work-order',
        component: require('../../client/containers/WorkOrder').default,
        indexRoute: {
          onEnter: (nextState, replace) => replace('/work-order/my-order')
          // component: require('../../client/containers/WorkOrder/components/WorkOrderList').default,
        },
        childRoutes: [
          {
            path: 'my-order',
            component: require('../../client/containers/WorkOrder/MyOrder').default,
          },
          {
            path: 'my-order/:id',
            component: require('../../client/containers/WorkOrder/MyOrder/MyOrderDetail').default,
          },
          {
            path: 'create',
            component: require('../../client/containers/WorkOrder/MyOrder/MyOrderCreate').default,
          },
          {
            path: 'system-notice',
            component: require('../../client/containers/WorkOrder/SystemNotice').default,
          },
          {
            path: 'system-notice/:id',
            component: require('../../client/containers/WorkOrder/SystemNotice/SystemNoticeDetail').default,
          },
          {
            path: 'system-notice/create',
            component: require('../../client/containers/WorkOrder/SystemNotice/SystemNoticeDetail').default,
          },
        ],
      },
      {
        path: '*',
        component: require('../containers/ErrorPage').default,
      }
    ],
  }]
}

export default rootRoutes
