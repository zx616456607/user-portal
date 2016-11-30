/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Setting routes
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/


const settingRoutes = [{
  path: 'member',
  component: require('../components/SettingModal/MemberManage').default,
},{
  path: 'team',
  component: require('../components/SettingModal/TeamManage').default,
},{
  path: 'team/:team_name/:team_id',
  component: require('../components/SettingModal/TeamDetail').default,
},{
  path: 'API',
  component: require('../components/SettingModal/API').default,
},{
  path: 'license',
  component: require('../components/SettingModal/License').default,
},{
  path: 'version',
  component: require('../components/SettingModal/Version').default,
},{
  path: 'user/:user_id',
  component: require('../components/SettingModal/UserInfo').default,
},{
  path: 'cost',
  component: require('../components/SettingModal/CostCenter').default,
}]


export default settingRoutes
