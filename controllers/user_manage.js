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

exports.getUserDetail = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  if (!userID || userID == '') {
    const re = yield api.getBy(['user_id'])
    userID = re.data['userid']
  }
  //const result = yield api.getBy(['users', userID])
  const result = {
    data: {
      name: "test_name",
      type: "团队管理员",
      tel: "136999999",
      email: "aaa@tenxcloud.com",
      balance: 100
    }
  }
  const user = result.data || {}
  this.body = {
    data: user
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
  if (isNaN(size) || size < 1 || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  const from = size * (page - 1)
  const queryObj = { from, size }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  const api = apiFactory.getK8sApi(loginUser)
  //const result = yield api.getBy(['users'], queryObj)
  const result = {
    data: {
      total: 0,
      count: 0,
      users: []
    }
  }
  const users = result.data.users || []
  this.body = {
    data: users,
    total: result.data.total,
    count: result.data.count
  }
}

