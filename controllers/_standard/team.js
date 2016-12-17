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
const EMAIL_REG_EXP = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/
const emailUtil = require('../../utils/email')
const constants = require('../../constants')
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE
const logger = require('../../utils/logger').getLogger('team')

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
      try {
        emailUtil.sendInviteTeamMemberEmail(email, loginUser.user, loginUser.email,result.data.teamName ,invitationURL)
      }
      catch (e) {
        logger.warn('send invitation email failed.', e)
      }
    }
  }
  else {
    logger.warn('createInvitations not send email. call api server return:', result)
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

  // send email
  if (result.code === 200 && result.data) {
    try {
      emailUtil.sendExitTeamEmail(result.data.adminEmails, result.data.quitUserEmail, result.data.quitUserName, result.data.teamName)
    }
    catch (e) {
      logger.warn('send quit team email failed.', e)
    }
  }
  else {
    logger.warn('quit team not send email. call api server return:', result)
  }

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
  const body = this.request.body

  let result = yield spi.teams.createBy(['join'], null, body)

  // send email

  this.body = {
    data: result
  }
}

exports.getTeamUsers = function* () {
  const teamID = this.params.teamid
  const loginUser = this.session.loginUser
  const query = this.query || {}
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let sort_by = parseInt(query.sort_by || "name")
  let sort_order = parseInt(query.sort_order || true)
  let filter = query.filter
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  let from = size * (page - 1)
  if (size == -1) {
    from == -1
  }
  let queryObj = { from, size }
  if (from == 0 && size == 0) {
    queryObj = {}
  }
  if (filter) {
    queryObj.filter = filter
  }
  if (query && query.sort) {
    queryObj.sort = query.sort
  }
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.teams.getBy([teamID, 'users'], queryObj)
  let invitedUsers = []
  if (result && result.data && result.data.invitedUsers) {
    invitedUsers = result.data.invitedUsers
  } 
  let users = []
  if (result && result.data && result.data.users) {
    users = result.data.users
  } 
  
  this.body = {
    invitedUsers,
    users,
  }
}

exports.removeTeamuser = function* () {
  const teamID = this.params.teamid
  const username = this.params.username
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)

  const result = yield spi.teams.deleteBy([teamID, 'users', username])

  // send email
  if (result.code === 200 && result.data) {
    try {
      emailUtil.sendRemoveTeamMemberEmail(result.data.operatorName, result.data.operatorEmail, result.data.removedUserName, result.data.removedUserEmail, result.data.teamName)
    }
    catch (e) {
      logger.warn('send remove member email failed.', e)
    }
  }
  else {
    logger.warn('removeMember not send email. call api server return:', result)
  }

  this.body = {
    data: result
  }
}

exports.cancelInvitation = function* () {
  const teamID = this.params.teamid
  const email = this.params.email
  const query = { email }
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)

  const result = yield spi.teams.deleteBy([teamID, 'invitations'], query)

  // send email
  if (result.code === 200 && result.data) {
    try {
      emailUtil.sendCancelInvitationEmail(result.data.canceledEmail, result.data.operatorName, result.data.operatorEmail, result.data.teamName)
    }
    catch (e) {
      logger.warn('send cancel invitation email failed.', e)
    }
  }
  else {
    logger.warn('cancelInvitation not send email. call api server return:', result)
  }

  this.body = {
    data: result
  }
}
