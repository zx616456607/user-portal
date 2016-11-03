/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Deployment class for k8s
 *
 * v0.1 - 2016-10-11
 * @author Zhangpc
 */
'use strict'

const DEFAULT_DISKTYPE = 'rbd'
const Container = require('./container')
const TENXCLOUD_PREFIX = 'tenxcloud.com/'
const utils = require('../utils')

class Deployment {
  constructor(name) {
    this.kind = 'Deployment'
    this.apiVersion = 'v1'
    this.metadata = {
      name,
      labels: {
        name
      }
    }
    this.spec = {
      replicas: 1,
      selector: {
        matchLabels: {
          name
        }
      },
      template: {
        metadata: {
          labels: {
            name
          }
        },
        spec: {
          containers: []
        }
      }
    }
  }

  importFromK8SDeployment(k8sDeployment) {
    if (k8sDeployment.metadata) {
      if (k8sDeployment.metadata.name) {
        this.metadata.name = k8sDeployment.metadata.name
      }
      if (k8sDeployment.metadata.labels) {
        for (let key in k8sDeployment.metadata.labels) {
          //Remove tenxcloud added labels
          if (key.indexOf(TENXCLOUD_PREFIX) != 0) {
            this.metadata.labels[key] = k8sDeployment.metadata.labels[key]
          }
        }
      }
    }

    if (k8sDeployment.spec) {
      if (k8sDeployment.spec.replicas) {
        this.spec.replicas = k8sDeployment.spec.replicas
      }
      if (k8sDeployment.spec.selector) {
        this.spec.selector = k8sDeployment.spec.selector
      }
      if (k8sDeployment.spec.template) {
        this.spec.template = k8sDeployment.spec.template
        if (k8sDeployment.spec.template.metadata) {
          let metadata = {}
          for (let key in k8sDeployment.spec.template.metadata) {
            //Remove 'creationTimestamp' tag
            if (key != 'creationTimestamp') {
              metadata[key] = k8sDeployment.spec.template.metadata[key]
            }
          }
          this.spec.template.metadata = metadata

          if (k8sDeployment.spec.template.metadata.labels) {
            let labels = {}
            for (let key in k8sDeployment.spec.template.metadata.labels) {
              //Remove tenxcloud added labels
              if (key.indexOf(TENXCLOUD_PREFIX) != 0) {
                labels[key] = k8sDeployment.spec.template.metadata.labels[key]
              }
            }
            this.spec.template.metadata.labels = labels
          }

          if (k8sDeployment.spec.template.spec && k8sDeployment.spec.template.spec.volumes) {
            let volumes = []
            for (let vol of k8sDeployment.spec.template.spec.volumes) {
              let volume = {name: vol.name}
              if (vol.rbd && vol.rbd.image) {
                let strs = vol.rbd.image.split('.')
                volume.rbd = {image: strs[strs.length-1]}
              }
              volumes.push(volume)
             }
             this.spec.template.spec.volumes = volumes
          }
        }
      }
    }
  }

  setReplicas(replicas) {
    replicas = parseInt(replicas)
    if (isNaN(replicas)) {
      return
    }
    this.spec.replicas = replicas
  }

  addContainer(name, image) {
    const container = new Container(name, image)
    this.spec.template.spec.containers.push(container)
  }

  setContainerResources(containerName, memory) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      container.resources = utils.getResourcesByMemory(memory)
    })
  }

  // ~ containerPort = targetPort(Service)
  addContainerPort(containerName, containerPort, protocol) {
    protocol = (protocol === 'UDP' ? 'UDP' : 'TCP')
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      container.ports.push({
        containerPort,
        protocol
      })
    })
  }

  addContainerEnv(containerName, name, value) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      container.env.push({
        name,
        value
      })
    })
  }

  addContainerArgs(containerName, args) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      if (!container.args) {
        container.args = []
      }
      container.args.push(args)
    })
  }

  addContainerCommand(containerName, command) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      if (!container.command) {
        container.command = []
      }
      container.command.push(command)
    })
  }

  // ~ Image pull policy. One of Always, Never, IfNotPresent. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise.
  setContainerImagePullPolicy(containerName, imagePullPolicy) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      container.imagePullPolicy = imagePullPolicy || 'IfNotPresent'
    })
  }

  // ~ volume={name, diskType, fsType, image} volumeMounts={mountPath, readOnly}
  addContainerVolume(containerName, volume, volumeMounts) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      if (!container.volumeMounts) {
        container.volumeMounts = []
      }
      if (!this.spec.template.spec.volumes) {
        this.spec.template.spec.volumes = []
      }
      container.volumeMounts.push({
        name: volume.name,
        mountPath: volumeMounts.mountPath,
        readOnly: volumeMounts.readOnly || false
      })
      if (volume.hostPath) {
        this.spec.template.spec.volumes.push({
          name: volume.name,
          hostPath: {
            path: volume.hostPath.path
          }
        })
        return
      }
      if (volume.configMap) {
        this.spec.template.spec.volumes.push({
          name: volume.name,
          configMap: {
            name: volume.configMap.name,
            items: volume.configMap.items.map((item) => {
              return {
                key: item.key,
                path: item.path
              }
            })
          }
        })
        return
      }
      if (!volume.diskType) {
        volume.diskType = DEFAULT_DISKTYPE
      }
      this.spec.template.spec.volumes.push({
        name: volume.name,
        [volume.diskType]: {
          //fsType: volume.fsType,
          image: volume.image,
          fsType: volume.fsType
        }
      })
    })
  }

  syncTimeZoneWithNode(containerName) {
    const volume = {
      "name": "tenxcloud-time-zone",
      "hostPath": {
        "path": "/etc/localtime"
      }
    }
    const volumeMounts = {
      name: "tenxcloud-time-zone",
      mountPath: "/etc/localtime",
      readOnly: true
    }
    this.addContainerVolume.apply(this, [containerName, volume, volumeMounts])
  }

  // ~ probe={port, path, initialDelaySeconds, timeoutSeconds, periodSeconds}
  setLivenessProbe(containerName, protocol, probe) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      const livenessProbe = {}
      if (protocol === 'HTTP') {
        livenessProbe.httpGet = {
          port: probe.port,
          path: probe.path
        }
      }
      if (protocol === 'TCP') {
        livenessProbe.tcpSocket = {
          port: probe.port
        }
      }
      livenessProbe.initialDelaySeconds = probe.initialDelaySeconds
      livenessProbe.timeoutSeconds = probe.timeoutSeconds
      livenessProbe.periodSeconds = probe.periodSeconds
      container.livenessProbe = livenessProbe
    })
  }
}

module.exports = Deployment