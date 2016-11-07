/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * DevOps(CI/CD) controller
 *
 * v0.1 - 2016-11-04
 * @author Lei
*/
'use strict'

const apiFactory = require('../services/api_factory')
const logger     = require('../utils/logger.js').getLogger("devops")

/*
Add a new repository type
*/
exports.registerRepo = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  const repoInfo = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  switch (repoType) {
    case "gitlab":
      if (!repoInfo.url || !repoInfo.private_token) {
        const err = new Error("Missing url or private_token for gitlab repository")
        err.status = 400
        throw err
      }
      var RegExp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      if (!RegExp.test(repoInfo.url)) {
        const err = new Error("Invalid gitlab url")
        err.status = 400
        throw err
      }
      break;
    case "svn":
    default:
      const err = new Error('Only support gitlab for now')
      err.status = 400
      throw err
  }
  const result = yield api.createBy(["repos", repoType], null, repoInfo)

  this.body = {
    data: result
  }
}

exports.listRepository = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  if (repoType != "gitlab") {
    const err = new Error('Only support gitlab for now')
    err.status = 400
    throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["repos", repoType], null)

  this.body = {
    data: result
  }
}

exports.syncRepository = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  if (repoType != "gitlab") {
    const err = new Error('Only support gitlab for now')
    err.status = 400
    throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["repos", repoType], null)

  this.body = {
    data: result
  }
}

exports.removeRepository = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  if (repoType != "gitlab") {
    const err = new Error('Only support gitlab for now')
    err.status = 400
    throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.deleteBy(["repos", repoType], null)

  this.body = {
    data: result
  }
}

/*
Require reponame and proejct_id in the query
*/
exports.listBranches = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  const repoName = this.query.reponame
  const project_id = this.query.project_id
  if (repoType != "gitlab") {
    const err = new Error('Only support gitlab for now')
    err.status = 400
    throw err
  }
  if (!repoName || !project_id) {
    const err = new Error('reponame and project_id are required in the query to get the branches information')
    err.status = 400
    throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["repos", repoType, "branches"], {"reponame": repoName, "project_id": project_id})

  this.body = {
    data: result
  }
}
