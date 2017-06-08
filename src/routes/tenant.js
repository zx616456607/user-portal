/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/*
 * Tenant routes
 *
 * v0.1 - 2017-06-01
 * @author Zhangpc
*/
const tenantRoutes = [{
  path: 'integration',
  component: require('../components/IntegrationModule').default,
},{
    path: 'rolemanagement',
    component: require('../components/TenantManage/RoleManagement').default,
  },
  {
    path: 'allpermissions',
    component: require('../components/TenantManage/AllPermissions').default,
  },
  {
    path: 'rolemanagement/rolename/TID',
    component: require('../components/TenantManage/TenantDetail').default,
  }
]

export default tenantRoutes