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
    path: 'audit',
    component: require('../../client/containers/ManageMonitor/OperationAudit').default,
  },

  {
    path: 'query_log',
    component: require('../components/ManageMonitor/QueryLog').default,
  },
  {
    path: 'panel',
    component: require('../components/ManageMonitor/MonitorPanel').default,
  },
  {
    path: 'alarm_setting',
    component: require('../components/ManageMonitor/AlarmSetting').default,
    indexRoute: {
      onEnter: (nextState, replace) => replace('/manange_monitor/alarm_setting/resource')
    },
    childRoutes: [{
      path: 'resource',
      component: require('../components/ManageMonitor/AlarmSettingSource').default,
    },{
      path: 'log',
      component: require('../components/ManageMonitor/AlarmSettingLog').default,
    }]
  },
   {
    path: 'alarm_setting/resource/:id',
    component: require('../components/ManageMonitor/AlarmDetail').default
  },
  {
    path: 'alarm_record',
    component: require('../components/ManageMonitor/AlarmRecord').default,
    indexRoute: {
      onEnter: (nextState, replace) => replace('/manange_monitor/alarm_record/resource')
    },
    childRoutes: [{
      path: 'resource',
      component: require('../components/ManageMonitor/AlarmRecordSource').default,
    },{
      path: 'log',
      component: require('../components/ManageMonitor/AlarmRecordLog').default,
    }]
  },
]

export default manangeMonitorRoutes
