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
  path: 'redis_cluster',
  component: require('../components/DatabaseCache/RedisCluster').default,
}]

export default databaseCacheRoutes