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
    if (!basicInfo.serviceName || !basicInfo.volumeSize || !basicInfo.replicas || !basicInfo.password) {
    const err = new Error('serviceName, volumeSize, replicas, password are required')
    err.status = 400
    throw err
  }
  const appTemplate = yield templateApi.getBy([basicInfo.templateId])
  let yamlContent = appTemplate.data.content
  // For base petset and service
  yamlContent = yamlContent.replace(/\{\{name\}\}/g, basicInfo.serviceName).replace("{{size}}", basicInfo.volumeSize).replace("{{password}}", basicInfo.password).replace("{{replicas}}", basicInfo.replicas)
  // For external service access
  let externalName = basicInfo.serviceName + '-' + utils.genRandomString(5)
  yamlContent = yamlContent.replace(/\{\{external-name\}\}/g, externalName)
  // Port will be generated randomly
  //yamlContent = yamlContent.replace("{{external-port}}", "")
  if (!basicInfo.externalIP) {
    basicInfo.externalIP = ''
  }
  yamlContent = yamlContent.replace("{{external-ip}}", basicInfo.externalIP)
  const result = yield api.createBy([cluster, 'dbservices'], {category: appTemplate.data.category}, yamlContent);

  this.body = {
    result
  }
}

/*
Remove petset and related resources from k8s cluster
*/
exports.deleteDBService = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const serviceName = this.params.name
  const api = apiFactory.getK8sApi(loginUser)

  const result = yield api.deleteBy([cluster, 'dbservices', serviceName]);

  this.body = {
    result
  }
}

/*
type = mysql/redis/....
*/
exports.listDBService = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const query = this.query || {}
  const category = query.type

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'dbservices'], {"category": category});
  const databases = result.data.petSets || []
  // remote some data
  databases.forEach(function(db) {
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

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'dbservices', serviceName], null);
  const database = result.data || []

  // Remove some data
  if (database.objectMeta) {
    delete database.objectMeta.labels
  }
  delete database.typeMeta
  delete database.eventList
  if (database.podList && database.podList.pods) {
    database.podList.pods.forEach(function(pod) {
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

  this.body = {
    cluster,
    database,
  }
}


