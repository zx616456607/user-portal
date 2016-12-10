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
const mode = require('../../configs/models').mode
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
    component: require('../components/AccountModal/Enterprise/MemberManage').default,
  },
  {
    path: 'team',
    component: mode==='standard'?
      require('../components/AccountModal/Standard/MyTeam').default:
      require('../components/AccountModal/Enterprise/TeamManage').default,
  },
  {
    path: 'myteam',
    component: require('../components/AccountModal/Standard/MyTeam').default,
  },
  {
    path: 'team/:team_name/:team_id',
    component: mode==='standard'?
      require('../components/AccountModal/Standard/TeamDetail').default:
      require('../components/AccountModal/Enterprise/TeamDetail').default,
  },
  {
    path: 'cost',
    component: require('../components/AccountModal/CostCenter').default,
  }
]


export default accountRoutes
