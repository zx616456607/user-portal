/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Secret class for k8s
 *
 * v0.1 - 2016-10-11
 * @author Zhangpc
 */
'use strict'

class Secret {
  constructor(key, secretName){
    this.apiVersion = 'v1'
    this.kind = 'Secret'
    this.metadata = {
      name: secretName,
      namespace: 'kube-system'
    }
    this.type = 'kubernetes.io/rbd'
    this.data = {
      key,
    }
  }
}

module.exports = Secret