/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/*
 * openstack routes
 *
 * v0.1 - 2017-07-01
 * @author Zhangpc
*/

const openStackRoutes = [{
  path: 'storage',
  component: require('../components/OpenStack/Storage/BlockStorage').default,
},
{
  path: 'objStorage',
  component: require('../components/OpenStack/Storage/ObjectStore').default,
},
{
  path: 'storage/*',
  component: require('../components/OpenStack/Storage/ObjectStoreDetail').default,
},
{
  path: 'net',
  indexRoute:{
    component: require('../components/OpenStack/Network/Item').default,
  },
  childRoutes:[
    {
      path: ':name/:id',
      component: require('../components/OpenStack/Network/Detail').default,
    }
  ]
},
{
  path: 'router',
  indexRoute:{
    component: require('../components/OpenStack/Network/Router').default,
  },
  childRoutes:[
    {
      path:':name',// router child
      component: require('../components/OpenStack/Network/Router/Detail').default,
    }
  ]
},
{
  path: 'floatIP',
  indexRoute:{
    component: require('../components/OpenStack/ElasticIp').default,
  }
},
{
  path: 'load_balancer',
  indexRoute:{
    component: require('../components/OpenStack/LoadBalancer').default,
  },
  childRoutes:[
    {
      path: 'detail/:id',
      component: require('../components/OpenStack/LoadBalancer/VirtualIP').default,
    },
    {
      path: 'health_examination/:id',
      component: require('../components/OpenStack/LoadBalancer/HealthExamination').default,
    },
    {
      path: 'service_pool/:id',
      component: require('../components/OpenStack/LoadBalancer/ServicePoolDetail').default,
    },
    {
      path: 'dns/:name',
      component: require('../components/OpenStack/LoadBalancer/DNSDetail').default,
    },
    {
      path: 'domain/:name',
      component: require('../components/OpenStack/LoadBalancer/Domain').default,
    },
  ]
},
{
  path:'calculate',
  component: require('../components/OpenStack/Calculation').default
},
{
  path: 'host',
  component: require('../components/OpenStack/Host').default,
},
{
  path: 'calculate/:id/:name',
  component: require('../components/OpenStack/Host/HostDetail').default,
},
{
  path: 'snapshot',
  component: require('../components/OpenStack/Snapshot').default,
},
{
  path: 'image',
  component: require('../components/OpenStack/Image').default,
},
{
  path: 'concentrative_calculation',
  component: require('../components/OpenStack/ConcentrativeCalculation').default,
},
{
  path: 'containerCluster',
  component: require('../components/OpenStack/Clusters').default,
},
{
  path: 'keypairs',
  component: require('../components/OpenStack/Keypairs').default
}
]

export default openStackRoutes