/**
* Created by dengqiaoling on 2017/6/6.
*/
const apiFactory = require('../services/api_factory')

exports.createProject=function* () {
  const project=this.request.body
  if (!project.projectName) {
    this.status = 400
    this.body = {
	  message: 'project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi=apiFactory.getApi(loginUser)
  const response=yield projectApi.project.createBy([''],null,this.request.body)
  this.status = response.statusCode
  this.body = response
}

exports.deleteProject=function* () {
  const project=this.request.body
  if (!project.projects) {
    this.status = 400
    this.body = {
      message: 'project names are empty'
    }
  return
}
  const loginUser = this.session.loginUser
  const projectApi=apiFactory.getApi(loginUser)
  const response=yield projectApi.project.createBy(['batch-delete'],null,this.request.body)
  this.status = response.statusCode
  this.body = response
}

exports.getProjectDetail=function* () {
  const projectName=this.params.name
  if (!projectName) {
    this.status = 400
    this.body = {
      message: 'project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi=apiFactory.getApi(loginUser)
  const response=yield projectApi.project.getBy([projectName,'detail'],null)
  this.status = response.statusCode
  this.body = response
}

exports.listProject=function* () {
  const loginUser = this.session.loginUser
  const projectApi=apiFactory.getApi(loginUser)
  const response=yield projectApi.project.getBy(['list'],null)
  this.status = response.statusCode
  this.body = response
}
exports.listVisibleProject=function* () {
  const loginUser = this.session.loginUser
  const projectApi=apiFactory.getApi(loginUser)
  const response=yield projectApi.project.getBy(['list-visible'],null)
  this.status = response.statusCode
  this.body = response
}

exports.updateProject=function* () {
  const project=this.request.body
  const projectName=this.params.name
  if (!project||!projectName) {
    this.status = 400
    this.body = {
      message: 'request body nor projectName was  empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi=apiFactory.getApi(loginUser)
  const response=yield projectApi.project.updateBy([projectName],null,this.request.body)
  this.status = response.statusCode
  this.body = response
}

exports.checkProjectNameExists=function* () {
  const projectName=this.params.name
  if (!projectName) {
    this.status = 400
    this.body = {
      message: 'project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi=apiFactory.getApi(loginUser)
  const response=yield projectApi.project.getBy([projectName,'check-exists'],null)
  this.status = response.statusCode
  this.body = response
}

exports.checkProjectManager=function* () {
  const loginUser = this.session.loginUser
  const projectApi=apiFactory.getApi(loginUser)
  const response=yield projectApi.project.getBy(['check-manager'],null)
  this.status = response.statusCode
  this.body = response
}
exports.getProjectClusters=function* () {
  const projectName=this.params.name
  if (!projectName) {
    this.status = 400
    this.body = {
      message: 'project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi=apiFactory.getApi(loginUser)
  const response=yield projectApi.project.getBy([projectName,'cluster'],null)
  this.status = response.statusCode
  this.body = response
}

exports.addProjectClusters=function* () {
  const project=this.request.body
  const projectName=this.params.name
  if (!project||!projectName) {
    this.status = 400
    this.body = {
      message: 'request body nor project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi=apiFactory.getApi(loginUser)
  const response=yield projectApi.project.createBy([projectName,'cluster'],null,this.request.body)
  this.status = response.statusCode
  this.body = response
}

exports.deleteProjectClusters=function* () {
  const project=this.request.body
  const projectName=this.params.name
  if (!project||!projectName) {
    this.status = 400
    this.body = {
	    message: 'request body nor project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi=apiFactory.getApi(loginUser)
  const response=yield projectApi.project.createBy([projectName,'cluster','batch-delete'],null,this.request.body)
  this.status = response.statusCode
  this.body = response
}
exports.addProjectRelatedUsers=function* () {
  const project=this.request.body
  const projectName=this.params.name
  if (!project||!projectName) {
    this.status = 400
    this.body = {
	    message: 'request body nor project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi=apiFactory.getApi(loginUser)
  const response=yield projectApi.project.createBy([projectName,'user'],null,this.request.body)
  this.status = response.statusCode
  this.body = response
}
exports.getProjectRelatedUsers=function* () {
  const projectName=this.params.name
  if (!projectName) {
    this.status = 400
    this.body = {
  	  message: 'project name is empty'
    }
  return
  }
  const loginUser = this.session.loginUser
  const projectApi=apiFactory.getApi(loginUser)
  const response=yield projectApi.project.getBy([projectName,'user'],null)
  this.status = response.statusCode
  this.body = response
}
exports.deleteProjectRelatedUsers=function* () {
  const project=this.request.body
  const projectName=this.params.name
  if (!project||!projectName) {
    this.status = 400
    this.body = {
      message: 'request body nor project name is empty'
    }
    return
  }
  const loginUser = this.session.loginUser
  const projectApi=apiFactory.getApi(loginUser)
  const response=yield projectApi.project.createBy([projectName,'user','batch-delete'],null,this.request.body)
  this.status = response.statusCode
  this.body = response
}