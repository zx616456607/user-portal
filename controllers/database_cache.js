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
const PetSet = require('../kubernetes/objects/petSet')
const apiFactory = require('../services/api_factory')

exports.getMySqlList = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'dbservices']);
  const databases = result.data.petSets || []
  for(var i =0 ; i <= databases.length ; i++ ) {
    
  }
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
  service.createDataBase(dbBody.name)
  let petset = new PetSet(dbBody.name)
  petset.createMysqlDatabase(dbBody.servicesNum, dbBody.password)
  let tempList = []
  const dumpOpts = {
    noRefs: true,
    lineWidth: 1000
  }
  tempList.push(yaml.dump(service, dumpOpts), yaml.dump(petset, dumpOpts))
  tempList = tempList.join('---\n')
  console.log(tempList)
  const result = yield api.createBy([cluster, 'dbservices'], null, tempList)
  this.body = {
    result
  }
}

exports.getMysqlClusterDetail = function* () {
  const cluster = this.params.cluster
  const dbName = this.params.dbName
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'dbservices', dbName]);
  this.body = {
    cluster,
    databaseInfo: result.modules.k8s.petset.PetSetDetail
  }
}
