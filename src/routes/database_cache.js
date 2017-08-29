/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Database cache routes
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/

const databaseCacheRoutes = [{
  path: 'mysql_cluster',
  component: require('../components/DatabaseCache/MysqlCluster').default,
},
{
  path: 'redis_cluster',
  component: require('../components/DatabaseCache/RedisCluster').default,
},
{
  path: 'zookeeper_cluster',
  component: require('../components/DatabaseCache/StatefulCluster').default,
},
{
  path: 'elasticsearch_cluster',
  component: require('../components/DatabaseCache/StatefulCluster').default,
},
{
  path: 'etcd_cluster',
  component: require('../components/DatabaseCache/StatefulCluster').default,
}]

export default databaseCacheRoutes