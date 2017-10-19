/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ceph class for k8s
 *
 * v0.1 - 2017-9-19
 * @author Zhangpc
 */
'use strict'

class StorageClass {
  constructor(config){
    const { agent, name, monitors, adminId, pool, secretName, scName } = config
    this.apiVersion = 'storage.k8s.io/v1'
    this.kind = 'StorageClass'
    this.metadata = {
      annotations: {
        [`tenxcloud.com/scName`]: scName,
        [`tenxcloud.com/storageagent`]: agent,
      },
      name,
      labels: {
        [`kubernetes.io/cluster-service`]: 'true',
      }
    }
    this.provisioner = 'kubernetes.io/rbd'
    this.parameters = {
      monitors,
      adminId,
      adminSecretName: secretName,
      adminSecretNamespace: "kube-system",
      pool,
      userId: adminId,
      userSecretName: secretName,
      imageFormat: "2",
      imageFeatures: "1",
    }
  }
}

module.exports = StorageClass