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
  constructor(name){
    this.apiVersion = 'storage.k8s.io/v1beta1'
    this.kind =  'StorageClass'
    this.metadata = {
      name,
    }
    this.provisioner = name
  }
}

module.exports = NfsStorage