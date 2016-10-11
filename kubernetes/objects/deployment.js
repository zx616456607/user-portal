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
      container.resources = _getResourceByMemory(memory)
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
          fsType: volume.fsType,
          image: volume.image
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

function _getResourceByMemory(memory) {
  const resources = {
    limits: {
      memory: "256Mi"
    },
    requests: {
      cpu: "60m",
      memory: "256Mi"
    }
  }
  switch (memory) {
    case '512Mi':
      resources.limits.memory = '512Mi'
      resources.requests.cpu = '125m'
      resources.requests.memory = '512Mi'
      break
    case '1024Mi':
      resources.limits.memory = '1024Mi'
      resources.requests.cpu = '250m'
      resources.requests.memory = '1024Mi'
      break;
    case '2048Mi':
      resources.limits.memory = '2048Mi'
      resources.requests.cpu = '500m'
      resources.requests.memory = '2048Mi'
      break;
    case '4096Mi':
      resources.limits.memory = '4096Mi'
      resources.requests.cpu = '700m'
      resources.requests.memory = '4096Mi'
    case '8192Mi':
      resources.limits.memory = '8192Mi'
      resources.requests.cpu = '1200m'
      resources.requests.memory = '8192Mi'
      break;
    case '16384Mi':
      resources.limits.memory = '16384Mi'
      resources.requests.cpu = '3000m'
      resources.requests.memory = '16384Mi'
      break;
  }
  return resources
}

module.exports = Deployment