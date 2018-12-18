/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * service_mesh.js page
 *
 * @author zhouhaitao
 * @date 2018-12-18
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getPodsList = function *() {
  const clusterId = this.params.cluster
  const type = this.params.type
  const name = this.params.name
  const loginUser = this.session.loginUser;
  const api = apiFactory.getK8sApi(loginUser)
  const res = yield api.getBy([clusterId, 'native', type, name, 'instances' ], null);
  this.body = res
}

exports.getLog = function *() {
  const clusterId = this.params.cluster
  const instances = this.params.instances
  const body = this.request.body
  const loginUser = this.session.loginUser;
  const api = apiFactory.getK8sApi(loginUser)
  const res = yield api.createBy([clusterId, 'logs', 'instances', instances, 'logs' ], null, body);
  this.body = res
}

