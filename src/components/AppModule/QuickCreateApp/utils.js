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
import { getResourceByMemory } from '../../../common/tools'
import {
  RESOURCES_DIY,
  SYSTEM_DEFAULT_SCHEDULE,
 } from '../../../constants'

export function buildYaml(json) {
  //
}

export function getFieldsValues(fields) {
  const values = {}
  for (let key in fields) {
    if (fields.hasOwnProperty(key)) {
      values[key] = fields[key].value
    }
  }
  return values
}

export function buildJson(fields, cluster, loginUser) {
  const fieldsValues = getFieldsValues(fields)
  // 获取各字段值
  const {
    serviceName, // 服务名称
    imageUrl, // 镜像地址
    imageTag, // 镜像版本
    bindNode, // 绑定节点
    resourceType, // 容器配置
    DIYMemory, // 自定义配置-内存
    DIYCPU, // 自定义配置-CPU
    serviceType, // 服务类型(有状态, 无状态)
    storageType, // 存储类型(rbd, hostPath)
    storageKeys, // 存储的 keys(数组)
    replicas, // 实例数量
    portsKeys, // 端口的 keys(数组)
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
  // 设置镜像地址
  deployment.addContainer(serviceName, `${imageUrl}:${imageTag}`)
  // 设置绑定节点
  if (bindNode !== SYSTEM_DEFAULT_SCHEDULE) {
    deployment.setNodeSelector(bindNode)
  }
  // 设置资源
  const { cpu, memory } = getResourceByMemory(resourceType, DIYMemory, DIYCPU)
  deployment.setContainerResources(serviceName, memory, cpu)
  // 服务类型&存储
  if (serviceType) {
    storageKeys.forEach(key => {
      // volume
      const volume = {
        name: `volume-${key}`
      }
      if (storageType == 'rbd') {
        let volumeInfo = fieldsValues[`${VOLUME}${key}`]
        volumeInfo = volumeInfo.split('/')
        volume.image = volumeInfo[0]
        volume.fsType = volumeInfo[1]
      } else if (storageType == 'hostPath') {
        const hostPath = fieldsValues[`${HOST_PATH}${key}`]
        volume.hostPath = {
          path: hostPath,
        }
      }
      // volumeMounts
      const mountPath = fieldsValues[`${MOUNT_PATH}${key}`]
      const readOnly = fieldsValues[`${READ_ONLY}${key}`]
      const volumeMounts = [{
        mountPath,
        readOnly,
      }]
      deployment.addContainerVolume(serviceName, volume, volumeMounts)
    })
  }
  // 设置实例数量
  deployment.setReplicas(replicas)
  // 设置端口
  const service = new Service(serviceName, cluster)
  const { proxyType } = loginUser
  portsKeys.forEach(key => {
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
    if (mappingPortType === 'special') {
      service.addPortAnnotation(name, portProtocol, mappingPort)
    } else {
      service.addPortAnnotation(name, portProtocol)
    }
    deployment.addContainerPort(serviceName, port, portProtocol)
  })

  return { deployment, service }
}