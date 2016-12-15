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
const constants = require('../constants')
const email = require('../utils/email')
const logger = require('../utils/logger.js').getLogger("user_manage")
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE
const ROLE_TEAM_ADMIN = 1

exports.getUserDetail = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  userID = userID === 'default' ? loginUser.id : userID
  const api = apiFactory.getApi(loginUser)
  const result = yield api.users.getBy([userID])
  const users = result.users || []
  const user = users.length > 0 ? users[0] : {}
  if (this.params.user_id === 'default') {
    user.tenxApi = loginUser.tenxApi
    user.watchToken = loginUser.watchToken
    user.cicdApi = loginUser.cicdApi
    // Delete sensitive information
    delete user.userID
    delete user.statusCode
    delete user.apiToken
  }
  this.body = {
    data: user
  }
}

exports.getUserAppInfo = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  userID = userID === 'default' ? loginUser.id : userID
  const api = apiFactory.getApi(loginUser)
  const result = yield api.users.getBy([userID, "app_info"])
  this.body = {
    data: result
  }
}

exports.getUsers = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let sort_by = parseInt(query.sort_by || "name")
  let sort_order = parseInt(query.sort_order || true)
  let name = query.name
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
  if (query && query.filter) {
    queryObj.filter = query.filter
  }
  if (query && query.sort) {
    queryObj.sort = query.sort
  }
  const api = apiFactory.getApi(loginUser)
  const result = yield api.users.get(queryObj)
  const users = result.users || []
  let total = 0
  if (result.listMeta && result.listMeta.total) {
    total = result.listMeta.total
  }

  this.body = {
    users,
    total
  }
}

exports.getUserTeams = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  userID = userID === 'default' ? loginUser.id : userID
  const api = apiFactory.getApi(loginUser)
  let result = yield api.users.getBy([loginUser.id])
  //Only team admin can get team related information
  if (!result || !result.users || !result.users[0] ||
      result.users[0].role != ROLE_TEAM_ADMIN) {
    this.body = {
      teams: [],
      total: 0
    }
    return
  }

  const query = this.query || {}
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let sort_by = parseInt(query.sort_by || "name")
  let sort_order = parseInt(query.sort_order || true)
  let name = query.name
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size > 100) {
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
  if (name) {
    queryObj.filter = `name ${name}`
  }
  if (query && query.sort) {
    queryObj.sort = query.sort
  }
  if (query.filter) {
    queryObj.filter = query.filter + ",creatorID__eq," + userID
  } else {
    queryObj.filter = "creatorID__eq," + userID
  }
  result = yield api.teams.get(queryObj)
  const teams = result.teams || []
  let total = 0
  if (result.listMeta && result.listMeta.total) {
    total = result.listMeta.total
  }

  this.body = {
    teams,
    total
  }
}

exports.getUserTeamspaces = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  const query = this.query || {}

  this.body = yield getUserTeamspacesImpl(userID, loginUser, query, false)
}

exports.getUserTeamspacesWithDetail = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  const query = this.query || {}

  this.body = yield getUserTeamspacesImpl(userID, loginUser, query, true)
}

function* getUserTeamspacesImpl(userID, loginUser, query, fetchDetail) {
  userID = userID === 'default' ? loginUser.id : userID
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let sort_by = parseInt(query.sort_by || "name")
  let sort_order = parseInt(query.sort_order || true)
  let name = query.name
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size > 100) {
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
  if (name) {
    queryObj.filter = `name ${name}`
  }
  if (query && query.sort) {
    queryObj.sort = query.sort
  }
  const api = apiFactory.getApi(loginUser)
  const result = yield api.users.getBy([userID, 'spaces'], queryObj)
  const teamspaces = result.spaces || []
  let total = 0
  if (result.listMeta && result.listMeta.total) {
    total = result.listMeta.total
  }

  if (fetchDetail) {
    for (let index in teamspaces) {
      const r = yield api.teams.getBy([teamspaces[index].teamID, "spaces", teamspaces[index].spaceID, "app_info"])
      teamspaces[index].appCount = r.appCount
      teamspaces[index].serviceCount = r.serviceCount
      teamspaces[index].containerCount = r.containerCount
    }
  }

  return {
    teamspaces,
    total
  }
}

exports.createUser = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const user = this.request.body
  if (!user || !user.userName || !user.password || !user.email) {
    const err = new Error('user name, password and email are required.')
    err.status = 400
    throw err
  }
  const result = yield api.users.create(user)

  if (!user.sendEmail) {
    this.body = {
      data: result
    }
    return
  }
  const mailOptions = {
    to: user.email, // list of receivers
    subject: '用户创建成功通知', // Subject line
    html: `<b>${loginUser.user}您好:</b><br/><br/>恭喜您成功创建如下用户: <br/>用户名: ${user.userName}<br/>密码: ${user.password}` // html body
  }
  try {
    yield email.sendEmail(mailOptions)
    this.body = {
      data: result
    }
  } catch (error) {
    logger.error("Send email error: ", error)
    this.body = {
      data: "SEND_MAIL_ERROR"
    }
  }
}

exports.deleteUser = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  userID = userID === 'default' ? loginUser.id : userID
  const api = apiFactory.getApi(loginUser)

  const result = yield api.users.delete(userID)

  this.body = {
    data: result
  }
}

exports.updateUser = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  userID = userID === 'default' ? loginUser.id : userID
  const api = apiFactory.getApi(loginUser)
  const user = this.request.body

  const result = yield api.users.patch(userID, user)

  this.body = {
    data: result
  }
}

exports.checkUserName = function* () {
  const userName = this.params.user_name
  const api = apiFactory.getApi(this.session.loginUser)
  const response = yield api.users.getBy([userName, 'existence'])
  this.status = response.code
  this.body = response
}

