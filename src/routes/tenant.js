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
  path: '/tenant_manage/beginner_guidance',
  component: require('../../client/containers/TenantManage/BeginnerGuidance').default,
},
  {
    path: 'user/:user_id',
    component: require('../components/TenantManage/UserInfo').default,
  },{
    path: 'project_manage',
    component: require('../components/TenantManage/ProjectManage').default,
},
  // {
  //   path: 'rolemanagement',
  //   component: require('../components/TenantManage/RoleManagement').default,
  // },
  {
    path: 'allpermissions',
    component: require('../components/TenantManage/AllPermissions').default,
  },
  {
    path: 'user',
    component: require('../components/TenantManage/Membermanagement').default,
  },
  {
    path: '/tenant_manage/cluster_authorization',
    component: require('../../client/containers/TenantManage/ClusterAuthorization').default,
  },
  {
    path: 'project_manage/project_detail',
    component: require('../components/TenantManage/ProjectManage/ProjectDetail').default
  },
  // {
  //   path: 'rolemanagement/rolename/:id',
  //   component: require('../components/TenantManage/TenantDetail').default,
  // },
  {
    path: 'team',
    component: require('../components/TenantManage/_Enterprise/TeamManage').default,
  },
  {
    path: 'team/:team_id',
    component: require('../components/TenantManage/_Enterprise/TeamDetail').default,
  },
  {
    path: 'ldap',
    component: require('../components/TenantManage/LDAP').default,
  },
  {
    path: '/tenant_manage/applyLimit', // 配额申请
    component: require('../../client/containers/TenantManage/ApplyLimit').default,
  },{
    path: '/tenant_manage/approvalLimit', // 配额审批
    component: require('../../client/containers/TenantManage/ApprovalLimit').default,
  }
]

export default tenantRoutes
