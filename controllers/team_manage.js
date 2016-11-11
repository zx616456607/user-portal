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
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE

exports.getTeamspaces = function* () {
  const teamID = this.params.team_id
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
  if (from == 0 && size == 0) {
    queryObj = {}
  }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  const api = apiFactory.getApi(loginUser)
  const result = yield api.teams.getBy([teamID, 'spaces'], queryObj)
  const teamspaces = result.spaces || []
  let total = 0
  if (result.listMeta && result.listMeta.total) {
    total = result.listMeta.total
  }
  this.body = {
    data: teamspaces,
    total,
  }
}

exports.getTeamClusters = function* () {
  const teamID = this.params.team_id
  const loginUser = this.session.loginUser
  if (teamID === 'default') {
    const spi = apiFactory.getSpi(loginUser)
    const result = yield spi.clusters.getBy(['default'])
    this.body = {
      data: result.clusters || [],
      total: result.listMeta.total,
      count: result.listMeta.size
    }
    return
  }
  const query = this.query || {}
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let name = query.name
  if (isNaN(page) || page < DEFAULT_PAGE) {
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
  if (name) {
    queryObj.filter = `name ${name}`
  }
  const api = apiFactory.getApi(loginUser)
  const result = yield api.teams.getBy([teamID, 'clusters'], queryObj)
  const clusters = result.clusters || []
  this.body = {
    data: clusters,
    total: result.listMeta.total,
    count: result.listMeta.size
  }
}

exports.getTeamUsers = function* () {
  const teamID = this.params.team_id
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
  if (from == 0 && size == 0) {
    queryObj = {}
  }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  const api = apiFactory.getApi(loginUser)
  const result = yield api.teams.getBy([teamID, 'users'], queryObj)
  const users = result.users || []
  let total = 0
  if (result.listMeta && result.listMeta.total) {
    total = result.listMeta.total
  }
  size = 0
  if (result.listMeta && result.listMeta.count) {
    size = result.listMeta.size
  }

  this.body = {
    users,
    total,
    size
  }
}

exports.createTeam = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const team = this.request.body
  if (!team || !team.teamName) {
    const err = new Error('team name is required.')
    err.status = 400
    throw err
  }
  const result = yield api.teams.create(team)

  this.body = {
    data: result
  }
}

exports.createTeamspace = function* () {
  const teamID = this.params.team_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const teamspace = this.request.body
  if (!teamspace || !teamspace.name) {
    const err = new Error('teamspace name is required.')
    err.status = 400
    throw err
  }
  const result = yield api.teams.createBy([teamID, 'spaces'], null, teamspace)

  this.body = {
    data: result
  }
}

exports.deleteTeam = function* () {
  const teamID = this.params.team_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)

  const result = yield api.teams.delete(teamID)

  this.body = {
    data: result
  }
}

exports.addTeamusers = function* () {
  const teamID = this.params.team_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const userIDs = this.request.body
  const result = yield api.teams.createBy([teamID, 'users'], null, userIDs)

  this.body = {
    data: result
  }
}

exports.removeTeamusers = function* () {
  const teamID = this.params.team_id
  const userIDs = this.params.user_ids
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)

  const result = yield api.teams.deleteBy([teamID, 'users', userIDs])

  this.body = {
    data: result
  }
}