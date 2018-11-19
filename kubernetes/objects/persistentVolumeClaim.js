/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */
/* PersistentVolumeClaim class for k8s
 *
 * v0.1 - 2017-09-21
 * @author Zhangpc
 */
'use strict'

class PersistentVolumeClaim {
  constructor(config) {
    let {
      name,
      storageType,
      storageClassName,
      fsType,
      srType,
      reclaimPolicy,
      accessModes,
      storage,
      serverDir,
    } = config
    if (!fsType) {
      fsType = 'ext4'
    }
    if (!srType) {
      if (storageType === 'ceph') {
        srType = 'private'
      } else if (storageType === 'nfs' || storageType === 'glusterfs') {
        srType = 'share'
      }
    }
    if (!reclaimPolicy) {
      reclaimPolicy = 'delete'
    }
    if (!accessModes) {
      if (storageType === 'ceph') {
        accessModes = 'ReadWriteOnce'
      } else if (storageType === 'nfs' || storageType === 'glusterfs') {
        accessModes = 'ReadWriteMany'
      }
    }
    if (!storage) {
      storage = '512Mi'
    }else if(storageType === "glusterfs"){
      storage += 'G'
    }
    let labels = {
      'system/storageType': storageType,
      'system/srType': srType,
      'system/reclaimPolicy': reclaimPolicy,
    }
    if(storageType !== "glusterfs"){
      labels['system/fsType'] = fsType
    }else{
      labels['system/fsType'] = 'ext4'
    }

    this.kind = 'PersistentVolumeClaim'
    this.apiVersion = 'v1'
    this.metadata = {
      name,
      labels: labels
    }
    if (serverDir) {
      this.metadata.annotations = {
        'system/customfolder': serverDir
      }
    }
    this.spec = {
      accessModes: [
        accessModes
      ],
      storageClassName,
      resources: {
        requests: {
          storage
        }
      }
    }
    // kind: PersistentVolumeClaim
    // apiVersion: v1
    // metadata:
    //   name: glusterfs-wx
    //   labels:
    //     tenxcloud.com/storageType: glusterfs
    //     texncloud.com/srType: share
    //     tenxcloud.com/reclaimPolicy: retain
    // spec:
    //   accessModes:
    //     - ReadWriteMany
    //   storageClassName: tenx-glusterfs1
    //   resources:
    //     requests:
    //       storage: 1Gi
  }
}

module.exports = PersistentVolumeClaim
