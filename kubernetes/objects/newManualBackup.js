/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * manualBackup class for database_cache
 *
 * v0.1 - 2018-07-19
 * @author zhouhaitao
 */
'use strict'

class newManualBackup {
  constructor (name, namespace, time) {
    this.apiVersion = 'daas.tenxcloud.com/v1'
    this.kind = 'RedisCluster'
    this.metadata = {
      name,
      namespace,
      labels:{'tenxcloud.com/cluster': name }
      },
      this.spec = {
        cluster: name,
        timestamp: time,
        sourceDirectory: '/redis-master-data/',
        s3SecretName: 's301',
        s3SecretNamespace: 'kube-system'
      }
  }
}
module.exports = newManualBackup
