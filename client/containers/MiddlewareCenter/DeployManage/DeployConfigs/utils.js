/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Utilities functions for create bpm app
 *
 * @author zhangxuan
 * @date 2018-09-11
 */

import BpmTemplate from '../../../../../kubernetes/objects/bpmTemplate'
import { getResourceByMemory } from '../../../../../src/common/tools'
import { getFieldsValues } from '../../../../../src/components/AppModule/QuickCreateApp/utils'
import { ANNOTATION_LBGROUP_NAME } from '../../../../../constants/index'

const IMAGE_STORE = 'system_containers'
const BPM_IMAGE_NAME = 'aws-bpm'
const MYSQL_IMAGE_NAME = 'mariadb'
const MYSQL_USER = 'mysqluser'
const MYSQL_PWD = 'mysqlpwd'

export const buildJson = (fields, namespace, imageHost, appDetail) => {
  const fieldsValues = getFieldsValues(fields)
  const {
    clusterName, // 集群名称
    description, // 描述
    version, // 版本
    resourceType, // 容器配置
    DIYMinMemory, // 自定义配置-最小内存
    DIYMinCPU, // 自定义配置-最小CPU
    DIYMaxMemory, // 自定义配置-最大内存
    DIYMaxCPU, // 自定义配置-最大CPU
    replicas, // 实例数量
    // storageType, // 共享存储类型
    storageCluster, // 共享存储集群
    accessMethod, // 访问方式
    publicNetwork, // 公网出口
    internalNetwork, // 内网出口
    blockStorageCluster, // 块存储集群
    blockStorageSize, // 块存储大小
    databaseUsername, // mysql 用户名
    databasePassword, // mysql 密码
  } = fieldsValues
  const bpmTemplate = new BpmTemplate(clusterName, namespace)

  const { name } = appDetail

  const [ bpmVersion, mysqlVersion ] = version.split('/')
  const lbgroup = accessMethod === 'InternalNetwork' ? internalNetwork : publicNetwork

  bpmTemplate.setAnnotations({
    appname: name, // 应用名称
    comment: description, // 设定描述
    version: bpmVersion, // 设定版本
    [ANNOTATION_LBGROUP_NAME]: lbgroup, // 设定网络出口
    [MYSQL_USER]: databaseUsername, // mysql 用户名
    [MYSQL_PWD]: databasePassword, // mysql 密码
  })

  // 设置资源
  const {
    cpu, memory, limitCpu, limitMemory,
  } = getResourceByMemory(resourceType, DIYMinMemory, DIYMinCPU, DIYMaxMemory, DIYMaxCPU)
  bpmTemplate.setResources(memory, cpu, limitMemory, limitCpu)

  // 设置实例数
  bpmTemplate.setReplicas(replicas)

  // 设置 BPM 镜像地址
  const bpmImage = `${imageHost}/${IMAGE_STORE}/${BPM_IMAGE_NAME}:${bpmVersion}`
  bpmTemplate.setBpmImage(bpmImage)

  // 设置 MYSQL 镜像地址
  const mysqlImage = `${imageHost}/${IMAGE_STORE}/${MYSQL_IMAGE_NAME}:${mysqlVersion}`
  bpmTemplate.setMysqlImage(mysqlImage)

  // 设置 BPM 存储
  bpmTemplate.setBpmStorage(storageCluster)

  // 设置 Mysql 存储
  const blockSize = `${blockStorageSize}Gi`
  bpmTemplate.setMysqlStorage(blockStorageCluster, blockSize)

  return bpmTemplate
}
