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

const CICDRoutes = [
  {
    path: 'pandect',
    component: require('../../client/containers/IframePortal/DevFlow').default,
    childRoutes: [
      {
        path: '*',
        component: require('../../client/containers/IframePortal/DevFlow').default,
      },
    ],
  },
  {
    path: '/pipelines/:id/setting',
    component: require('../../client/containers/IframePortal/DevFlow').default,
  },
  {
    path: 'pipelines',
    component: require('../../client/containers/IframePortal/DevFlow').default,
    childRoutes: [
      {
        path: '*',
        component: require('../../client/containers/IframePortal/DevFlow').default,
      },
    ],
  },
  {
    path: 'thirdparty',
    component: require('../../client/containers/IframePortal/DevFlow').default,
    childRoutes: [
      {
        path: '*',
        component: require('../../client/containers/IframePortal/DevFlow').default,
      },
    ],
  },
  {
    path: 'codestore',
    component: require('../components/CICDModule/CodeStore').default,
  },
  {
    path: 'codestore/add',
    component: require('../components/CICDModule/CodeStore/CodeRepo').default,
  },
  /* {
    path: 'tenx_flow',
    indexRoute: {
      component: require('../components/CICDModule/TenxFlow').default,
    },
    childRoutes: [{
      path: 'tenx_flow_build',
      component: require('../components/CICDModule/TenxFlow/TenxFlowDetail').default,
    }],
}, */
{
  path: 'docker_file',
  component: require('../components/CICDModule/DockerFile').default,
},{
  path: 'volumes',
  component: require('../../client/containers/IframePortal/DevFlow').default,
  childRoutes: [
    {
      path: '*',
      component: require('../../client/containers/IframePortal/DevFlow').default,
    },
  ],
}]

export default CICDRoutes
