/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Storage manage controller
 *
 * v0.1 - 2011-9-19
 * @author Zhangcz
 */
'use strict'
const apiFactory = require('../services/api_factory')

exports.postCreateCephStorage = function* (){
  const loginUser = this.session.loginUser
  const query = this.query
  const body = this.request.body
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([ cluster, 'storageclass'], query, body.template)
  this.body = result
}

exports.getClusterStorageList = function* (){
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([ cluster, 'storageclass' ])
  this.body = result
}

exports.postDeleteCephStorage = function* (){
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const name = this.params.name
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([ cluster, 'storageclass', name ], null)
  this.body = result
}

exports.putUpdateCephStorage = function* () {
  const loginUser = this.session.loginUser
  const query = this.query
  const body = this.request.body
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([ cluster, 'storageclass'], query, body.template)
  this.body = result
}

exports.getStorageClassType = function* (){
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([ cluster, 'storageclass', 'type' ])
  this.body = result
}