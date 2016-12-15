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
const EMAIL_REG_EXP = new RegExp('^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$')
const emailUtil = require('../../utils/email')

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

exports.createInvitations = function* () {
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const teamID = this.params.teamid
  let emails = this.request.body

  if (!Array.isArray(emails)) {
    const err = new Error('invalid input params')
    err.status = 400
    throw err
  }
  emails = emails.filter((email) => {
    return EMAIL_REG_EXP.test(email)
  })
  if (emails.length < 1) {
    const err = new Error('invalid input params')
    err.status = 400
    throw err
  }

  let result = yield spi.teams.createBy([teamID, 'invitations'], null, emails)
  // send email
  if (result.code === 200 && result.data && result.data.codes && result.data.teamName) {
    for (let email in result.data.codes) {
      const invitationURL = `https://console.tenxcloud.com/teams/invite?code=${encodeURIComponent(result.data.codes[email])}`
      emailUtil.sendInviteTeamMemberEmail(email, loginUser.user, loginUser.email,result.data.teamName ,invitationURL)
    }
  }
  else {
    console.log('createInvitations not send email')
  }

  this.body = {
    data: result
  }
}

exports.checkDissolvable = function* () {
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const teamID = this.params.teamid

  let result = yield spi.teams.getBy([teamID, 'dissolvable'])

  this.body = {
    data: result
  }
}

exports.deleteTeam = function* () {
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const teamID = this.params.teamid

  let result = yield spi.teams.deleteBy([teamID])

  this.body = {
    data: result
  }
}
exports.quitTeam = function* () {
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const teamID = this.params.teamid

  let result = yield spi.teams.createBy([teamID, 'quit'])

  this.body = {
    data: result
  }
}
exports.removeMember = function* () {
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const teamID = this.params.teamid
  const userName = this.params.username

  let result = yield spi.teams.deleteBy([teamID, 'users', userName])

  this.body = {
    data: result
  }
}
exports.cancelInvitation = function* () {
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const teamID = this.params.teamid
  const code = this.params.code

  let result = yield spi.teams.deleteBy([teamID, 'invitations', code])

  this.body = {
    data: result
  }
}
exports.getInvitationInfo = function* () {
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const code = this.params.code

  let result = yield spi.teams.getBy(['invitations', code])

  this.body = {
    data: result
  }
}
exports.joinTeam = function* () {
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const teamID = this.params.teamid

  let result = yield spi.teams.createBy([teamID, 'join'])

  // send email

  this.body = {
    data: result
  }
}
