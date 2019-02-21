'use strict'

/**
* Created by houxz on 2017/6/6.
*/
const apiFactory = require('../services/api_factory')


exports.createProject = function* () {
  const project = this.request.body
  if (!project.projectName) {
    this.status = 400
    this.body = {
      message: 'project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.createBy([''], null, this.request.body)
  this.status = response.statusCode
  this.body = response
}

exports.deleteProjects = function* () {
  const project = this.request.body
  if (!project.projects) {
    this.status = 400
    this.body = {
      message: 'project names are empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.createBy(['batch-delete'], null, this.request.body)
  this.status = response.statusCode
  this.body = response
}

exports.getProjectDetail = function* () {
  const projectName = this.params.name
  if (!projectName) {
    this.status = 400
    this.body = {
      message: 'project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy([projectName, 'detail'], null)
  this.status = response.statusCode
  this.body = response
}

exports.listProjects = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy(['listwithoutstatistic'], query)
  this.status = response.statusCode
  this.body = response
}

exports.listProjectsAndStatistics = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy(['list'], query)
  this.status = response.statusCode
  this.body = response
}

exports.listVisibleProjects = function* () {
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy(['list-visible'], null)
  this.status = response.statusCode
  this.body = response
}

exports.updateProject = function* () {
  const project = this.request.body
  const projectName = this.params.name
  if (!project || !projectName) {
    this.status = 400
    this.body = {
      message: 'request body or projectName was  empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.updateBy([projectName], null, this.request.body)
  this.status = response.statusCode
  this.body = response
}

exports.checkProjectNameExists = function* () {
  const projectName = this.params.name
  if (!projectName) {
    this.status = 400
    this.body = {
      message: 'project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy([projectName, 'check-exists'], null)
  this.status = response.statusCode
  this.body = response
}

exports.checkDisplayNameExists = function* () {
  const projectName = this.params.name
  if (!projectName) {
    this.status = 400
    this.body = {
      message: 'display name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy([encodeURIComponent(projectName), 'name-exists'], null)
  this.status = response.statusCode
  this.body = response
}

exports.checkProjectManager = function* () {
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy(['check-manager'], null)
  this.status = response.statusCode
  this.body = response
}

exports.getProjectAllClusters = function* () {
  const projectName = this.params.name
  if (!projectName) {
    this.status = 400
    this.body = {
      message: 'project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  if (projectName === 'default') {
    const spi = apiFactory.getSpi(loginUser)
    const result = yield spi.clusters.getBy(['default'])
    this.body = {
      data: result
    }
    return
  }
  const projectApi = apiFactory.getApi(loginUser)
  const query = this.query || {}
  const response = yield projectApi.projects.getBy([projectName, 'clusters'], query)
  this.status = response.statusCode
  this.body = response
}

exports.getProjectVsibleClusters = function* () {
  const projectName = this.params.name
  if (!projectName) {
    this.status = 400
    this.body = {
      message: 'project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  if (projectName === 'default') {
    const spi = apiFactory.getSpi(loginUser)
    const result = yield spi.clusters.getBy(['default'])
    this.body = {
      data: result
    }
    return
  }
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy([projectName, 'visible-clusters'], null)
  this.status = response.statusCode
  this.body = response
}

exports.getProjectVisibleClusters = function* () {
  const projectName = this.params.name
  if (!projectName) {
    this.status = 400
    this.body = {
      message: 'project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy([projectName, 'visible-clusters'], null)
  this.status = response.statusCode
  this.body = response
}

exports.getProjectApprovalClusters = function* () {
  const query = this.query || {}
  // const filter = query.filter
  // const queryObj = {}
  // if (filter) {
  //   queryObj.filter = filter
  // }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy(['approval-clusters'], query)
  this.status = response.statusCode
  this.body = response
}

exports.updateProjectClusters = function* () {
  const cluster = this.request.body
  const projectName = this.params.name
  if (!cluster || !projectName) {
    this.status = 400
    this.body = {
      message: 'request body or projectName was  empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.updateBy([projectName, 'clusters'], null, this.request.body)
  this.status = response.statusCode
  this.body = response
}

exports.updateProjectApprovalClusters = function* () {
  const cluster = this.request.body
  if (!cluster) {
    this.status = 400
    this.body = {
      message: 'request body was empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.updateBy(['clusters'], null, this.request.body)
  this.status = response.statusCode
  this.body = response
}

exports.addProjectRelatedUsers = function* () {
  const project = this.request.body
  const projectName = this.params.name
  if (!project || !projectName) {
    this.status = 400
    this.body = {
      message: 'request body or project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.createBy([projectName, 'users'], null, this.request.body)
  this.status = response.statusCode
  this.body = response
}
exports.getProjectRelatedUsers = function* () {
  const projectName = this.params.name
  if (!projectName) {
    this.status = 400
    this.body = {
      message: 'project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy([projectName, 'users'], null)
  this.status = response.statusCode
  this.body = response
}
exports.deleteProjectRelatedUsers = function* () {
  const project = this.request.body
  const projectName = this.params.name
  if (!project || !projectName) {
    this.status = 400
    this.body = {
      message: 'request body or project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.createBy([projectName, 'users', 'batch-delete'], null, this.request.body)
  this.status = response.statusCode
  this.body = response
}

exports.updateProjectRelatedUsers = function* () {
  const project = this.request.body
  const projectName = this.params.name
  if (!project || !projectName) {
    this.status = 400
    this.body = {
      message: 'request body or projectName was  empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.updateBy([projectName, 'users'], null, this.request.body)
  this.status = response.statusCode
  this.body = response
}

exports.updateProjectRelatedRoles = function* () {
  const project = this.request.body
  const projectName = this.params.name
  if (!project || !projectName) {
    this.status = 400
    this.body = {
      message: 'request body or projectName was  empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.updateBy([projectName, 'roles'], null, this.request.body)
  this.status = response.statusCode
  this.body = response
}

exports.deleteProjectRelatedRoles = function* () {
  const project = this.request.body
  const projectName = this.params.name
  if (!project || !projectName) {
    this.status = 400
    this.body = {
      message: 'request body or projectName was  empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.createBy([projectName, 'roles','batch-delete'], null, this.request.body)
  this.status = response.statusCode
  this.body = response
}

function* removeUserFromProject() {
  const projectId = this.params.project_id
  const userId = this.params.user_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.projects.deleteBy([ projectId, 'users', userId ])
}
exports.removeUserFromProject = removeUserFromProject

function* handleRoleBinding() {
  const body = this.request.body || {}
  const rolebinding = body.rolebinding || {}
  const roleUnbind = body.roleUnbind || {}
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const reqArray = []
  if (rolebinding.bindings && rolebinding.bindings.length > 0) {
    reqArray.push(api.projects.createBy([ 'rolebinding' ], null, rolebinding))
  }
  if (roleUnbind.bindings && roleUnbind.bindings.length > 0) {
    reqArray.push(api.projects.createBy([ 'rolebinding', 'batch-delete' ], null, roleUnbind))
  }
  this.body = yield reqArray
}
exports.handleRoleBinding = handleRoleBinding

exports.getProjectRelatedRoles = function* () {
  const projectName = this.params.name
  if (!projectName) {
    this.status = 400
    this.body = {
      message: 'project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy([projectName, 'roles'], null)
  this.status = response.statusCode
  this.body = response
}

exports.getProjectMembers = function* () {
  const query = this.query
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy(['members'], query)
  this.status = response.statusCode
  this.body = response
}

exports.deleteProjectRelatedRoles = function* () {
  const project = this.request.body
  const projectName = this.params.name
  if (!project || !projectName) {
    this.status = 400
    this.body = {
      message: 'request body or projectName was  empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.createBy([projectName, 'roles','batch-delete'], null, this.request.body)
  this.status = response.statusCode
  this.body = response
}

exports.getPluginStatus = function* () {
  const query = this.query
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy(['plugins', 'enabled'], query)
  this.status = response.statusCode
  this.body = response
}

exports.pluginTurnOn = function* () {
  const query = this.query
  const name = this.params.name
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.updateBy(['plugins', name, 'enable'], query)
  this.status = response.statusCode
  this.body = response
}

exports.pluginTurnOff = function* () {
  const query = this.query
  const name = this.params.name
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.updateBy(['plugins', name, 'disable'], query)
  this.status = response.statusCode
  this.body = response
}


exports.checkPluginInstallStatus = function* () {
  const query = this.query
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy(['plugins', 'installed'], query)
  this.status = response.statusCode
  this.body = response
}
