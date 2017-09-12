/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */
/**
 * APM controller
 *
 * v0.1 - 2017-09-12
 * @author Zhangpc
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getApms = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const api = apiFactory.getK8sApi(loginUser)

  const result = yield api.getBy([ clusterID, 'apms' ])
  this.body = result
}
