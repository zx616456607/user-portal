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
  constructor(password, secretName, secretNamespace){
    this.apiVersion = 'v1'
    this.kind = 'Secret'
    this.metadata = {
      name: secretName || 'tenx-glusterfs',
      //namespace: 'kube-system',
    }
    if(!!secretNamespace) {
      this.metadata.namespace = secretNamespace
    }
    this.data = {
      key: password,
    }
    this.type = 'kubernetes.io/glusterfs'
  }
  // apiVersion: v1
  // kind: Secret
  // metadata:
  //   name: tenx-glusterfs
  // data:
  //   key: "12345678" // 对应原型中的【用户认证密钥】注意已经确定是明文，不是秘文
  // type: kubernetes.io/glusterfs
}

module.exports = GfsSecret