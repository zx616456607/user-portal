/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User manage controller
 *
 * v0.1 - 2016-11-01
 * @author shouhong.zhang
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getTeamDetail = function* () {
  let teamID = this.params.team_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["teams", teamID, "detail"])
  const data = result || {}
  this.body = {
    data
  }
}

exports.getTeamOperations = function* () {
  let team = this.params.team_id
  const loginUser = this.session.loginUser
  let queryObj = { team }
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["operations"], queryObj)
  const data = {}
  if (result && result.app) {
    data = result.app
  }
  this.body = {
    data
  }
}