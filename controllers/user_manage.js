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
const NO_CLUSTER_FLAG = constants.NO_CLUSTER_FLAG
const CREATE_PROJECTS_ROLE_ID = constants.CREATE_PROJECTS_ROLE_ID
const CREATE_TEAMS_ROLE_ID = constants.CREATE_TEAMS_ROLE_ID
const ROLE_TEAM_ADMIN = 1
const ROLE_SYS_ADMIN = 10
const ROLE_PLATFORM_ADMIN = 2
const config = require('../configs')
const standardMode = require('../configs/constants').STANDARD_MODE
const serviceIndex = require('../services')
const registryConfigLoader = require('../registry/registryConfigLoader')
const initGlobalConfig = require('../services/init_global_config')
const securityUtil = require('../utils/security')
const sessionService = require('../services/session')
const _ = require('lodash')

/*
Only return the detail of one user
*/
exports.getUserDetail = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  userID = userID === 'default' ? loginUser.id : userID
  const api = apiFactory.getApi(loginUser)
  const result = yield api.users.getBy([userID])
  const user = result ? result.data : {}
  if (this.params.user_id === 'default') {
    // For get loginUser info when user refresh page
    user.watchToken = loginUser.watchToken
    yield initGlobalConfig.initGlobalConfig()
    // For no cluster handle
    user[NO_CLUSTER_FLAG] = loginUser[NO_CLUSTER_FLAG]
    // Get config from config file and update session
    serviceIndex.addConfigsForFrontend(user, loginUser)
    loginUser.tenxApi = user.tenxApi
    loginUser.cicdApi = user.cicdApi
    _.merge(loginUser, user)
    user.userID = userID
    // Delete sensitive information
    // delete user.userID
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

  // get users is online
  let sessionUsers = []
  let allSessions = yield sessionService.getAllSessions()
  allSessions.forEach(session => {
    if (session.loginUser && session.loginUser.namespace) {
      sessionUsers.push(session.loginUser)
    }
  })
  const sessionTotal = sessionUsers.length

  users.map(user => {
    for (let i = 0; i < sessionUsers.length; i++) {
      const sessionUser = sessionUsers[i]
      if (user.userID === sessionUser.id) {
        user.online = true
        return
      }
    }
  })

  this.body = {
    users,
    total,
    sessionUsers: sessionUsers.map(({ namespace, ip, ua }) => ({ namespace, ip, ua })),
    sessionTotal,
    onlineTotal: _.unionBy(sessionUsers, 'namespace').length,
  }
}

exports.getUserTeams = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  if (config.running_mode === standardMode) {
    const spi = apiFactory.getSpi(loginUser)
    let query = {}
    if (this.query.sort) {
      query.sort = this.query.sort
    }
    if (this.query.page > 0) {
      const size = this.query.size || 5
      query.from = (this.query.page-1) * size
    }
    if (this.query.size) {
      query.size = this.query.size
    }
    if (this.query.filter) {
      query.filter = this.query.filter
    }
    const result = yield spi.teams.get(query)
    this.body = {
      data: result,
    }
  }
  else {
    // Show teams that current user create or belongs to
    let managedTeams = (userID === 'default')
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
      queryObj.filter = query.filter
    }
    queryObj.managedTeams = managedTeams
    const api = apiFactory.getApi(loginUser)
    let result = yield api.teams.get(queryObj)
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
}

function* getUserTeamsNew() {
  let userId = this.params.user_id
  const loginUser = this.session.loginUser
  userId = userId === 'default'
           ? loginUser.id
           : userId
  const query = this.query || {}
  const api = apiFactory.getApi(loginUser)
  const result = yield api.users.getBy([ userId, 'teams' ], query)
  this.body = result.data || {}
}
exports.getUserTeamsNew = getUserTeamsNew

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
  const method = 'createUser'
  if (!user || !user.userName || !user.password || !user.email) {
    const err = new Error('user name, password and email are required.')
    err.status = 400
    throw err
  }
  const result = yield api.users.create(user)

  // add permissions for create project or team
  const { authority } = user
  if (authority && authority.length > 0) {
    const { userID } = result
    try {
      result.addPermissons = yield api.users.createBy([ userID, 'global', 'global', 'roles' ], null, { roles: authority })
    } catch (err) {
      logger.error(method, 'add permissions failed', err.stack)
    }
  }
  if (result.mailSent) {
    this.body = {
      data: result
    }
    return
  }
  logger.error("Send email error...")
  this.body = {
    data: "SEND_MAIL_ERROR"
  }
}

exports.deleteUser = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  userID = userID === 'default' ? loginUser.id : userID
  const api = apiFactory.getApi(loginUser)

  try {
    const result = yield api.users.delete(userID)
    // Make user logout
    sessionService.removeKeyByUserID(userID).then(res => {
      logger.info('remove user from session store success', userID)
    })
    this.body = {
      data: result
    }
  } catch (error) {
    this.status = error.statusCode
    this.body = error
  }
}

exports.batchDeleteUser = function* () {
  const UserInfo = this.request.body
  if (!UserInfo) {
    const err = new Error('users are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.users.batchDeleteBy(['batch-delete'], null, { UserInfo })
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
  // If update admin password, refresh the cache of registry
  if (result && result.statusCode === 200) {
    if (user.password) {
      // Make user logout
      sessionService.removeKeyByUserID(userID).then(res => {
        logger.info('remove user from session store success', userID)
      })
    }
  }

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

function* getUserProjects() {
  const userId = this.params.user_id
  const api = apiFactory.getApi(this.session.loginUser)
  const response = yield api.users.getBy([userId, 'projects'])
  this.status = response.code
  this.body = response
}
exports.getUserProjects = getUserProjects

function* updateTeamsUserBelongTo() {
  let userId = this.params.user_id
  const loginUser = this.session.loginUser
  const body = this.request.body
  const api = apiFactory.getApi(loginUser)
  userId = userId === 'default'
           ? loginUser.id
           : userId
  let addTeamsReuslt
  let removeTeamsReuslt
  const reqArray = []
  if (body.addTeams) {
    reqArray.push(api.users.createBy([ userId, 'teams' ], null, body.addTeams))
  }
  if (body.removeTeams) {
    reqArray.push(api.users.batchDeleteBy([ userId, 'teams', 'batch-delete' ], null, body.removeTeams))
  }
  const response = yield reqArray
  this.body = response
}
exports.updateTeamsUserBelongTo = updateTeamsUserBelongTo

function* updateUserActive() {
  let userId = this.params.user_id
  const active = this.params.active
  const loginUser = this.session.loginUser
  userId = userId === 'default'
           ? loginUser.id
           : userId
  const api = apiFactory.getApi(loginUser)
  const response = yield api.users.updateBy([ userId, active ])
  if (active === 'deactive') {
    // Make user logout
    sessionService.removeKeyByUserID(userId).then(res => {
      logger.info('remove user from session store success', userId)
    })
  }
  this.body = response
}
exports.updateUserActive = updateUserActive

function* getSoftdeletedUsers() {
  const query = this.query
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const response = yield api.users.getBy(['softdeleted'], query)
  this.status = response.code
  this.body = response
}
exports.getSoftdeletedUsers = getSoftdeletedUsers

exports.getUsersExclude = function* () {
  const query = this.query || {}
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const response = yield api.users.getBy(['search'],query)
  this.status = response.code
  this.body = response
}

function* bindRolesForUser() {
  const loginUser = this.session.loginUser
  const userId = this.params.user_id
  const scope = this.params.scope
  const scopeID = this.params.scopeID
  const body = this.request.body
  const api = apiFactory.getApi(loginUser)
  const reqArray = []
  if (body.bindUserRoles.roles.length > 0) {
    reqArray.push(api.users.createBy([ userId, scope, scopeID, 'roles' ], null, body.bindUserRoles))
  }
  if (body.unbindUserRoles.roles.length > 0) {
    reqArray.push(api.users.batchDeleteBy([ userId, scope, scopeID, 'roles', 'batch-delete' ], null, body.unbindUserRoles))
  }
  const result = yield reqArray
  this.body = result
}
exports.bindRolesForUser = bindRolesForUser

function* teamtransfer() {
  const loginUser = this.session.loginUser
  const userId = this.params.user_id
  const body = this.request.body
  const api = apiFactory.getApi(loginUser)
  const result = yield api.users.createBy([ userId, 'teamtransfer' ], null, body)
  this.body = result
}
exports.teamtransfer = teamtransfer

function* resetPassword() {
  const method = "resetPassword"
  // Get email, code, password
  const user = this.request.body
  if (!user.email || !user.code || !user.password) {
    const err = new Error('user email, code and password are required.')
    err.status = 400
    throw err
  }

  // Reset password for the email account
  const spi = apiFactory.getSpi()
  const result = yield spi.users.patchBy([user.email, 'resetpw'], { code: user.code }, user)

  this.body = result
}
exports.resetPassword = resetPassword
