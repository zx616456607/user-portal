/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * CI/CD routes
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/

const CICDRoutes = [{
  path: 'coderepo',
  component: require('../components/CICDModule/CodeStore/CodeRepo').default,
},{
  path: 'tenx_flow',
  indexRoute: {
    component: require('../components/CICDModule/TenxFlow').default,
  },
  childRoutes: [{
    path: 'tenx_flow_build',
    component: require('../components/CICDModule/TenxFlow/TenxFlowDetail').default,
  }],
},{
  path: 'docker_file',
  component: require('../components/CICDModule/DockerFile').default,
}]

export default CICDRoutes