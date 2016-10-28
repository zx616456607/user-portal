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
var yaml = require('js-yaml');
var fs = require('fs');

const apiFactory = require('../services/api_factory')

exports.getMySqlList = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'dbservices']);
  const databases = result.data.data.petSets || []
  for(var i =0 ; i <= database.length ; i++ ) {
    
  }
  this.body = {
    cluster,
    databaseList: databases,
    data: result
  }
}

exports.createMysqlCluster = function* () {
  const cluster = this.params.cluster
  const dbBody = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  
//const result = yield api.createBy([cluster, 'dbservices'], null,);
}
