/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Utilities functions for quick create app
 *
 * v0.1 - 2017-05-05
 * @author Zhangpc
 */

import Deployment from '../../../../kubernetes/objects/deployment'
import Service from '../../../../kubernetes/objects/service'
import PersistentVolumeClaim from '../../../../kubernetes/objects/persistentVolumeClaim'
import { getResourceByMemory } from '../../../common/tools'
import {
  RESOURCES_DIY,
  SYSTEM_DEFAULT_SCHEDULE,
  GPU_ALGORITHM,
 } from '../../../constants'

export function getFieldsValues(fields) {
  const values = {}
  for (let key in fields) {
    if (fields.hasOwnProperty(key)) {
      values[key] = fields[key].value
    }
  }
  return values
}

export function formatValuesToFields(values) {
  const fields = {}
  Object.keys(values).map(key => fields[key] = { name: key, value: values[key] })
  return fields
}

export function buildJson(fields, cluster, loginUser, imageConfigs, isTemplate) {
  const fieldsValues = getFieldsValues(fields)
  // 获取各字段值
  const {
    serviceName, // 服务名称
    systemRegistry, // 镜像服务类型
    imageUrl, // 镜像地址
    imageTag, // 镜像版本
    apm, //是否开通 APM
    bindNode, // 绑定节点
    bindNodeType,//绑定节点类型
    bindLabel,//主机标签绑定
    resourceAlgorithm, // 容器配置算法 one of [X86, GPU]
    GPULimits, // GPU limits 数量
    resourceType, // 容器配置
    DIYMemory, // 自定义配置-内存
    DIYCPU, // 自定义配置-CPU
    DIYMaxMemory, // 自定义配置-最大内存
    DIYMaxCPU, // 自定义配置-最大CPU
    serviceType, // 服务类型(有状态, 无状态)
    storageType, // 存储类型(rbd, hostPath)
    storageList, // 存储的配置列表
    // storageKeys, // 存储的 keys(数组)
    replicas, // 实例数量
    accessType, // 是否为负载均衡
    accessMethod, //访问方式
    publicNetwork, //公网出口
    internaletwork, //内网出口
    portsKeys, // 端口的 keys(数组)
    lbKeys, // 访问方式为负载均衡时的端口(数组)
    argsType,
    command, // 进入点
    argsKeys, // 启动命令的 keys(数组)
    imagePullPolicy, // 重新部署时拉取镜像的方式(Always, IfNotPresent)
    timeZone, // 时区设置
    sourceType, // 日志采集-来源类型
    name, // 日志采集
    path, // 日志采集-日志目录
    inregex, // 日志采集-采集规则
    exregex, // 日志采集-排除规则
    livenessProtocol, // 高可用-协议类型
    livenessPort, // 高可用-端口
    livenessInitialDelaySeconds, // 高可用-首次检查延时
    livenessTimeoutSeconds, // 高可用-检查超时
    livenessPeriodSeconds, // 高可用-检查间隔
    livenessPath, // 高可用-Path 路径
    envKeys, // 环境变量的 keys(数组)
    configMapKeys, // 普通配置目录的 keys(数组)
    secretConfigMapKeys, // 加密配置目录的 keys(数组)
  } = fieldsValues
  const MOUNT_PATH = 'mountPath' // 容器目录
  const VOLUME = 'volume' // 存储卷(rbd)
  const READ_ONLY = 'readOnly' // 只读(rbd)
  const HOST_PATH = 'hostPath' // 本地目录(hostPath)
  const PORT = 'port' // 端口
  const PORT_PROTOCOL = 'portProtocol' // 端口协议(HTTP, TCP)
  const MAPPING_PORTTYPE = 'mappingPortType' // 映射服务端口类型(auto, special)
  const MAPPING_PORT = 'mappingPort' // 映射服务端口

  const deployment = new Deployment(serviceName)
  // set annotation => system/registry = dockerhub
  deployment.setAnnotations({
    'system/registry': systemRegistry
  })
  // 设置镜像地址
  deployment.addContainer(serviceName, `${imageUrl}:${imageTag}`)
  // 设置 APM
  if (apm) {
    deployment.setApmServiceLabel('pinpoint')
  }
  // 设置绑定节点
  if (bindNodeType == 'hostname') {
    if (bindNode !== SYSTEM_DEFAULT_SCHEDULE) {
      deployment.setNodeSelector(bindNode)
    }
  } else if (bindNodeType == 'hostlabel') {
    // 设置主机标签绑定节点
    deployment.setLabelSelector(bindLabel)
  }
  // 设置资源
  const { cpu, memory, limitCpu, limitMemory } = getResourceByMemory(resourceType, DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU)
  const paramsArray = [serviceName, memory, cpu, limitMemory, limitCpu]
  if (resourceAlgorithm === GPU_ALGORITHM) {
    paramsArray.push(GPULimits)
  }
  deployment.setContainerResources.apply(deployment, paramsArray)
  // 服务类型&存储
  const storage = []
  if (serviceType) {
    const storageForTemplate = []
    storageList.forEach((item, index) => {
      // volume
      const volume = {
        name: `volume-${index}`
      }
      let {
        type, mountPath, strategy,
        readOnly, name, volumeIsOld,
        size, fsType, storageClassName,
        hostPath,
      } = item
      // @Todo: reclaimPolicy??
      if (type === 'host') {
        const volumeMounts = [{
          mountPath,
          readOnly,
        }]
        volume.hostPath = {
          path: hostPath
        }
        if (isTemplate) {
          let volumeObj = {
            name: `${type}-${volume.name}`,
            storageClassName: `${type}-volume`,
            mountPath,
            hostPath,
            readOnly
          }
          storageForTemplate.push(volumeObj)
          deployment.setAnnotations({
            'system/template': JSON.stringify(storageForTemplate)
          })
        }
        deployment.addContainerVolumeV2(serviceName, volume, volumeMounts)
      } else {
        let volumeInfo = item.volume
        let image
        if (volumeInfo === 'create') {
          image = name
          const persistentVolumeClaim = new PersistentVolumeClaim({
            name,
            storageType: type === 'private'
              ? 'ceph'
              : 'nfs',
            storageClassName,
            fsType,
            storage: size ? `${size}Mi` : '512Mi',
          })
          storage.push(persistentVolumeClaim)
        } else {
          volumeInfo = volumeInfo.split(' ')
          image = volumeInfo[0]
          fsType = volumeInfo[1]
        }
        const volumeMounts = [{
          mountPath,
          readOnly,
        }]
        if (volumeIsOld) {
          volume.image = image
          volume.fsType = fsType
          deployment.addContainerVolume(serviceName, volume, volumeMounts)
        } else {
          volume.persistentVolumeClaim = {
            claimName: image,
            readOnly,
          }
          if (isTemplate) {
            delete volume.persistentVolumeClaim.claimName
            let storageType = type === 'private' ? 'ceph' : 'nfs'
            volume.name = `${storageType}-volume-${index}`
            let volumeObj = {
              name: volume.name,
              storageClassName,
              mountPath,
              readOnly
            }
            if (type === 'private') {
              Object.assign(volumeObj, {
                fsType,
                storage: size ? `${size}Mi` : '512Mi',
              })
            }
            storageForTemplate.push(volumeObj)
          }
          deployment.addContainerVolumeV2(serviceName, volume, volumeMounts)
        }
        if (isTemplate) {
          deployment.setAnnotations({
            'system/template': JSON.stringify(storageForTemplate)
          })
        }
      }
      /* if (storageType == 'rbd') {
        let volumeInfo = fieldsValues[`${VOLUME}${key}`]
        volumeInfo = volumeInfo.split(' ')
        volume.image = volumeInfo[0]
        volume.fsType = volumeInfo[1]
      } else if (storageType == 'hostPath') {
        const hostPath = fieldsValues[`${HOST_PATH}${key}`]
        volume.hostPath = {
          path: hostPath,
        }
      } */
    })
  }
  // 设置实例数量
  deployment.setReplicas(replicas)
  // 设置端口
  const service = new Service(serviceName, cluster)
  const { proxyType } = loginUser
  // 设置访问方式
  let groupID = "none"
  // 模板访问方式
  let templateGroup = "none"
  switch(accessMethod){
      case 'PublicNetwork': groupID = publicNetwork; templateGroup = 'PublicNetwork'; break;
      case 'Internaletwork': groupID = internaletwork; templateGroup = 'InternalNetwork'; break;
      case 'Cluster':
    default:
      groupID = 'none'; templateGroup = 'Cluster'; break
  }
  if (accessType === 'loadBalance') {
    // 访问方式为负载均衡
    lbKeys && lbKeys.forEach(key => {
      const port = parseInt(fieldsValues[`${PORT}-${key}`])
      const name = `${serviceName}-${key}`
      deployment.addContainerPort(serviceName, port)
      service.addPort(proxyType, name, null, port, port)
    })
  } else {
    if (isTemplate) {
      service.addLBGroupAnnotation(templateGroup)
    } else {
      service.addLBGroupAnnotation(groupID)
    }
    portsKeys && portsKeys.forEach(key => {
      if (key.deleted) {
        return
      }
      const keyValue = key.value
      const name = `${serviceName}-${keyValue}`
      const port = fieldsValues[`${PORT}${keyValue}`]
      const portProtocol = fieldsValues[`${PORT_PROTOCOL}${keyValue}`]
      const mappingPort = fieldsValues[`${MAPPING_PORT}${keyValue}`]
      const mappingPortType = fieldsValues[`${MAPPING_PORTTYPE}${keyValue}`]
      service.addPort(proxyType, name, portProtocol, port, port, mappingPort)
      if (groupID !== 'none') {
        // No need to expose ports if network mode is 'none'
        if (mappingPortType === 'special') {
          service.addPortAnnotation(name, portProtocol, mappingPort)
        } else {
          service.addPortAnnotation(name, portProtocol)
        }
      }
      deployment.addContainerPort(serviceName, port, portProtocol)
    })
  }
  // 设置进入点
  let {
    entrypoint,
  } = imageConfigs
  entrypoint = entrypoint && entrypoint.join(' ')
  if (command && command !== entrypoint) {
    deployment.addContainerCommand(serviceName, command)
  }
  // 设置启动命令
  if ((argsType && argsType !== 'default') && argsKeys) {
    const args = []
    argsKeys.forEach(key => {
      if (!key.deleted) {
        args.push(fieldsValues[`args${key.value}`])
      }
    })
    deployment.addContainerArgs(serviceName, args)
  }

  // 设置重新部署
  deployment.setContainerImagePullPolicy(serviceName, imagePullPolicy)
  // 设置时区
  if (timeZone) {
    deployment.syncTimeZoneWithNode(serviceName)
  }
  // 设置日志采集
  if (sourceType === 'directory') {
    let item = {
      path,
    }
    if(inregex){
      const reg = new RegExp(inregex)
      item.inregex = reg.toString()
    }
    if(exregex){
      const reg  = new RegExp(exregex)
      item.exregex = reg.toString()
    }
    if (name) {
      item.name = name
    } else {
      let name = 'volumename' + (Math.random() * 10000).toFixed(0)
      item.name = name
    }
    deployment.setCollectLog(serviceName, item)
  }
  // 设置高可用
  if (livenessProtocol === 'HTTP' || livenessProtocol === 'TCP') {
    deployment.setLivenessProbe(serviceName, livenessProtocol, {
      port: parseInt(livenessPort),
      path: livenessPath,
      initialDelaySeconds: parseInt(livenessInitialDelaySeconds),
      timeoutSeconds: parseInt(livenessTimeoutSeconds),
      periodSeconds: parseInt(livenessPeriodSeconds),
    })
    // Keep liveness and readiness probe the same
    deployment.setReadinessProbe(serviceName, livenessProtocol, {
      port: parseInt(livenessPort),
      path: livenessPath,
      initialDelaySeconds: parseInt(livenessInitialDelaySeconds),
      timeoutSeconds: parseInt(livenessTimeoutSeconds),
      periodSeconds: parseInt(livenessPeriodSeconds),
    })
  }
  // 设置环境变量
  let {
    defaultEnv,
  } = imageConfigs
  if (envKeys) {
    const envObj = {}
    defaultEnv && defaultEnv.forEach(env => {
      const [ key, ...value ] = env.split('=')
      envObj[key] = value.join('=')
    })
    envKeys.forEach(key => {
      if (!key.deleted) {
        const keyValue = key.value
        const envName = fieldsValues[`envName${keyValue}`]
        const envValueType = fieldsValues[`envValueType${keyValue}`]
        const envValue = fieldsValues[`envValue${keyValue}`]
        if (envName && envValue !== envObj[envName]) {
          if (envValueType === 'secret') {
            const valueFrom = {
              secretKeyRef: {
                name: envValue[0],
                key: envValue[1],
              }
            }
            deployment.addContainerEnv(serviceName, envName, null, valueFrom)
          } else {
            deployment.addContainerEnv(serviceName, envName, envValue)
          }
        }
      }
    })
  }

  // 设置普通配置目录
  if (configMapKeys) {
    configMapKeys.forEach(key => {
      if (!key.deleted) {
        const keyValue = key.value
        const configMapMountPath = fieldsValues[`configMapMountPath${keyValue}`]
        const configMapIsWholeDir = fieldsValues[`configMapIsWholeDir${keyValue}`]
        const configGroupName = fieldsValues[`configGroupName${keyValue}`]
        const configMapSubPathValues = fieldsValues[`configMapSubPathValues${keyValue}`]
        const volume = {
          name: `configmap-volume-${keyValue}`,
          configMap: {
            name: configGroupName && configGroupName[1],
            items: configMapSubPathValues.map(value => {
              return {
                key: value,
                path: value,
              }
            })
          }
        }
        let volumeMounts = []
        if (configMapIsWholeDir) {
          volumeMounts.push({
            mountPath: configMapMountPath,
          })
        } else {
          configMapSubPathValues.map(value => {
            volumeMounts.push({
              name: `configmap-volume-${keyValue}`,
              mountPath: configMapMountPath + '/' + value,
              subPath: value,
            })
          })
        }
        deployment.addContainerVolume(serviceName, volume, volumeMounts, configMapIsWholeDir)
      }
    })
  }

  // 设置加密配置目录
  if (secretConfigMapKeys) {
    secretConfigMapKeys.forEach(key => {
      if (!key.deleted) {
        const keyValue = key.value
        const secretConfigMapMountPath = fieldsValues[`secretConfigMapMountPath${keyValue}`]
        const secretConfigMapIsWholeDir = fieldsValues[`secretConfigMapIsWholeDir${keyValue}`]
        const secretConfigGroupName = fieldsValues[`secretConfigGroupName${keyValue}`]
        const secretConfigMapSubPathValues = fieldsValues[`secretConfigMapSubPathValues${keyValue}`]
        const volume = {
          name: `secret-volume-${keyValue}`,
          secret: {
            secretName: secretConfigGroupName,
          },
        }
        if (!secretConfigMapIsWholeDir) {
          volume.secret.items = secretConfigMapSubPathValues.map(value => {
            return {
              key: value,
              path: value,
            }
          })
        }
        const volumeMounts = []
        volumeMounts.push({
          name: `secret-volume-${keyValue}`,
          mountPath: secretConfigMapMountPath,
          readOnly: true,
        })
        deployment.addContainerVolume(serviceName, volume, volumeMounts, true)
      }
    })
  }

  return { deployment, service, storage }
}