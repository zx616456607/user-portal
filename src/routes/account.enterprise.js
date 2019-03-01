/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Account routes - enterprise
 *
 * v0.1 - 2016-12-18
 * @author zhangpc
*/

const accountRoutes = [
  {
    path: 'costCenter',
    indexRoute: {
      onEnter: (nextState, replace) => replace('/account/costCenter/consumptions'),
    },
    childRoutes: [
      {
        path: 'consumptions',
        component: require('../components/AccountModal/CostCenterEnterprise').default,
      },
      {
        path: 'payments',
        component: require('../components/AccountModal/CostCenterEnterprise').default,
      },
    ]
  },
  {
    path: 'noticeGroup',
    component: require('../components/AccountModal/Group/NoticeGroup').default,
  },
  {
    path: 'noticeGroup/:name',
    component: require('../components/AccountModal/Group/Detail').default,
  },
]

export default accountRoutes
