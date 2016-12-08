/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Account routes
 *
 * v0.1 - 2016-12-04
 * @author huangqg
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
    component: require('../components/AccountModal/MemberManage').default,
  },
  {
    path: 'team',
    component: require('../components/AccountModal/TeamManage').default,
  },
  {
    path: 'myteam',
    component: require('../components/AccountModal/Standard/MyTeam').default,
  },
  {
    path: 'team/:team_name/:team_id',
    component: require('../components/AccountModal/TeamDetail').default,
  },
  {
    path: 'cost',
    component: require('../components/AccountModal/CostCenter').default,
  }
]


export default accountRoutes
