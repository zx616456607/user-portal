/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Account routes - standard
 *
 * v0.1 - 2016-12-18
 * @author zhangpc
*/

const accountRoutes = [
  {
    path: 'user/:user_id',
    component: require('../components/AccountModal/UserInfo').default,
  },
  {
    path: 'user/editPass',
    component: require('../components/AccountModal/UserInfo').default,
  },
  {
    path: 'member',
    component: require('../components/AccountModal/_Enterprise/MemberManage').default,
  },
  {
    path: 'team',
    component: require('../components/AccountModal/_Standard/MyTeam').default,
  },
  {
    path: 'team/:team_name/:team_id',
    component: require('../components/AccountModal/_Standard/TeamDetail').default,
  },
  {
    path: 'cost',
    component: require('../components/AccountModal/CostCenter').default,
  },
  {
    path: 'balance',
    indexRoute: {
      component: require('../components/AccountModal/_Standard/UserBalance').default,
    },
    childRoutes: [{
      path: 'payment',
      component: require('../components/AccountModal/_Standard/UserBalance/Payment').default,
    }]
  }
]

export default accountRoutes
