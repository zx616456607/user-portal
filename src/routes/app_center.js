/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * App center routes
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/

const appCenterRoutes = [{
  path: 'image_store',
  component: require('../components/AppCenter/App_store').default,
},{
  path: 'stack_center',
  component: require('../components/AppCenter/Stack').default,
}]

export default appCenterRoutes