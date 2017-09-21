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
    } = config
    if (!fsType) {
      fsType = 'ext4'
    }
    if (!srType) {
      if (storageType === 'ceph') {
        srType = 'private'
      } else if (storageType === 'nfs') {
        srType = 'share'
      }
    }
    if (!reclaimPolicy) {
      reclaimPolicy = 'delete'
    }
    if (!accessModes) {
      if (storageType === 'ceph') {
        accessModes = 'ReadWriteOnce'
      } else if (storageType === 'nfs') {
        accessModes = 'ReadWriteMany'
      }
    }
    if (!storage) {
      storage = '512Mi'
    }
    this.kind = 'PersistentVolumeClaim'
    this.apiVersion = 'v1'
    this.metadata = {
      name,
      labels: {
        'tenxcloud.com/fsType': fsType,
        'tenxcloud.com/storageType': storageType,
        'texncloud.com/srType': srType,
        'tenxcloud.com/reclaimPolicy': reclaimPolicy,
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
  }
}

module.exports = PersistentVolumeClaim