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

const apiFactory = require('../services/api_factory')

exports.getMySqlList = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy(['clusters', cluster, 'dbservices']);
  const databases = result.data || []
  this.body = {
    cluster,
    databaseList: databases,
    data: result
  }
}
