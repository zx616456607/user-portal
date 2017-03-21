/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Manage monitor routes
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/

const manangeMonitorRoutes = [
  {
    path: 'query_log',
    component: require('../components/ManageMonitor/QueryLog').default,
  },
  {
    path: 'alarm_setting',
    component: require('../components/ManageMonitor/AlarmSetting').default
  },
   {
    path: 'alarm_setting/:id',
    component: require('../components/ManageMonitor/AlarmDetail').default
  },
  {
    path: 'alarm_record',
    component: require('../components/ManageMonitor/AlarmRecord').default,
  }
]

export default manangeMonitorRoutes