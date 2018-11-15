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

class GfsStorage {
  constructor(gname, name, agent, path, adminId){
    this.apiVersion = 'storage.k8s.io/v1'
    this.kind =  'StorageClass'
    this.metadata = {
      name: gname,
      annotations:{
        ["system/scName"]: name // 对应原型中的【集群名称】
      }
    }
    this.provisioner = 'kubernetes.io/glusterfs'
    this.parameters = {
      resturl: agent,
      clusterid: path,
      restuser: adminId,
      secretName: 'tenx-glusterfs', // 用户秘钥在k8s对应namespace中的名称。这里目前用这个默认值即可。
      secretNamespace: 'kube-system',  // 用户秘钥在k8s对应namespace中的名称。这里目前用这个默认值即可。
      volumetype: 'replicate:3',
    }
  }
  // apiVersion: storage.k8s.io/v1
  // kind: StorageClass
  // metadata:
  //   name: tenx-glusterfs1 // 经确认，需要参考ceph的name生成逻辑
  //   annotations:
  //     "tenxcloud.com/scName": "tenx-glusterfs" // 对应原型中的【集群名称】
  // provisioner: kubernetes.io/glusterfs
  // parameters:
  //   resturl: "http://192.168.1.167:8080" // 对应原型中的【agent地址】
  //   clusterid: "3abce6f0381e20520d96ba54ac864800" // 对应原型中的【集群 ID】
  //   restuser: "admin" // 对应原型中的【认证用户】
  //   secretNamespace: "kube-system"  // 用户秘钥在k8s对应namespace中的名称。这里目前用这个默认值即可。
  //   secretName: "tenx-glusterfs" // 用户秘钥在k8s对应namespace中的名称。这里目前用这个默认值即可。
  //   volumetype: "replicate:3" // 这里目前用这个默认值即可，暂时不开放给用户
}

module.exports = GfsStorage
