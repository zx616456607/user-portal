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

const constants = require('../../constants')
const TENX_LOCAL_TIME_VOLUME = constants.TENX_LOCAL_TIME_VOLUME
const K8S_NODE_SELECTOR_KEY = constants.K8S_NODE_SELECTOR_KEY
const K8S_NODE_SELECTOR_OS_KEY = constants.K8S_NODE_SELECTOR_OS_KEY
const APM_SERVICE_LABEL_KEY = constants.APM_SERVICE_LABEL_KEY
const DEFAULT_DISKTYPE = 'rbd'
const Container = require('./container')
const TENXCLOUD_PREFIX = 'system/'
const utils = require('../utils')

class Deployment {
  constructor(name) {
    this.kind = 'Deployment'
    this.apiVersion = 'v1'
    this.metadata = {
      name,
      labels: {
        name
      },
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
      let metadata = {}
      if (k8sDeployment.metadata.name) {
        metadata.name = k8sDeployment.metadata.name
      }
      if (k8sDeployment.metadata.labels) {
        let labels = {}
        for (let key in k8sDeployment.metadata.labels) {
          //Remove tenxcloud added labels
          if (key.indexOf(TENXCLOUD_PREFIX) != 0) {
            labels[key] = k8sDeployment.metadata.labels[key]
          }
        }
        if (Object.keys(labels).length > 0) {
          metadata.labels = labels
        }
      }
      if (Object.keys(metadata).length > 0) {
        this.metadata = metadata
      }
    }

    if (k8sDeployment.spec) {
      let spec = {}
      if (k8sDeployment.spec.replicas) {
        spec.replicas = k8sDeployment.spec.replicas
      }
      if (k8sDeployment.spec.selector) {
        spec.selector = k8sDeployment.spec.selector
      }
      if (k8sDeployment.spec.template) {
        let template = {}
        if (k8sDeployment.spec.template.metadata) {
          let metadata = {}
          for (let key in k8sDeployment.spec.template.metadata) {
            //Remove 'creationTimestamp' tag
            if (key != 'creationTimestamp') {
              metadata[key] = k8sDeployment.spec.template.metadata[key]
            }
          }

          if (k8sDeployment.spec.template.metadata.labels) {
            let labels = {}
            for (let key in k8sDeployment.spec.template.metadata.labels) {
              //Remove tenxcloud added labels
              if (key.indexOf(TENXCLOUD_PREFIX) != 0) {
                labels[key] = k8sDeployment.spec.template.metadata.labels[key]
              }
            }
            if (Object.keys(labels).length > 0) {
              metadata.labels = labels
            }
          }
          if (Object.keys(metadata).length > 0) {
            template.metadata = metadata
          }
        }

        if (k8sDeployment.spec.template.spec) {
          let spec = {}
          if (k8sDeployment.spec.template.spec.volumes) {
            let volumes = []
            for (let vol of k8sDeployment.spec.template.spec.volumes) {
              let volume = vol
              if (vol.rbd && vol.rbd.image) {
                let strs = vol.rbd.image.split('.')
                volume.rbd = {image: strs[strs.length - 1]}
              }
              volumes.push(volume)
            }
            if (Object.keys(volumes).length > 0) {
              spec.volumes = volumes
            }
          }

          if (k8sDeployment.spec.template.spec.containers) {
            let containers = []

            for (let ct of k8sDeployment.spec.template.spec.containers) {
              let container = {}
              if (ct.name) {
                container.name = ct.name
              }
              if (ct.image) {
                container.image = ct.image
              }
              if (ct.ports) {
                container.ports = ct.ports
              }
              if (ct.env) {
                container.env = ct.env
              }
              if (ct.command) {
                container.command = ct.command
              }
              if (ct.livenessProbe) {
                container.livenessProbe = ct.livenessProbe
              }
              if (ct.readinessProbe) {
                container.readinessProbe = ct.readinessProbe
              }
              if (ct.args) {
                container.args = ct.args
              }
              if (ct.volumeMounts) {
                container.volumeMounts = ct.volumeMounts
              }
              if (ct.resources) {
                let resources = {}
                if (ct.resources.limits) {
                  let limits = {}
                  if (ct.resources.limits.cpu) {
                    limits.cpu = ct.resources.limits.cpu
                  }
                  if (ct.resources.limits.memory) {
                    limits.memory = ct.resources.limits.memory
                  }
                  if (Object.keys(limits).length > 0) {
                    resources.limits = limits
                  }
                }
                if (ct.resources.requests) {
                  let requests = {}
                  // Handle cpu allocation in api-server side
                  if (ct.resources.requests.cpu) {
                    requests.cpu = ct.resources.requests.cpu
                  }
                  if (ct.resources.requests.memory) {
                    requests.memory = ct.resources.requests.memory
                  }
                  if (Object.keys(requests).length > 0) {
                    resources.requests = requests
                  }
                }
                if (Object.keys(resources).length > 0) {
                  container.resources = resources
                }
              }
              if (Object.keys(container).length > 0) {
                containers.push(container)
              }
            }
            if (containers.length > 0) {
              spec.containers = containers
            }
          }

          if (Object.keys(spec).length > 0) {
            template.spec = spec
          }
        }

        if (Object.keys(template).length > 0) {
          spec.template = template
        }
      }
      if (Object.keys(spec).length > 0) {
        this.spec = spec
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

  setApmServiceLabel(type) {
    this.spec.template.metadata.labels[APM_SERVICE_LABEL_KEY] = type
  }

  setContainerResources(containerName, memory, cpu, limitMemory, limitCpu, GPU) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      if (GPU) {
        container.resources = utils.getGPUResources(GPU, memory, cpu, limitMemory, limitCpu)
        return
      }
      container.resources = utils.getResources(memory, cpu, limitMemory, limitCpu)
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

  addContainerEnv(containerName, name, value, valueFrom) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      const envObj = {
        name,
        value,
      }
      if (valueFrom) {
        envObj.valueFrom = valueFrom
      }
      container.env.push(envObj)
    })
  }

  addContainerArgs(containerName, args) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      if (!args) return
      if (args.length == 1 && !args[0]) return
      if (!container.args) {
        container.args = []
      }
      if (Array.isArray(args)) {
        container.args = container.args.concat(args)
      } else {
        let argArray = args.split(' ')
        argArray.forEach(function (arg) {
          if (arg != "") {
            container.args.push(arg)
          }
        })
      }
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
      if (Array.isArray(command)) {
        container.command = container.command.concat(command)
      } else {
        let cmdArray = command.split(' ')
        cmdArray.forEach(function (cmd) {
          if (cmd != "") {
            container.command.push(cmd)
          }
        })
      }
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
  addContainerVolume(containerName, volume, volumeMounts, isWholeDir) {
    this.spec.template.spec.containers.map(container => {
      if (container.name !== containerName) {
        return
      }
      if (!container.volumeMounts) {
        container.volumeMounts = []
      }
      if (!this.spec.template.spec.volumes) {
        this.spec.template.spec.volumes = []
      }
      volumeMounts.forEach(item => {
        if (!isWholeDir) {
          const body = {
            name: volume.name,
            mountPath: item.mountPath,
            readOnly: item.readOnly || false
          }
          if (item.subPath) {
            body.subPath = item.subPath
          }
          if (item.subPath) {
            body.subPath = item.subPath
          }
          if (item.$patch === 'delete') {
            body.$patch = 'delete'
          }
          container.volumeMounts.push(body)
        } else {
          const temp = {
            name: volume.name,
            mountPath: item.mountPath,
            readOnly: item.readOnly || false
          }
          if (item.$patch === 'delete') {
            temp.$patch = 'delete'
          }
          container.volumeMounts.push(temp)
        }
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
        let configMap = {}
        // if (isWholeDir) {
        //   configMap = {
        //     name: volume.configMap.name
        //   }
        // } else {
        configMap = {
          name: volume.configMap.name,
          items: volume.configMap.items.map((item) => {
            return {
              // TODO: fix this later, be compatible with previous version
              key: item.key, // .toLowerCase(),
              path: item.path
            }
          })
        }
        // }
        const temp = {
          name: volume.name,
          configMap
        }
        if (volume.$patch === 'delete') {
          temp.$patch = 'delete'
        }
        this.spec.template.spec.volumes.push(temp)
        return
      }
      if (volume.secret) {
        this.spec.template.spec.volumes.push(volume)
        return
      }
      if (volume.emptyDir) {
        this.spec.template.spec.volumes.push({
          name: volume.name,
          emptyDir: {},
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

  addContainerVolumeV2(containerName, volume, volumeMounts) {
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
      volumeMounts.forEach(item => {
        const body = {
          name: volume.name,
          mountPath: item.mountPath,
          readOnly: item.readOnly || false
        }
        container.volumeMounts.push(body)
      })
      this.spec.template.spec.volumes.push(volume)
    })
  }

  syncTimeZoneWithNode(containerName) {
    const volumeMounts = {
      name: TENX_LOCAL_TIME_VOLUME.name,
      mountPath: TENX_LOCAL_TIME_VOLUME.hostPath.path,
      readOnly: true
    }
    this.addContainerVolume.apply(this, [containerName, TENX_LOCAL_TIME_VOLUME, [volumeMounts]])
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
      livenessProbe.successThreshold = probe.successThreshold
      livenessProbe.failureThreshold = probe.failureThreshold
      container.livenessProbe = livenessProbe
    })
  }

  setReadinessProbe(containerName, protocol, probe) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      const readinessProbe = {}
      if (protocol === 'HTTP') {
        readinessProbe.httpGet = {
          port: probe.port,
          path: probe.path
        }
      }
      if (protocol === 'TCP') {
        readinessProbe.tcpSocket = {
          port: probe.port
        }
      }
      readinessProbe.initialDelaySeconds = probe.initialDelaySeconds
      readinessProbe.timeoutSeconds = probe.timeoutSeconds
      readinessProbe.periodSeconds = probe.periodSeconds
      readinessProbe.successThreshold = probe.successThreshold
      readinessProbe.failureThreshold = probe.failureThreshold
      container.readinessProbe = readinessProbe
    })
  }

  setNodeSelector({ hostname, os }) {
    if (hostname) {
      this.spec.template.spec.nodeSelector = {
        [K8S_NODE_SELECTOR_KEY]: hostname,
      }
    }
    if (os) {
      this.spec.template.spec.nodeSelector = {
        [K8S_NODE_SELECTOR_OS_KEY]: os,
      }
    }
  }

  ensureNodeAffinityDefaultValue() {
    this.spec.template.spec.affinity = this.spec.template.spec.affinity || {}
    const affinity = this.spec.template.spec.affinity
    affinity.nodeAffinity = affinity.nodeAffinity || {}
    const nodeAffinity = affinity.nodeAffinity
    nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution = nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution || {}
    // const policy = nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution
    // policy.nodeSelectorTerms = policy.nodeSelectorTerms || []

    //新增的 自定义属性 的默认值
    // nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution = nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution || []
    // const preMode = nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution

    // affinity.podAffinity = affinity.podAffinity || {}
    // affinity.podAntiAffinity = affinity.podAntiAffinity || {}
    // const podAffinity = affinity.podAffinity
    // const podAntiAffinity = affinity.podAntiAffinity
    // podAffinity.requiredDuringSchedulingIgnoredDuringExecution = podAffinity.requiredDuringSchedulingIgnoredDuringExecution || []
    // podAffinity.preferredDuringSchedulingIgnoredDuringExecution = podAffinity.preferredDuringSchedulingIgnoredDuringExecution || []
    // podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution =  podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution || []
    // podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution = podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution || []
  }

  setLabelSelector(labels) {
    if (labels && labels.length && labels.length > 0) {
      this.ensureNodeAffinityDefaultValue()
      const policy = this.spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution
      policy.nodeSelectorTerms = policy.nodeSelectorTerms.concat(this.makeNodeAffinity(labels))
    }
  }

  setServicePointSelector(tag) {
    if (tag && tag.length && tag.length > 0) {
      this.spec.template.spec.affinity = this.spec.template.spec.affinity || {}
      const affinity = this.spec.template.spec.affinity
      affinity.nodeAffinity = affinity.nodeAffinity || {}
      const requiredTag = []
      const preferredTag = []
      tag.map( (item,index) => {
        if (item.point === '必须') {
          requiredTag.push(item)
        }else if (item.point === '最好') {
          preferredTag.push(item)
        }
      })
      // this.ensureNodeAffinityDefaultValue()
      const policy = affinity.nodeAffinity
      if (requiredTag && requiredTag.length && requiredTag.length > 0) {
        policy.requiredDuringSchedulingIgnoredDuringExecution = policy.requiredDuringSchedulingIgnoredDuringExecution || {}
        const reqMode = policy.requiredDuringSchedulingIgnoredDuringExecution
        reqMode.nodeSelectorTerms = reqMode.nodeSelectorTerms || []
        const reqArr = reqMode.nodeSelectorTerms
        reqMode.nodeSelectorTerms = reqArr.concat(this.makeNodeRequiredAffinity(requiredTag))
      }
      if (preferredTag && preferredTag.length && preferredTag.length > 0) {
        policy.preferredDuringSchedulingIgnoredDuringExecution = policy.preferredDuringSchedulingIgnoredDuringExecution || []
        let preMode = policy.preferredDuringSchedulingIgnoredDuringExecution
        policy.preferredDuringSchedulingIgnoredDuringExecution = preMode.concat( this.nodePrederredAffinity(preferredTag) )
      }
    }
  }

  //服务与服务的亲和性
  setServicePodSelector(tag=[], advanceSet, appName) {
    if (advanceSet) {
      tag.push({
        key: "name",
        mark: "NotIn",
        point: "必须",
        value: appName,
      })
    }
    if (tag && tag.length && tag.length > 0) {
      const requiredTag = []
      const preferredTag = []
      const notRequiredTag = []
      const notPreferredTag = []
      tag.map( (item,index) => {
        if (item.point === '必须') {
          requiredTag.push(item)
        }else if (item.point === '最好') {
          preferredTag.push(item)
        }else if (item.point === '必须不') {
          notRequiredTag.push(item)
        }else if (item.point === '最好不') {
          notPreferredTag.push(item)
        }
      })
      // this.ensureNodeAffinityDefaultValue()
      this.spec.template.spec.affinity = this.spec.template.spec.affinity || {}
      const affinity = this.spec.template.spec.affinity
      if (requiredTag.length>0 || preferredTag.length>0) {
        affinity.podAffinity = affinity.podAffinity ||{}
        const pod = affinity.podAffinity
        if (requiredTag && requiredTag.length && requiredTag.length > 0) {
          pod.requiredDuringSchedulingIgnoredDuringExecution = pod.requiredDuringSchedulingIgnoredDuringExecution || []
          let reqMode = pod.requiredDuringSchedulingIgnoredDuringExecution
          pod.requiredDuringSchedulingIgnoredDuringExecution = reqMode.concat( this.podRequiredAffinity(requiredTag) )
        }
        if (preferredTag && preferredTag.length && preferredTag.length > 0) {
          pod.preferredDuringSchedulingIgnoredDuringExecution = pod.preferredDuringSchedulingIgnoredDuringExecution || []
          let preMode = pod.preferredDuringSchedulingIgnoredDuringExecution
          pod.preferredDuringSchedulingIgnoredDuringExecution = preMode.concat( this.podPreferredAffinity(preferredTag) )
        }
      }
      if (notRequiredTag.length>0 || notPreferredTag.length>0) {
        affinity.podAntiAffinity =  affinity.podAntiAffinity || {}
        const antiPod = affinity.podAntiAffinity
        if (notRequiredTag && notRequiredTag.length && notRequiredTag.length > 0) {
          antiPod.requiredDuringSchedulingIgnoredDuringExecution = antiPod.requiredDuringSchedulingIgnoredDuringExecution || []
          let antiReqMode = antiPod.requiredDuringSchedulingIgnoredDuringExecution
          antiPod.requiredDuringSchedulingIgnoredDuringExecution = antiReqMode.concat( this.podRequiredAffinity(notRequiredTag) )
        }
        if (notPreferredTag && notPreferredTag.length && notPreferredTag.length > 0) {
          antiPod.preferredDuringSchedulingIgnoredDuringExecution = antiPod.preferredDuringSchedulingIgnoredDuringExecution || []
          let antiPreMode = antiPod.preferredDuringSchedulingIgnoredDuringExecution
          antiPod.preferredDuringSchedulingIgnoredDuringExecution = antiPreMode.concat( this.podPreferredAffinity(notPreferredTag) )
        }
      }
    }
  }

  setCollectLog(serviceName, item) {
    const annotations = {}
    let volume = {
      name: item.name,
      emptyDir: {}
    }
    let volumeMounts = [{
      mountPath: item.path,
      name: item.name,
    }]
    this.addContainerVolume(serviceName, volume, volumeMounts)
    if (!annotations["applogs"]) {
      annotations["applogs"] = []
    } else {
      annotations["applogs"] = JSON.parse(annotations["applogs"] = [])
    }
    annotations["applogs"].push(item)
    annotations["applogs"] = JSON.stringify(annotations["applogs"])
    this.setAnnotations(annotations)
  }

  makeNodeAffinity(labels) {
    const multiMap = {}
    labels.forEach(label => this.mergeLabelsToMultiMap(multiMap, label))
    return [
      {
        matchExpressions: Object.getOwnPropertyNames(multiMap).map(
          key => this.multiMapEntryToMatchExpression(key, multiMap.operator, multiMap[key]))
      }
    ]
  }

  makeNodeRequiredAffinity(labels) {
    return [
      {
        matchExpressions: this.setItemIntoArr(labels)
      }
    ]
  }

  nodePrederredAffinity(tags) {
    return [
      {
        weight: 1,
        preference: {
          matchExpressions: this.setItemIntoArr(tags) //tagArr
        }
      }
    ]
  }

  podRequiredAffinity(tags) {
    return [
      {
        labelSelector: {
          matchExpressions: this.setItemIntoArr(tags)  //podArr
        },
        topologyKey: 'kubernetes.io/hostname'
      }
    ]
  }

  podPreferredAffinity(tags) {
    return {
      weight: 1,
      podAffinityTerm: {
        labelSelector: {
          matchExpressions: this.setItemIntoArr(tags)
        },
        topologyKey: 'beta.kubernetes.io/os'
      }
    }

  }

  setItemIntoArr(items) {
    const arg = []
    items.map( item => {
      if (item.mark == 'In' || item.mark == 'NotIn') {
        arg.push({
          key: item.key,
          operator: item.mark,
          values: [item.value]
        })
      }else if (item.mark == 'Exists' || item.mark == 'DoesNotExist') {
        arg.push({
          key: item.key,
          operator: item.mark,
        })
      }else if(item.mark == 'Gt' || item.mark == 'Lt') {
        arg.push({
          key: item.key,
          operator: item.mark,
          values: [
            item.value
          ]
        })
      }

    })
    return arg
  }

  mergeLabelsToMultiMap(multiMap, label) {
    const key = label.key
    const operator = label.mark
    const value = label.value
    if (multiMap.hasOwnProperty(key) && multiMap.key == operator ) {
      // multiMap[key].push(value)

    } else {
      multiMap[key] = value
      multiMap.operator = operator
      multiMap.push({

      })
    }
  }

  multiMapEntryToMatchExpression(key, operators, values) {
    return {
      'key':key,
      'operator': operators,
      //operator: "In",
      'values': values,
    }
  }


  setAnnotations(annotations) {
    this.spec.template.metadata.annotations = Object.assign(
      {},
      this.spec.template.metadata.annotations,
      annotations
    )
  }
  setMetaAnnotations(annotations) {
    this.metadata.annotations = Object.assign(
      {},
      this.metadata.annotations,
      annotations || {}
    )
  }
  setHostnameAndSubdomain(hostname, subdomain) {
    if (hostname && (hostname.trim() !== "")) {
      this.spec.template.spec.hostname = hostname
    }
    if (subdomain && (subdomain.trim() !== "")) {
      this.spec.template.spec.subdomain = subdomain
    }
  }

  setHostAliases(hostAliases) {
    this.spec.template.spec.hostAliases = hostAliases
  }
}

module.exports = Deployment
