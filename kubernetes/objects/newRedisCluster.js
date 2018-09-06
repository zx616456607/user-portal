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
      annotations: {
          ['master.system/lbgroup']: lbgroup,
          ['slave.system/lbgroup']: '',
        }
    }
    this.spec = {
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
