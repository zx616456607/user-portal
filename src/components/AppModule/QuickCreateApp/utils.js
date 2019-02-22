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
import isEmpty from 'lodash/isEmpty'
import {
  RESOURCES_DIY,
  SYSTEM_DEFAULT_SCHEDULE,
  GPU_ALGORITHM,
  NO_CLASSIFY,
  CONFIGMAP_CLASSIFY_CONNECTION,
  OTHER_IMAGE
 } from '../../../constants'
import { deploymentLog } from '../../../actions/cicd_flow';
import isCidr from 'is-cidr'
import { flowContainerIN, flowContainerOut } from '../../../../src/constants'

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

/**
 * 校验配置文件路径、加密配置文件路径、存储卷挂载目录是否冲突
 *
 * @export
 * @param {object} form form 对象
 * @param {string} index 当前表单所在 index
 * @param {string} value 当前输入值
 * @param {string} type 'configMap' || 'secretConfigMap' || 'volume'
 * @return {string} 'error' || undefined
 */
export function checkVolumeMountPath(form, index, value, type) {
  const values = form.getFieldsValue()
  const {
    configMapKeys = [],
    secretConfigMapKeys = [],
    storageList = [],
  } = values
  let error

  // 1.检查配置文件路径
  const isConfigMap = type === 'configMap'
  configMapKeys.every(_key => {
    if (_key.deleted) {
      return true
    }
    const _keyValue = _key.value
    const configMapMountPath = values[`configMapMountPath${_keyValue}`]
    if ((!isConfigMap || _keyValue !== index) && value === configMapMountPath) {
      error = isConfigMap ? '已填写过该路径' : '该目录已被普通配置使用'
      return false
    }
    return true
  })

  // 2.检查加密配置文件路径
  const isSecretConfigMap = type === 'secretConfigMap'
  secretConfigMapKeys.every(_key => {
    if (_key.deleted) {
      return true
    }
    const _keyValue = _key.value
    const secretConfigMapMountPath = values[`secretConfigMapMountPath${_keyValue}`]
    if ((!isSecretConfigMap || _keyValue !== index) && value === secretConfigMapMountPath) {
      error = isSecretConfigMap ? '已填写过该路径' : '该目录已被加密配置使用'
      return false
    }
    return true
  })

  // 3.检查存储卷挂载目录
  const isVolume = type === 'volume'
  storageList.every(({ mountPath }, _index) => {
    if ((!isVolume || _index !== index) && value === mountPath) {
      error = type === 'volume' ? '已填写过该路径' : '该目录已被存储卷目录使用'
      return false
    }
    return true
  })

  return error
}

export function buildJson(fields, cluster, loginUser, imageConfigs, isTemplate, isTemplateDeploy, location) {
  const fieldsValues = getFieldsValues(fields)
  // 获取各字段值
  const {
    appName, // 应用名称
    serviceName, // 服务名称
    systemRegistry, // 镜像服务类型
    imageUrl, // 镜像地址
    appPkgID, // 应用包
    imageTag, // 镜像版本
    apm, //是否开通 APM
    bindNode, // 绑定节点
    imageTagOS, // 绑定节点 OS
    imageTagArch, // 绑定节点 Arch
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
    hostname,
    aliasesKeys, // hostname 别名 key
    subdomain, // 子域名
    accessType, // 是否为负载均衡
    agentType, // 集群内/外 方式
    accessMethod, //访问方式
    publicNetwork, //公网出口
    internaletwork, //内网出口
    portsKeys, // 端口的 keys(数组)
    loadBalance,
    lbKeys, // 访问方式为负载均衡时的端口(数组)
    tcpKeys,
    udpKeys,
    argsType,
    command, // 进入点
    argsKeys, // 启动命令的 keys(数组) 非默认
    defaultArgsKeys, // 启动命令的 keys(数组) 默认
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
    successThreshold, // 高可用健康阈值
    failureThreshold, // 高可用不健康阈值
    envKeys, // 环境变量的 keys(数组)
    configMapKeys, // 普通配置目录的 keys(数组)
    secretConfigMapKeys, // 加密配置目录的 keys(数组)
    serviceTag,         // 服务与节点 标签
    serviceBottomTag,  // 服务与服务 标签
    advanceSet, // 服务与服务 高级设置
    modelSet,  // 模型集
    serviceMesh, // 服务网格
    replicasCheck, // 实例数量/固定IP(calico)
    ipPool, // IP Pool (calico)
    ipAssignment, // IP Pool (macvlan)
    isStaticIP, // macvlan 固定ip
    flowCheck, // 流量控制
    flowSliderValue1,
    flowSliderValue2,
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
  // 设置应用包appPkgID
  if (isTemplate && appPkgID) {
    deployment.setAnnotations({
      appPkgID
    })
  }
  // 设置流量控制
  if (flowCheck === false) {
    deployment.setAnnotations({
      [flowContainerIN]: flowSliderValue1 + 'M',
      [flowContainerOut]: flowSliderValue2 + 'M',
    })
  }
  if (isTemplate && !isTemplateDeploy && location.query.other) {
    deployment.setAnnotations({
      [OTHER_IMAGE]: location.query.other,
    })
  }
  if (modelSet) {
    deployment.metadata.labels["tensorflow/model-serving-app"] = ''
    deployment.setAnnotations({'tensorflow/modelset-name': modelSet})
  }
  // 设置镜像地址
  deployment.addContainer(serviceName, `${imageUrl}:${imageTag}`)
  // 设置 APM
  if (apm) {
    deployment.setApmServiceLabel('pinpoint')
  }
  // 设置服务网格
  if (!serviceMesh) {
    deployment.setAnnotations({'sidecar.istio.io/inject': "false"});
    deployment.setMetaAnnotations({'sidecar.istio.io/inject': "false"});
  }
  if (imageTagOS) {
    deployment.setAnnotations({ imagetag_os: imageTagOS })
    deployment.setNodeSelector({ os: imageTagOS })
  }
  if (imageTagArch) {
    deployment.setAnnotations({ imagetag_arch: imageTagArch })
  }
  // 设置绑定节点
  if (bindNodeType == 'hostname') {
    if (bindNode !== SYSTEM_DEFAULT_SCHEDULE) {
      deployment.setNodeSelector({ hostname: bindNode })
    }
  } else if (bindNodeType == 'hostlabel') {
    // 设置主机标签绑定节点
    //deployment.setLabelSelector(bindLabel)

    //设置服务 标签
    deployment.setServicePointSelector(serviceTag)
    deployment.setServicePodSelector(serviceBottomTag, advanceSet, appName)
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
        hostPath, type_1,
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
            storageClassName: `${type}-storage`,
            mountPath,
            hostPath,
            readOnly,
            type_1,
          }
          // 模版更新和部署只在annotations中添加自动创建的的存储
          if (item.volume === 'create') {
            storageForTemplate.push(volumeObj)
          }
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
              readOnly,
              type_1
            }
            if (type === 'private') {
              Object.assign(volumeObj, {
                fsType,
                storage: size ? `${size}Mi` : '512Mi',
              })
            }
            if (volumeInfo === 'create') {
              storageForTemplate.push(volumeObj)
            }
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
  // 设置 IP Pool (calico)
  if (ipPool) {
    let key = 'cni.projectcalico.org/ipv4pools'
    if (isCidr.v6(ipPool)) key = 'cni.projectcalico.org/ipv6pools'
    deployment.setAnnotations({
      [key]: `[\"${ipPool}\"]`,
    })
  }

  // 设置 IP Pool (macvlan)
  if (ipAssignment) {
    deployment.setAnnotations({
      ['system/ip-assignment-name']: ipAssignment,
    })
  }

  // 设置固定 IP (calico)
  if (replicasCheck) {
    const { ipKeys } = fieldsValues
    const replicasIPArr = []
    ipKeys.forEach(item => {
      replicasIPArr.push(fieldsValues[`replicasIP${item}`])
    })
    const replicasIPStr = JSON.stringify(replicasIPArr)
    deployment.setAnnotations({
      ['cni.projectcalico.org/ipAddrs']: replicasIPStr,
    })

  }

  // macvlan 固定ip
  if (isStaticIP) {
    const { ipKeys } = fieldsValues
    let ipStr = ''
    ipKeys.forEach(item => {
      ipStr = ipStr + fieldsValues[`replicasIP${item}`] + ','
    })
    ipStr = ipStr.substring(0, ipStr.length - 1)
    deployment.setAnnotations({
      ['system/reserved-ips']: ipStr,
    })
  }

  // 设置 hostname 和 subdomain
  deployment.setHostnameAndSubdomain(hostname, subdomain)
  // 设置 hostname aliases
  if (!isEmpty(aliasesKeys)) {
    const hostAliases = []
    aliasesKeys.forEach(key => {
      const ip = fieldsValues[`ipHost-${key}`]
      const hostnames = [fieldsValues[`hostAliases-${key}`]]
      hostAliases.push({
        ip,
        hostnames,
      })
    })
    deployment.setHostAliases(hostAliases)
  }
  // 设置端口
  const service = new Service(serviceName, cluster)
  const { proxyType } = loginUser
  // 设置访问方式
  let groupID = "none"
  // 模板访问方式
  let templateGroup = "none"
  switch(accessMethod){
      case 'PublicNetwork': groupID = publicNetwork; templateGroup = 'PublicNetwork'; break;
      case 'InternalNetwork': groupID = internaletwork; templateGroup = 'InternalNetwork'; break;
      case 'Cluster':
    default:
      groupID = 'none'; templateGroup = 'Cluster'; break
  }
  if (isTemplate) {
    // 设置访问方式类型
    deployment.setAnnotations({
      accessType,
    })
  }
  if (!serviceMesh) {
  if (accessType === 'loadBalance') {
    // 访问方式为负载均衡

    // 设置负载均衡方式
    deployment.setAnnotations({
      agentType,
      loadBalance,
    })
    !isEmpty(lbKeys) && lbKeys.forEach(key => {
      const port = parseInt(fieldsValues[`${PORT}-${key}`])
      const name = `${serviceName}-${key}`
      deployment.addContainerPort(serviceName, port)
      service.addPort(proxyType, name, 'HTTP', port, port)
    })
    const tcpIngressArray = []
    !isEmpty(tcpKeys) && tcpKeys.forEach(key => {
      const port = parseInt(fieldsValues[`tcp-servicePort-${key}`])
      const exportPort = parseInt(fieldsValues[`tcp-exportPort-${key}`])
      const name = `${serviceName}-${key}`
      deployment.addContainerPort(serviceName, port)
      service.addPort(proxyType, name, 'TCP', port, port)
      // tcp 和 upd 监听器放入 annotations 用于回显
      if (isTemplate) {
        tcpIngressArray.push({
          servicePort: port,
          exportPort,
        })
      }
    })
    if (!isEmpty(tcpIngressArray)) {
      deployment.setAnnotations({
        tcpIngress: JSON.stringify(tcpIngressArray),
      })
    }
    const udpIngressArray = []
    !isEmpty(udpKeys) && udpKeys.forEach(key => {
      const port = parseInt(fieldsValues[`udp-servicePort-${key}`])
      const exportPort = parseInt(fieldsValues[`udp-exportPort-${key}`])
      const name = `${serviceName}-${key}`
      deployment.addContainerPort(serviceName, port, 'UDP')
      service.addPort(proxyType, name, 'UDP', port, port)
      if (isTemplate) {
        udpIngressArray.push({
          servicePort: port,
          exportPort,
        })
      }
    })
    if (!isEmpty(udpIngressArray)) {
      deployment.setAnnotations({
        udpIngress: JSON.stringify(udpIngressArray),
      })
    }
    // 默认访问方式 集群内
    service.addLBGroupAnnotation('none')
  } else {
    if (isTemplate && !isTemplateDeploy) {
      service.addLBGroupAnnotation(templateGroup)
    } else {
      service.addLBGroupAnnotation(groupID)
    }
    portsKeys && portsKeys.forEach(key => {
      if (key.deleted) {
        return
      }
      const keyValue = key.value
      const port = fieldsValues[`${PORT}${keyValue}`]
      const portProtocol = fieldsValues[`${PORT_PROTOCOL}${keyValue}`]
      const name = `${serviceName}-${keyValue}`
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
} else {
  portsKeys && portsKeys.forEach(key => {
    if (key.deleted) {
      return
    }
    const keyValue = key.value
    const port = fieldsValues[`${PORT}${keyValue}`]
    const portProtocol = fieldsValues[`${PORT_PROTOCOL}${keyValue}`]
    const name = `${serviceName}-${keyValue}`
    service.addPort(proxyType, name, portProtocol, port, port)
    deployment.addContainerPort(serviceName, port, portProtocol)
  })
}
  // 设置进入点
  let {
    entrypoint,
  } = imageConfigs || { entrypoint: '' }
  entrypoint = entrypoint && entrypoint.join(' ')
  // if (command && command !== entrypoint) {
  if (command) {
    deployment.addContainerCommand(serviceName, command)
  }
  // 设置启动命令
  // if ((argsType && argsType !== 'default') && argsKeys) {
  // 模板需要将默认启动命令添加进去
  if (argsType === 'DIY' && argsKeys) {
    const args = []
    argsKeys.forEach(key => {
      if (!key.deleted) {
        args.push(fieldsValues[`args${key.value}`])
      }
    })
    deployment.addContainerArgs(serviceName, args)
  }
  // else if (argsType === 'default' && defaultArgsKeys) {
  //   const args = []
  //   defaultArgsKeys.forEach(key => {
  //     args.push(fieldsValues[`args${key.value}_default`])
  //   })
  //   deployment.addContainerArgs(serviceName, args)
  // }

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
      successThreshold: parseInt(successThreshold),
      failureThreshold: parseInt(failureThreshold),
    })
    // Keep liveness and readiness probe the same
    deployment.setReadinessProbe(serviceName, livenessProtocol, {
      port: parseInt(livenessPort),
      path: livenessPath,
      initialDelaySeconds: parseInt(livenessInitialDelaySeconds),
      timeoutSeconds: parseInt(livenessTimeoutSeconds),
      periodSeconds: parseInt(livenessPeriodSeconds),
      successThreshold: parseInt(successThreshold),
      failureThreshold: parseInt(failureThreshold),
    })
  }
  // 设置环境变量
  let {
    defaultEnv,
  } = imageConfigs || { defaultEnv: '' }
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
        const envValue = fieldsValues[`envValue${keyValue}`] || '' // 环境变量值可以为空
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
  const wholeDir = {}
  if (configMapKeys) {
    configMapKeys.forEach(key => {
      if (!key.deleted) {
        const keyValue = key.value
        const configMapMountPath = fieldsValues[`configMapMountPath${keyValue}`]
        const configMapIsWholeDir = fieldsValues[`configMapIsWholeDir${keyValue}`]
        const configGroupName = fieldsValues[`configGroupName${keyValue}`]
        const configMapSubPathValues = fieldsValues[`configMapSubPathValues${keyValue}`]
        let volumeName = `${NO_CLASSIFY}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${keyValue}`
        if (Array.isArray(configGroupName)) {
          if (configGroupName[0] !== '未分类配置组') {
            if (isTemplate && !isTemplateDeploy) {
              volumeName = `${configGroupName[0]}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${keyValue}`
            } else {
              // 创建应用时，不能有中文
              volumeName = `${NO_CLASSIFY}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${keyValue}`
            }
          }
        } else {
          volumeName = `${NO_CLASSIFY}${CONFIGMAP_CLASSIFY_CONNECTION}configmap-volume-${keyValue}`
        }
        const volume = {
          name: volumeName,
          configMap: {
            name: Array.isArray(configGroupName) ? configGroupName[1] : configGroupName,
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
          Object.assign(wholeDir, {
            [volumeName]: true
          })
          volumeMounts.push({
            mountPath: configMapMountPath,
          })
        } else {
          Object.assign(wholeDir, {
            [volumeName]: false
          })
          configMapSubPathValues.map(value => {
            volumeMounts.push({
              name: volumeName,
              mountPath: configMapMountPath +
              (configMapMountPath.endsWith('/') ? '' : '/') + value,
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
        Object.assign(wholeDir, {
          [volume.name]: secretConfigMapIsWholeDir
        })
        volume.secret.items = (secretConfigMapSubPathValues || []).map(value => {
          return {
            key: value,
            path: value,
          }
        })
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
  if (!isEmpty(wholeDir) && isTemplate && !isTemplateDeploy) {
    deployment.setAnnotations({
      wholeDir: JSON.stringify(wholeDir)
    })
  }

  return { deployment, service, storage }
}

function formatConfigMapErrors(templateDeployCheckDetail, currentFields, isSecret) {
  const { configMapKeys, secretConfigMapKeys, serviceName } = currentFields
  const keys = isSecret ? secretConfigMapKeys : configMapKeys
  const { data } = templateDeployCheckDetail
  if (isEmpty(templateDeployCheckDetail) || isEmpty(data)) {
    return
  }
  const configMapErrors = {}
  const currentErrors = data.filter(err => err.name === serviceName.value)[0]
  const configMapErrorFields = []
  currentErrors.content.forEach(item => {

    keys.value.forEach(key => {
      const nameString = isSecret ? 'secretConfigGroupName' : 'configGroupName'
      const field = `${nameString}${key.value}`
      const configGroupName =
        isSecret
          ?
          currentFields[`${nameString}${key.value}`].value
          :
          currentFields[`${nameString}${key.value}`].value[1]
      if (item.resourceName === configGroupName) {
        Object.assign(configMapErrors, {
          [field]: {
            name: field,
            value: '',
            errors: [{
              message: isSecret ? `加密配置 ${configGroupName} 不存在` : `配置组 ${configGroupName} 名称重复`,
              field
            }]
          }
        })
        if (!isSecret) {
          configMapErrorFields.push(field)
        }
        return
      }
    })
  })
  Object.assign(configMapErrors, {
    configMapErrorFields: {
      name: 'configMapErrorFields',
      value: configMapErrorFields,
    }
  })
  return configMapErrors
}

function formatSecretEnvErrors(templateDeployCheckDetail, currentFields) {
  const { envKeys, serviceName } = currentFields
  const { data } = templateDeployCheckDetail
  if (isEmpty(templateDeployCheckDetail) || isEmpty(data)) {
    return
  }
  const secretEnvErrors = {}
  const currentErrors = data.filter(err => err.name === serviceName.value)[0]

  currentErrors.content.forEach(item => {

    envKeys.value.forEach(key => {
      const field = `envValue${key.value}`
      const fieldValue = currentFields[field].value[0]
      if (item.resourceName === fieldValue) {
        Object.assign(secretEnvErrors, {
          [field]: {
            name: field,
            value: '',
            errors: [{
              message: `加密变量 ${fieldValue} 不存在`,
              field
            }]
          }
        })
        return
      }
    })
  })

  return secretEnvErrors
}

function formatIngressErrors(templateDeployCheckDetail, currentFields) {
  const { lbKeys, serviceName } = currentFields
  const { data } = templateDeployCheckDetail
  if (isEmpty(templateDeployCheckDetail) || isEmpty(data)) {
    return
  }
  const ingressErrors = {}
  const currentErrors = data.filter(err => err.name === serviceName.value)[0]

  currentErrors.content.forEach(item => {
    lbKeys.value.forEach(key => {
      const ingressNameField = `displayName-${key}`
      const ingressName = currentFields[ingressNameField].value
      const hostField = `host-${key}`
      const host = currentFields[hostField].value
      if (item.resourceName === ingressName) {
        Object.assign(ingressErrors, {
          [ingressNameField]: {
            name: ingressNameField,
            value: ingressName,
            errors: [{
              message: `监听器 ${ingressName} 名称重复，请选择其他应用负载均衡`,
              field: ingressNameField
            }]
          }
        })
      }
      if (item.subResourceName === host) {
        Object.assign(ingressErrors, {
          [hostField]: {
            name: hostField,
            value: host,
            errors: [{
              message: `转发规则 ${host} 重复，请选择其他应用负载均衡`,
              field: hostField
            }]
          }
        })
      }
      return
    })
  })
  return ingressErrors
}

export function formatTemplateDeployErrors(value, currentError, errorFields, templateDeployCheck) {
  const storageErrors = []
  currentError.forEach(item => {
    switch(item.type) {
      case 0:
        storageErrors.push({
          message: `nfs集群 ${item.resourceName} 不存在`,
          filed: 'storageList'
        })
        Object.assign(errorFields, {
          storageList: {
            name: 'storageList',
            value: value.storageList.value,
            errors: storageErrors
          }
        })
        break
      case 1:
        storageErrors.push({
          message: `ceph集群 ${item.resourceName} 不存在`,
          filed: 'storageList'
        })
        Object.assign(errorFields, {
          storageList: {
            name: 'storageList',
            value: value.storageList.value,
            errors: storageErrors
          }
        })
        break
      case 2:
        Object.assign(errorFields, {
          loadBalance: {
            name: 'loadBalance',
            value: '',
            errors: [{
              message: `应用负载均衡器 ${item.resourceName} 不存在`,
              filed: 'loadBalance'
            }]
          }
        })
        break
      case 3:
        Object.assign(errorFields, {
          accessMethod: {
            name: 'accessMethod',
            value: value.accessMethod.value,
            errors: [{
              message: '集群未添加公网出口',
              filed: 'accessMethod'
            }]
          }
        })
        break
      case 4:
        Object.assign(errorFields, {
          accessMethod: {
            name: 'accessMethod',
            value: value.accessMethod.value,
            errors: [{
              message: '集群未添加内网出口',
              filed: 'accessMethod'
            }]
          }
        })
        break
      case 5:
        const configMapErrors = formatConfigMapErrors(templateDeployCheck, value, false)
        Object.assign(errorFields, configMapErrors)
        break
      case 6:
        const secretErrors = formatConfigMapErrors(templateDeployCheck, value, true)
        Object.assign(errorFields, secretErrors)
        break
      case 7:
        storageErrors.push({
          message: `集群禁用本地（host）存储`,
          filed: 'storageList'
        })
        Object.assign(errorFields, {
          storageList: {
            name: 'storageList',
            value: value.storageList.value,
            errors: storageErrors
          }
        })
        break
      case 9:
        const secretEnvErrors = formatSecretEnvErrors(templateDeployCheck, value)
        Object.assign(errorFields, secretEnvErrors)
        break
      case 10:
      case 11:
        const ingressErrors = formatIngressErrors(templateDeployCheck, value)
        Object.assign(errorFields, ingressErrors)
        break
      default:
        break
    }
  })
}

export const isFieldsHasErrors = fields => {
  const fieldsArray = Object.values(fields)
  return fieldsArray.some(field => {
    const currentFieldValues = Object.values(field)
    return currentFieldValues.some(value => !isEmpty(value.errors))
  })
}
