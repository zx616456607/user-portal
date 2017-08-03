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
    path: 'user/:user_id',
    component: require('../components/TenantManage/UserInfo').default,
  },{
    path: 'project_manage',
    component: require('../components/TenantManage/ProjectManage').default,
},
  {
    path: 'rolemanagement',
    component: require('../components/TenantManage/RoleManagement').default,
  },
  {
    path: 'allpermissions',
    component: require('../components/TenantManage/AllPermissions').default,
  },
  {
    path: 'membermanagement',
    component: require('../components/TenantManage/Membermanagement').default,
  },
  {
    path: 'project_manage/project_detail',
    component: require('../components/TenantManage/ProjectManage/ProjectDetail').default
  },
  {
    path: 'rolemanagement/rolename/:id',
    component: require('../components/TenantManage/TenantDetail').default,
  },
  {
    path: 'team',
    component: require('../components/TenantManage/_Enterprise/TeamManage').default,
  },
  {
    path: 'team/:team_id',
    component: require('../components/TenantManage/_Enterprise/TeamDetail').default,
  }
]

export default tenantRoutes