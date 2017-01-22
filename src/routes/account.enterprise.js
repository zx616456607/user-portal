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
    path: 'user/:user_id',
    component: require('../components/AccountModal/UserInfo').default,
  },
  {
    path: 'user/editpass',
    component: require('../components/AccountModal/UserInfo').default,
  },
  {
    path: 'member',
    component: require('../components/AccountModal/_Enterprise/MemberManage').default,
  },
  {
    path: 'team',
    component: require('../components/AccountModal/_Enterprise/TeamManage').default,
  },
  {
    path: 'team/:team_name/:team_id',
    component: require('../components/AccountModal/_Enterprise/TeamDetail').default,
  },
  {
    path: 'costCenter',
    component: require('../components/AccountModal/CostCenter').default,
  }
]

export default accountRoutes
