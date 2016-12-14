/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Certificate controller: for Public Cloud Only
 *
 * v0.1 - 2016-12-14
 * @author mengyuan
*/
'use strict'

const apiFactory = require('../../services/api_factory')

exports.createTeamAndSpace = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const team = this.request.body
  console.log(team)
  if (!team || !team.teamName) {
    const err = new Error('team name is required.')
    err.status = 400
    throw err
  }
  let result = yield api.teams.create(team)

  // create team success, create namespace
  if (result && result.statusCode == 200) {
    const teamspace = {
      spaceName: team.teamName,
    }
    result = yield api.teams.createBy([result.teamID, 'spaces'], null, teamspace)
  }

  this.body = {
    data: result
  }
}
