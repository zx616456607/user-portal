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
Add a new repository type: gitlab only
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
      break;
  
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
  if (repoType != "gitlab" && repoType != 'github') {
    const err = new Error('Only support gitlab/github for now')
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
  if (repoType != "gitlab" && repoType != 'github')  {
    const err = new Error('Only support gitlab/github for now')
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
  if (repoType != "gitlab" && repoType != "github") {
    const err = new Error('Only support gitlab/github for now')
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
  if (repoType != "gitlab" && repoType != "github") {
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

exports.getUserInfo = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  if (repoType != "gitlab" && repoType != "github")  {
    const err = new Error('Only support gitlab for now')
    err.status = 400
    throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["repos", repoType, "user"], null)

  this.body = {
    data: result
  }
}

// Get the redirect url of 3rdparty repository
exports.getAuthRedirectUrl = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["repos", repoType, "auth"], null)
  
  this.body = {
    data: result
  }
}

exports.doUserAuthorization = function* () {
  const method = "doUserAuthorization"
  const loginUser = this.session.loginUser
  var type = this.params.type
  if (!type) {
    this.status = 400
    this.body = "No repository type specified"
    return
  }

  var resData = {
    authInfo: loginUser.ciAuthInfo || {},
    type: type 
  }
  var state = this.query.state
  if (state && loginUser.github_state && state !== loginUser.github_state) {
    resData.err = type + ': 您填入的URL或token有错误, 请填入正确的信息'
    this.status = 400
    this.body = resData.err
    return
  }
  delete loginUser.github_state
  var users = type + '_users'
  var authorized = type + '_authorized'
  var authInfo = {
    code: this.query.code
  }
  if (type === 'bitbucket') {
    authInfo = {
      code: this.query.oauth_token,
      oauth_token_secret: loginUser.bitbucket_oauth_token_secret,
      oauth_verifier: this.query.oauth_verifier
    }
  }
  const api = apiFactory.getDevOpsApi(loginUser)
  const results = yield api.createBy(["repos", type], null, authInfo)

  resData.authInfo[users] = results;
  resData.authInfo[authorized] = true;
  // Save to session
  loginUser.ciAuthInfo = resData.authInfo

  this.status = 200
  this.redirect('/ci_cd/coderepo?' + type)
  //this.body = results
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
    case "github":
      if (!body.projectId) {
        const err = new Error("projectId for github is required")
        err.status = 400
        throw err
      }
      break;
    case "svn":
      if (body.is_private == 1) {
        if (!body.username || !body.password) {
          const err = new Error("username and password for private SVN repository are required")
          err.status = 400
          throw err
        }
      }
      break;
    default:
      const err = new Error('Only support gitlab/github/svn for now')
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
  result.results.map((item) => {
    item.branchList = []
  })
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
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id], null, body)

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
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id, "stages", stage_id], null, body)

  this.body = {
    data: result
  }
}

exports.getStage = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "stages", stage_id], null)

  this.body = {
    data: result
  }
}

exports.createFlowBuild = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const body = this.request.body

  // TODO: validate body format

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.createBy(["ci-flows", flow_id, "builds"], null, body)

  this.body = {
    data: result
  }
}

exports.listBuilds = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "builds"], null)

  this.body = {
    data: result
  }
}

exports.getFlowBuild = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const flow_build_id = this.params.flow_build_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "builds", flow_build_id], null)
  result.results.results.map((item) => {
    item.logInfo = null;
    item.isFetching = false;
  })

  this.body = {
    data: result
  }
}

exports.stopBuild = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const flow_build_id = this.params.flow_build_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id, "builds", flow_build_id, "stop"], null)

  this.body = {
    data: result
  }
}

/* CD rules
*/
exports.createCDRule = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.createBy(["ci-flows", flow_id, "cd-rules"], null, body)

  this.body = {
    data: result
  }
}

exports.listCDRules = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "cd-rules"], null)

  this.body = {
    data: result
  }
}

exports.removeCDRule = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const rule_id = this.params.rule_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.deleteBy(["ci-flows", flow_id, "cd-rules", rule_id], null)

  this.body = {
    data: result
  }
}

exports.updateCDRule = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const rule_id = this.params.rule_id
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id, "cd-rules", rule_id], null, body)

  this.body = {
    data: result
  }
}

/*
CI rules 
*/
exports.getCIRule = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "ci-rules"])
  
  this.body = {
    data: result
  }
}

exports.updateCIRule = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const body = this.request.body
  
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id, "ci-rules"], null, body)

  this.body = {
    data: result
  }
}

/*
Dockerfile APIs
*/
exports.listDockerfiles = function* () {
  const loginUser = this.session.loginUser

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["dockerfiles"], null)

  this.body = {
    data: result
  }
}

exports.addDockerfile = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.createBy(["ci-flows", flow_id, "stages", stage_id, "dockerfile"], null, body)

  this.body = {
    data: result
  }
}

exports.getDockerfile = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "stages", stage_id, "dockerfile"], null)

  this.body = {
    data: result
  }
}

exports.removeDockerfile = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.deleteBy(["ci-flows", flow_id, "stages", stage_id, "dockerfile"], null)

  this.body = {
    data: result
  }
}

exports.updateDockerfile = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id, "stages", stage_id, "dockerfile"], null, body)

  this.body = {
    data: result
  }
}

// Return the images that configured in stages of a flow
// In most case, it should be one image
exports.getImagesOfFlow = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "images"], null)

  this.body = {
    data: result
  }
}

exports.listDeploymentLogsOfFlow = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const limit = this.query.limit
  var query = null
  if (limit) {
    query = {"limit": limit}
  }
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "deployment-logs"], query)

  this.body = {
    data: result
  }
}

//flow build
exports.getBuildLog = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "builds"], null)
  
  this.body = {
    data: result
  }
}

exports.getLastBuildLog = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "lastbuild"], null)
  
  this.body = {
    data: result
  }
}

exports.getFlowStageBuildLog = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id
  const stage_build_id = this.params.stage_build_id
  
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "stages", stage_id, "builds", stage_build_id, "log"], null)
  
  this.body = {
    data: result
  }
}

exports.getStageBuildLogList = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id
  
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "stages", stage_id, "builds"], null)
  
  this.body = {
    data: result
  }
}