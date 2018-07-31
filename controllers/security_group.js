/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 */
/**
 * securityGroup
 *
 * v0.1 - 2018-7-27
 * @author lvjunfeng
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.createSecurityGroup = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const body = this.request.body
  const result = yield api.createBy([cluster, 'networkpolicy' ], null, body)
  this.body = result
}

exports.getSecurityGroupList = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const result = yield api.getBy([ cluster, 'networkpolicy' ])
  this.body = result
}

exports.getSecurityGroupDetail = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const name = this.params.name
  const result = yield api.getBy([ cluster, 'networkpolicy', name ])
  this.body = result
}

exports.updataSecurityGroup = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const body = this.request.body
  const result = yield api.updateBy([ cluster, 'networkpolicy' ], null, body)
  this.body = result
}

exports.deleteSecurityGroup = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const name = this.params.name
  const result = yield api.deleteBy([ cluster, 'networkpolicy', name ], null, )
  this.body = result
}



