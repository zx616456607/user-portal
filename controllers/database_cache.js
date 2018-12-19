/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Database cache controller
 *
 * v0.1 - 2016-10-27
 * @author GaoJian / Lei
 */
'use strict'
let yaml = require('js-yaml')
let utils = require('../utils')
const Service = require('../kubernetes/objects/service')
const apiFactory = require('../services/api_factory')
const registryConfigLoader = require('../registry/registryConfigLoader')
const PetsetLabel = 'system/petsetType'
const constants = require('../constants')
const lbGroupAnnotationKey = constants.ANNOTATION_LBGROUP_NAME
const svcScheamPortnameKey = constants.ANNOTATION_SVC_SCHEMA_PORTNAME
/*
basicInfo {
  templateId: "xxxx",
  serviceName: "xxxx",
  replicas: 3,
  volumeSize: 500,
  password: "xxxx"
}
*/
// Use the selected template to create petsets in k8s cluster
exports.createNewDBService = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  // Get required info
  const basicInfo = this.request.body
  const templateApi = apiFactory.getTemplateApi(loginUser)
  if (!basicInfo.templateId) {
    const err = new Error('No database template provided.')
    err.status = 400
    throw err
  }
  if (!basicInfo.serviceName || !basicInfo.volumeSize || !basicInfo.replicas) {
    const err = new Error('serviceName, volumeSize, replicas are required')
    err.status = 400
    throw err
  }
  const appTemplate = yield templateApi.getBy([basicInfo.templateId])
  if (appTemplate.data.category == 'mysql'
    || appTemplate.data.category == 'redis'
    || appTemplate.data.category == 'zookeeper') {
    // Check password for some template
    if (!basicInfo.password) {
      const err = new Error('password is required')
      err.status = 400
      throw err
    }
  }
  let yamlContent = appTemplate.data.content
  // For base petset and service
  yamlContent = yamlContent.replace(/\{\{name\}\}/g, basicInfo.serviceName)
    .replace(/\{\{size\}\}/g, basicInfo.volumeSize)
    .replace(/\{\{password\}\}/g, basicInfo.password) // Must have double quote in the template
    .replace(/\{\{replicas\}\}/g, basicInfo.replicas)
  yamlContent = yamlContent.replace(/\{\{registry\}\}/g, getRegistryURL())
  // For external service access
  let externalName = basicInfo.serviceName + '-' + utils.genRandomString(5)
  yamlContent = yamlContent.replace(/\{\{external-name\}\}/g, externalName)
  // Port will be generated randomly
  //yamlContent = yamlContent.replace("{{external-port}}", "")
  if (!basicInfo.externalIP) {
    basicInfo.externalIP = ''
  }
  yamlContent = yamlContent.replace(/\{\{external-ip\}\}/g, basicInfo.externalIP)
  yamlContent = yamlContent.replace(/\{\{tenx-rbd\}\}/g, basicInfo.storageClassName)

  if (basicInfo.lbGroupID) {
    yamlContent = addServiceAnnotationOfLBGroup(yamlContent, basicInfo.lbGroupID)
  }

  const result = yield api.createBy([cluster, 'dbservices'], { category: appTemplate.data.category }, yamlContent);
  this.body = {
    result
  }
}

function addServiceAnnotationOfLBGroup(rawYAMLString, groupID) {
  const separator = '---'
  const rawResourceParts = rawYAMLString.split(separator)
  const rawParts = rawResourceParts.reduce((parts, part) => {
    if (part.indexOf(svcScheamPortnameKey) !== -1) {
      parts.care.push(part)
    } else {
      parts.notCare.push(part)
    }
    return parts
  }, {
      care: [],
      notCare: [],
    })
  const needGroupID = rawParts.care.map(resource => yaml.load(resource))
  needGroupID.forEach(resource => {
    resource.metadata.annotations[lbGroupAnnotationKey] = groupID
  })
  return needGroupID.map(resource => yaml.dump(resource))
    .concat(rawParts.notCare).join(separator)
}

/*
Remove petset and related resources from k8s cluster
*/
// 删除es集群和zookeeper集群
exports.deleteDBServiceZkEs = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const serviceName = this.params.name
  const query = this.query || {}
  const api = apiFactory.getK8sApi(loginUser)

  const result = yield api.deleteBy([cluster, 'dbservices', serviceName], query);

  this.body = {
    result
  }
}

exports.deleteDBService = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const serviceName = this.params.name
  const type = this.params.type
  const query = this.query || {}
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([cluster, 'daas', type, serviceName], query);
  this.body = {
    result
  }
}

//zookeeper 和 es集群请求集群列表
exports.dbClusterList = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const query = this.query || {}
  const category = query.type

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'dbservices'], { "category": category });
  const databases = result.data.items || []
  // remote some data
  databases.forEach(function (db) {
    if (db.objectMeta) {
      delete db.objectMeta.labels
    }
    delete db.typeMeta
  })
  this.body = {
    cluster,
    databaseList: databases,
  }
}
/*
type = mysql/redis/....
*/
exports.listDBService = function* () {
  const cluster = this.params.cluster
  const type = this.params.type
  const loginUser = this.session.loginUser

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'daas', type]);
  const databases = result.data.items || []
  // remote some data
  databases.forEach(function (db) {
    if (db.objectMeta) {
      delete db.objectMeta.labels
    }
    delete db.typeMeta
  })

  this.body = {
    cluster,
    databaseList: databases,
  }
}

// 获取高级配置
exports.getAdvanceConfig = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.cluster
  const clusterName = this.params.name
  const type = this.params.type
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([ clusterId, 'daas', type, clusterName, 'config'])
  this.body = result
}
// 创建集群配置
exports.createClusterConfig = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.cluster
  const clusterName = this.params.name
  const type = this.params.type
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([ clusterId, 'daas', type, clusterName, 'config'], null, body)
  this.body = result
}

// 更新MySQL集群配置
exports.updateClusterConfig = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.cluster
  const clusterName = this.params.name
  const type = this.params.type
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([ clusterId, 'daas', type, clusterName, 'config'], null, body)
  this.body = result
}
// 获取默认配置
exports.getDefaultConfig = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.cluster
  const type = this.params.type
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([ clusterId, 'daas', type, 'config', 'default'])
  this.body = result
}
// 创建密码
exports.createClusterPwd = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const clusterName = this.params.name
  const type = this.params.type
  const api = apiFactory.getK8sApi(loginUser)
  const body = this.request.body
  const result = yield api.createBy([ clusterId, 'daas', type, clusterName, 'secret'], null, body)
  this.body = result
}
// 修改密码
exports.updateClusterPwd = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const clusterName = this.params.name
  const type = this.params.type
  const api = apiFactory.getK8sApi(loginUser)
  const body = this.request.body
  const result = yield api.updateBy([ clusterId, 'daas', type, clusterName, 'secret'], null, body)
  this.body = result
}
// 查看密码
exports.getClusterPwd = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const clusterName = this.params.name
  const type = this.params.type
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([ clusterId, 'daas', type, clusterName, 'secret'])
  this.body = resultconsole
}
// 检查集群名是否存在
exports.checkClusterName = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.cluster
  const name = this.params.name
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([ clusterId, 'daas', name, 'exist' ])
  this.body = result
}
// 创建集群
exports.createDatabaseCluster = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const type = this.params.type
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([ clusterId, 'daas', type ], null, body)
  this.body = result
}

// 编辑集群
exports.updateDatabaseCluster = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const type = this.params.type
  const body = this.request.body
  const name = this.params.name
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([ clusterId, 'daas', type, name ], null, body)
  this.body = result
}
// 获取备份链
exports.getBackupChain = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const type = this.params.type
  const name = this.params.name
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([ clusterId, 'daas', type, name, 'backups' ])
  this.body = result
}
// 手动备份
exports.manualBackup = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const type = this.params.type
  const name = this.params.name
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([ clusterId, 'daas', type, name, 'backups' ], null, body)
  this.body = result
}
// 删除手动备份
exports.deleteManualBackup = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const type = this.params.type
  const name = this.params.name
  const clusterName = this.params.clusterName
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([ clusterId, 'daas', type, clusterName, 'backups', name ])
  this.body = result
}
// 检查radosgw地址配置情况
  exports.checkRadosgwStatus = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const storagecluster = this.params.storagecluster
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([ clusterId, 'storageclass', storagecluster, 'radosgw' ])
  this.body = result
}
// 检查是否有自动备份
exports.checkAutoBackupExist = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const type = this.params.type
  const name = this.params.name
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([ clusterId, 'daas', type, name, 'cronbackups' ])
  this.body = result
}
// 自动备份
exports.setAutoBackup = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const type = this.params.type
  const name = this.params.name
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([ clusterId, 'daas', type, name, 'cronbackups' ], null, body)
  this.body = result
}
// 修改自动备份
exports.updateAutoBackup = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const type = this.params.type
  const name = this.params.name
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([ clusterId, 'daas', type, name, 'cronbackups' ], null, body)
  this.body = result
}

// mamysql删除自动备份
exports.deleteAutoBackup = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const type = this.params.type
  const clusterName = this.params.clusterName
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([ clusterId, 'daas', type, clusterName, 'cronbackups' ])
  this.body = result
}

// 扩容
exports.expandDatabaseCluster = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const type = this.params.type
  const name = this.params.name
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const apiUrl = [ clusterId, 'daas', type, name, 'expands' ]
  const result = yield api.createBy(apiUrl, null, body)
  this.body = result
}

// 回滚
exports.rollback = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const type = this.params.type
  const name = this.params.name
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([ clusterId, 'daas', type, name, 'restores' ], null, body)
  this.body = result
}

// 修改集群访问方式
exports.updateAccessMethod = function* () {
  const loginUser = this.session.loginUser
  const clusterId = this.params.clusterID
  const type = this.params.type
  const name = this.params.name
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([ clusterId, 'daas', type, name, 'service' ], null, body)
  this.body = result
}

//重启集群
exports.rebootCluster = function* () {
  const loginUser = this.session.loginUser
  const name = this.params.name
  const clusterID = this.params.clusterID
  const type = this.params.type
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([clusterID, 'daas', type, name, 'reboot'])
  this.body = result
}

//获取回滚记录
exports.getRollbackRecord = function* () {
  const loginUser = this.session.loginUser
  const name = this.params.name
  const clusterID = this.params.clusterID
  const type = this.params.type
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([ clusterID, 'daas', type, name, 'restores' ])
  this.body = result
}
//获取访问方式（rabbitmq）
exports.getVisitType = function* () {
  const loginUser = this.session.loginUser
  const name = this.params.name
  const clusterID = this.params.clusterID
  const type = this.params.type
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([ clusterID, 'daas', type, name, 'service' ])
  this.body = result
}
//修改访问方式（rabbitmq）
exports.updateVisitType = function* () {
  const loginUser = this.session.loginUser
  const name = this.params.name
  const clusterID = this.params.clusterID
  const type = this.params.type
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([ clusterID, 'daas', type, name, 'service' ], null, body)
  this.body = result
}
exports.scaleDBService = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const serviceName = this.params.name
  // {"replicas": 3}
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.patchBy([cluster, 'dbservices', serviceName], null, body);
  this.body = {
    result
  }
}

exports.getDBService = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const serviceName = this.params.name
  const type = this.params.type
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'daas', type, serviceName], null);
  const database = result.data || []
/*  Get redis password from init container
  let initEnv = []
  let isRedis = false
  if (database.petsetSpec.template) {
    let podTemplate = database.petsetSpec.template
    if (podTemplate.metadata.labels && podTemplate.metadata.labels[PetsetLabel] == 'redis') {
      isRedis = true
      // For redis, get password from init container
      if (podTemplate.spec.initContainers) {
        let initContainers = podTemplate.spec.initContainers
        initContainers.forEach(function (c) {
          if (c.name === 'install' && c.env) {
            c.env.forEach(function (e) {
              if (e.name === 'REDIS_PASSWORD') {
                initEnv.push({
                  name: e.name,
                  value: e.value
                })
              }
            })
          }
        })
      }
    }
  }
  // Remove some data
  if (database.objectMeta) {
    delete database.objectMeta.labels
  }
  delete database.typeMeta
  delete database.eventList
  if (database.podList && database.podList.pods) {
    database.podList.pods.forEach(function (pod) {
      if (!pod.podSpec.containers[0].env) {
        pod.podSpec.containers[0].env = []
      }
      // For redis, use password from init container
      if (isRedis) {
        pod.podSpec.containers[0].env = initEnv
      }
      if (pod.objectMeta) {
        delete pod.objectMeta.labels
        delete pod.objectMeta.annotations
        delete pod.annotations
      }
    })
  }
  if (database.petsetSpec) {
    database.volumeInfo = {
      // Use the first pvc for now
      size: database.petsetSpec.volumeClaimTemplates[0].spec.resources.requests.storage
    }
    delete database.petsetSpec
  }
  if (database.serviceInfo) {
    delete database.serviceInfo.labels
    delete database.serviceInfo.selector
  }*/

  this.body = {
    cluster,
    database
  }
}

exports.getDBServiceDetail = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const serviceName = this.params.name
  const type = this.params.type

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'dbservices', serviceName], null);
  const database = result.data || []

  // Get redis password from init container
/*
  let initEnv = []
  let isRedis = false
  if (database.petsetSpec.template) {
    let podTemplate = database.petsetSpec.template
    if (podTemplate.metadata.labels && podTemplate.metadata.labels[PetsetLabel] == 'redis') {
      isRedis = true
      // For redis, get password from init container
      if (podTemplate.spec.initContainers) {
        let initContainers = podTemplate.spec.initContainers
        initContainers.forEach(function (c) {
          if (c.name === 'install' && c.env) {
            c.env.forEach(function (e) {
              if (e.name === 'REDIS_PASSWORD') {
                initEnv.push({
                  name: e.name,
                  value: e.value
                })
              }
            })
          }
        })
      }
    }
  }
  // Remove some data
  if (database.objectMeta) {
    delete database.objectMeta.labels
  }
  delete database.typeMeta
  delete database.eventList
  if (database.podList && database.podList.pods) {
    database.podList.pods.forEach(function (pod) {
      if (!pod.podSpec.containers[0].env) {
        pod.podSpec.containers[0].env = []
      }
      // For redis, use password from init container
      if (isRedis) {
        pod.podSpec.containers[0].env = initEnv
      }
      if (pod.objectMeta) {
        delete pod.objectMeta.labels
        delete pod.objectMeta.annotations
        delete pod.annotations
      }
    })
  }
  if (database.petsetSpec) {
    database.volumeInfo = {
      // Use the first pvc for now
      size: database.petsetSpec.volumeClaimTemplates[0].spec.resources.requests.storage
    }
    delete database.petsetSpec
  }
  if (database.serviceInfo) {
    delete database.serviceInfo.labels
    delete database.serviceInfo.selector
  }
*/

  this.body = {
    cluster,
    database
  }
}

function getRegistryURL() {
  // Global check
  if (registryConfigLoader.GetRegistryConfig() && registryConfigLoader.GetRegistryConfig().url) {
    let url = registryConfigLoader.GetRegistryConfig().url
    if (url.indexOf('://') > 0) {
      url = url.split('://')[1]
    }
    return url
  }
  // Default registry url
  return "localhost"
}
