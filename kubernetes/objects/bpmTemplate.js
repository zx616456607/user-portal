/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Bpm class for k8s
 *
 * @author zhangxuan
 * @date 2018-09-11
 */

'use strict'

const utils = require('../utils')

class BpmTemplate {
  constructor(name, namespace) {
    this.kind = 'BpmCluster'
    this.apiVersion = 'appcenter.tenxcloud.com/v1beta1'
    this.metadata = {
      name,
      namespace,
      annotations: {}
    }
    this.spec = {
      bpm: {
        resources: {},
        Image: '',
        ImagePullPolicy: 'Always',
        replicas: 1,
        volumeClaimTemplate: {
          metadata: {
            name: 'bpm',
          },
          spec: {
            accessModes: ['ReadWriteOnce'],
            resources: {
              requests: {
                storage: '512Mi'
              }
            },
          }
        }
      },
      data: {
        resources: {},
        Image: '',
        ImagePullPolicy: 'Always',
        replicas: 1,
        volumeClaimTemplate: {
          metadata: {
            name: 'data',
          },
          spec: {
            accessModes: ['ReadWriteOnce'],
            resources: {
              requests: {
                storage: ''
              }
            },
          }
        }
      }
    }
  }

  setAnnotations(annotations) {
    Object.assign(
      this.metadata.annotations,
      annotations,
    )
  }

  setResources(requestMemory, requestCpu, limitMemory, limitCpu) {
    const resources = utils.getResources(requestMemory, requestCpu, limitMemory, limitCpu)

    this.spec.bpm.resources = Object.assign(
      {},
      {...JSON.parse(JSON.stringify(resources))}
    )
    this.spec.data.resources = Object.assign(
      {},
      {...JSON.parse(JSON.stringify(resources))}
    )
  }

  setReplicas(replicas) {
    this.spec.bpm.replicas = this.spec.data.replicas = replicas
  }

  setBpmImage(image) {
    this.spec.bpm.Image = image
  }

  setMysqlImage(image) {
    this.spec.data.Image = image
  }

  setBpmStorage(storageClassName) {
    this.spec.bpm.volumeClaimTemplate.spec.storageClassName = storageClassName
  }

  setMysqlStorage(storageClassName, storage) {
    this.spec.data.volumeClaimTemplate.spec.storageClassName = storageClassName
    this.spec.data.volumeClaimTemplate.spec.resources.requests.storage = storage
  }
}

module.exports = BpmTemplate
