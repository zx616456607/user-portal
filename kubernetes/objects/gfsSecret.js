/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Secret class for k8s
 *
 * v0.1 - 2018-04-28
 * @author rsw
 */
'use strict'

class GfsSecret {
  constructor(secretName, password){
    this.apiVersion = 'v1'
    this.kind = 'Secret'
    this.metadata = {
      name: secretName,
      namespace: 'kube-system',
    }
    this.type = 'kubernetes.io/glusterfs'
    this.data = {
      key: password,
    }
  }
}

module.exports = GfsSecret