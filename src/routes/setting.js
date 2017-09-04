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


const settingRoutes = [
  {
    path: 'version',
    component: require('../components/SettingModal/Version').default,
  },
  {
    path: 'license',
    component: require('../components/SettingModal/License').default,
  },
  {
    path: 'API',
    component: require('../components/SettingModal/API').default,
  },
  {
    path: 'personalized',
    component: require('../components/SettingModal/Personalized').default,
  },
  {
    path: 'globalConfig',
    component: require('../components/SettingModal/GlobalConfig').default,
  },
  {
    path: 'advancedSetting',
    component: require('../components/SettingModal/AdvancedSetting').default,
  },
  {
    path: 'cleaningTool',
    component: require('../components/SettingModal/CleaningTool').default,
  },
  {
    path: 'cleaningTool/cleaningRecord',
    component: require('../components/SettingModal/CleaningTool/CleaningRecord').default,
  },
  {
    path: 'cleaningTool/timingClean',
    component: require('../components/SettingModal/CleaningTool/TimingClean').default,
  },
]


export default settingRoutes
