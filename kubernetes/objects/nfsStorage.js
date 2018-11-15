/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ceph class for k8s
 *
 * v0.1 - 2017-9-20
 * @author Zhangpc
 */
'use strict'

class NfsStorage {
  constructor(name, nfsname){
    this.apiVersion = 'storage.k8s.io/v1'
    this.kind =  'StorageClass'
    this.metadata = {
      annotations:{
        [`system/scName`]: name,
      },
      name: nfsname,
    }
    this.provisioner = nfsname
  }
}

module.exports = NfsStorage
