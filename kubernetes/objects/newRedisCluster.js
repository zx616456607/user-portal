/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * new radis cluster class for database_cache
 *
 * v0.1 - 2018-07-19
 * @author zhouhaitao
 */
'use strict'

class newRedisCluster {
  constructor (name, serverReplicas, lbgroup, config, storageType, size, namespace,  password, configContent) {
    this.apiVersion = 'daas.tenxcloud.com/v1'
    this.kind = 'RedisCluster'
    this.metadata = {
      name,
      namespace,
      annotations: lbgroup === 'none'? {
          ['system/lbgroup']: lbgroup,
        }
        :
        {
          ['system/lbgroup']: lbgroup,
          ['tenxcloud.com/schemaPortname']: `${name}/TCP`
        },
    }
    this.spec = {
      repository: 'http://192.168.1.21:8879',
      chart: 'redis-tenxcloud',
      resources: config,
      advanceSetting: {
        password,
        serverReplicas,
        imagePullPolicy: 'IfNotPresent',
        storageClassName: storageType,
        storageCapacity: size,
        master: configContent,
        sentinel: ''
      }
    }
  }
}
module.exports = newRedisCluster
