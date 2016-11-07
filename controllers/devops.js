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
Code repositories
*/
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

/*
Managed projects
*/
/*
{
  "name": "first managed project",
  "is_private": 1,
  "repo_type": "gitlab",
  "source_full_name": "wanglei/demo-project",
  "address": "git@gitlab.tenxcloud.com:wanglei/demo-project.git",
  "gitlab_project_id": 131
}
*/
exports.addManagedProject = function* () {
  const loginUser = this.session.loginUser
  const body = this.request.body

  if (!body.name || !body.repo_type || !body.address) {
    const err = new Error('name, repo_type address are required in the query to get the branches information')
    err.status = 400
    throw err
  }

  switch (body.repo_type) {
    case "gitlab":
      if (!body.source_full_name || !body.gitlab_project_id) {
        const err = new Error("source_full_name and gitlab_project_id for gitlab are required")
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

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.createBy(["managed-projects"], null, body)

  this.body = {
    data: result
  }
}

exports.listManagedProject = function* () {
  const loginUser = this.session.loginUser

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["managed-projects"], null)

  this.body = {
    data: result
  }
}

exports.removeManagedProject = function* () {
  const loginUser = this.session.loginUser
  const project_id = this.params.project_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.deleteBy(["managed-projects", project_id], null)

  this.body = {
    data: result
  }
}

/*
CI flows
*/
exports.createCIFlows = function* (){
  const loginUser = this.session.loginUser
  const body = this.request.body

  if (!body.name) {
    const err = new Error('name of flow is required')
    err.status = 400
    throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.createBy(["ci-flows"], null, body)

  this.body = {
    data: result
  }
}

exports.listCIFlows = function* (){
  const loginUser = this.session.loginUser

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows"], null)

  this.body = {
    data: result
  }
}

exports.getCIFlow = function* (){
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id], null)

  this.body = {
    data: result
  }
}

exports.updateCIFlow = function* (){
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id], null)

  this.body = {
    data: result
  }
}

exports.removeCIFlow = function* (){
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.deleteBy(["ci-flows", flow_id], null)

  this.body = {
    data: result
  }
}

/*
CI flow stages
*/
exports.listFlowStages = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "stages"], null)

  this.body = {
    data: result
  }
}

exports.createFlowStages = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const body = this.request.body
  // TODO: validate body format


  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.createBy(["ci-flows", flow_id, "stages"], null, body)

  this.body = {
    data: result
  }
}

exports.deleteFlowStage = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.deleteBy(["ci-flows", flow_id, "stages", stage_id], null)

  this.body = {
    data: result
  }
}

exports.updateFlowStage = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id, "stages", stage_id], null)

  this.body = {
    data: result
  }
}