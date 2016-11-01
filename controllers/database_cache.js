/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Database cache controller
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */
'use strict'
let yaml = require('js-yaml')
const Service = require('../kubernetes/objects/service')
const petSetMysql = require('../kubernetes/objects/petSetMysql')
const petSetRedis = require('../kubernetes/objects/petSetRedis')
const apiFactory = require('../services/api_factory')

exports.getAllDbNames = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'dbservices']);
  const databases = result.data.petSets || []
  let dbNames = new Array();
  if(databases.length > 0) {    
    databases.map((item) => {
      dbNames.push(item.serivceName);
    });
  } else {
    dbNames = [];
  }
  this.body = {
    cluster,
    databaseNames: dbNames,
  }
}

exports.getMySqlList = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'dbservices'], {'labels': 'appType=mysql'});
  const databases = result.data.petSets || []
  this.body = {
    cluster,
    databaseList: databases,
  }
}

exports.getRedisList = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'dbservices'], {'labels': 'appType=redis'});
  const databases = result.data.petSets || []
  this.body = {
    cluster,
    databaseList: databases,
  }
}

exports.createMysqlCluster = function* () {
  const cluster = this.params.cluster
  const dbBody = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  let service = new Service(dbBody.name)
  service.createMysqlDataBase(dbBody.name)
  let petset = new petSetMysql(dbBody.name)
  petset.createMysqlDatabase( dbBody.servicesNum, dbBody.password)
  let tempList = []
  const dumpOpts = {
    noRefs: true,
    lineWidth: 5000
  }
  tempList.push(yaml.dump(service, dumpOpts), yaml.dump(petset, dumpOpts))
  tempList = tempList.join('---\n')
  const result = yield api.createBy([cluster, 'dbservices'], null, tempList)
  this.body = {
    result
  }
}

exports.createRedisCluster = function* () {
  const cluster = this.params.cluster
  const dbBody = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  let service = new Service(dbBody.name)
  service.createRedisDatabase(dbBody.name)
  let petset = new petSetRedis(dbBody.name)
  petset.createRedisDatabase( dbBody.servicesNum)
  let tempList = []
  const dumpOpts = {
    noRefs: true,
    lineWidth: 5000
  }
  tempList.push(yaml.dump(service, dumpOpts), yaml.dump(petset, dumpOpts))
  tempList = tempList.join('---\n')
  console.log(tempList)
  const result = yield api.createBy([cluster, 'dbservices'], null, tempList)
  this.body = {
    result
  }
}

exports.getDatabaseClusterDetail = function* () {
  const cluster = this.params.cluster
  const dbName = this.params.dbName
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'dbservices', dbName]);
  this.body = {
    cluster,
    databaseInfo: result.data
  }
}

exports.deleteDatebaseCluster = function* () {
  const cluster = this.params.cluster
  const dbName = this.params.dbName
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([cluster, 'dbservices', dbName]);
  this.body = {
    result
  }
}

