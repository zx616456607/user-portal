/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 */
/**
 * emai Approval controller
 *
 * v0.1 - 2018-10-10
 * @author lvjunfeng
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getEmailApprovalStatus = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getDevOpsApi(loginUser)
  const stageId = this.params.stageId
  const stageBuildId = this.params.stageBuildId
  const result = yield api.getBy([ 'email-approval', stageId, stageBuildId, 'status' ], this.query)
  this.body = result
}

exports.updateEmailApprovalStatus = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getDevOpsApi(loginUser)
  const stageId = this.params.stageId
  const stageBuildId = this.params.stageBuildId
  const type = this.params.type
  const body = this.request.body
  const result = yield api.createBy([ 'email-approval', stageId, stageBuildId, type ], this.query, body)
  this.body = result
}
