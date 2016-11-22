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
  path: 'mongo_cluster',
  component: require('../components/DatabaseCache/MongoCluster').default,
},{
  path: 'redis_cluster',
  component: require('../components/DatabaseCache/RedisCluster').default,
},{
  path: 'database_storage',
  component: require('../components/DatabaseCache/DatabaseStorage').default,
}]

export default databaseCacheRoutes