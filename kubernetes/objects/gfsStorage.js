/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * gfs class for k8s
 *
 * v0.1 - 2018-04-28
 * @author rsw
 */
'use strict'

class NfsStorage {
  constructor(clusterName, clusterId, ip, adminId, secretName){
    this.apiVersion = 'storage.k8s.io/v1'
    this.kind =  'StorageClass'
    this.metadata = {
      name: clusterName,
    }
    this.provisioner = 'kubernetes.io/glusterfs'
    this.parameters = {
      resturl: ip,
      clusterid: clusterId,
      restuser: adminId,
      secretName: secretName,
      secretNamespace: 'kube-system',
      volumetype: 'replicate:3',
    }
  }
}

module.exports = NfsStorage