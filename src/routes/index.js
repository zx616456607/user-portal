/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Root routes
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/
const mode = require('../../configs/models').mode
const rootRoutes = {
  childRoutes: [{
    path: '/login',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        if (mode === 'standard') {
          cb(null, require('../containers/Login/Standard').default)
        } else {
          cb(null, require('../containers/Login/Enterprise').default)
        }
      })
    },
  }, {
    path: '/',
    component: require('../containers/App').default,
    indexRoute: {
      getComponent: (location, cb) => {
        require.ensure([], (require) => {
          if (mode === 'standard') {
            cb(null, require('../containers/IndexPage/Standard').default)
          } else {
            cb(null, require('../containers/IndexPage/Enterprise').default)
          }
        })
      },
    },
    childRoutes: [{
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
    }, {
      path: 'app_center',
      component: require('../containers/AppCenter').default,
      indexRoute: {
        component: require('../components/AppCenter').default,
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./app_center').default)
        })
      },
    }, {
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
    }, {
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
    }, {
      path: 'setting',
      component: require('../containers/Setting').default,
      indexRoute: {
        component: require('../components/SettingModal/UserInfo').default,
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./setting').default)
        })
      },
    }, {
      path: 'manange_monitor',
      component: require('../containers/ManageMonitor').default,
      indexRoute: {
        component: require('../components/ManageMonitor/OperationalAudit').default,
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./manange_monitor').default)
        })
      },
    }, {
      path: 'integration',
      component: require('../containers/Integration').default,
      indexRoute: {
        component: require('../components/IntegrationModule').default,
      }
    },{
      path: '*',
      component: require('../containers/ErrorPage').default,
    }],
  }]
}

export default rootRoutes