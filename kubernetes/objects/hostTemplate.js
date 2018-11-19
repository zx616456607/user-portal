/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * host class for k8s
 *
 * v0.1 - 2017-10-11
 * @author Zhangcz
 */
'use strict'
class HostTemplate {
  constructor(baseDir) {
    this.apiVersion = "storage.k8s.io/v1"
    this.kind = "StorageClass"
    this.metadata = {
      labels: {
        [`system/storageType`]: "host",
        [`system/storageStatus`]: "open"
      },
      name: "host-storage"
    }
    this.provisioner = "host-storage"
    this.parameters = {
      baseDir
    }
  }
}

module.exports = HostTemplate
