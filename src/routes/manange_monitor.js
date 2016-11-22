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

const CICDRoutes = [{
  path: 'query_log',
  component: require('../components/ManageMonitor/QueryLog').default,
},{
  path: 'monitor',
  component: require('../components/ManageMonitor/MonitorModule').default,
}]

export default CICDRoutes