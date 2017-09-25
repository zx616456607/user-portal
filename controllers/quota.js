/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * quota controller
 *
 * v0.1 - 2017-9-25
 * @author Zhaoyb
 */
'use strict'
const apiFactory = require('../services/api_factory')

exports.list = function* (){
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const query = this.query || {}
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([ cluster, 'resourcequota' ], query)
  this.body = result
}

exports.put = function* (){
  const loginUser = this.session.loginUser
	const body = this.request.body
	const cluster = this.params.cluster
	const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([ cluster, 'resourcequota' ],null, body)
  this.body = result
}
