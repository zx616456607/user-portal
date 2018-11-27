/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2017-11-13
 * @author houxz
 */

'use strict'

const parse = require('co-busboy')
const apiFactory = require('../services/api_factory')
const registry_harbor = require('./registry_harbor')

/*------------------------ apps store approve start--------------------*/
exports.approveApps = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 180000)
  const body = this.request.body
  const result = yield api.appstore.updateBy(['apps','approval'], null, body)
  this.body = result
}

exports.getAppApprovalList = function*(){
  const loginUser = this.session.loginUser
  const query = this.query
  const api = apiFactory.getApi(loginUser)
  const result = yield api.appstore.getBy(['apps','approval'], query)
  this.body = result
}

exports.getStorelist = function* () {
  const loginUser = this.session.loginUser
  const query = this.query
  const api = apiFactory.getApi(loginUser)
  let result = yield api.appstore.getBy(['apps'], query)
  if (result.statusCode != 200){
    this.body = result
    return
  }
  this.query = {}
  const project_id = yield getAppStoreProjectID.call(this)
  this.query.project_id = project_id
  this.query.detail = 1
  if (project_id === -1) {
    this.status = 400
    this.body = { message: 'repo is not public' }
    this.body.is_public = false
    return
  }
  yield registry_harbor.getProjectRepositories.call(this)
  const repo_detail = this.body
  if (result.data.apps && result.data.apps.length > 0) {
    for (let i=0;i<result.data.apps.length;i++){
      result.data.apps[i].download_times = 0
      for (let j=0;j<repo_detail.data.length;j++){
        if (result.data.apps[i].resource_name === repo_detail.data[j].name){
          result.data.apps[i].download_times = repo_detail.data[j].pull_count
          break
        }
      }
    }
    if (query.download_times && query.download_times === 'd'){
      result.data.apps.sort((a,b) => {
        return b.download_times - a.download_times
      })
    }
    if (query.publish_time && query.publish_time === 'd'){
      result.data.apps.sort((a,b) => {
        return new Date(b.publish_time).getTime() - new Date(a.publish_time).getTime()
      })
    }
    if (query.app_name && query.app_name === 'a'){
      result.data.apps.sort((a,b) => {
        return a.app_name > b.app_name ? 1 : -1
      })
    }
    if (query.from && query.size){
      result.data.apps = result.data.apps.slice(query.from,query.from+query.size)
    }
  }
  this.body = result
}

exports.checkAppNameExists = function*(){
  const loginUser = this.session.loginUser
  const name = this.params.name
  if (!name){
    this.status = 400
    this.body = { message: 'name is empty' }
    return
  }
  const api = apiFactory.getApi(loginUser)
  const result = yield api.appstore.getBy(['apps',name,'existence'], null)
  this.body = result
}

/*------------------------ apps store approve end--------------------*/


/*------------------------ image start--------------------*/

exports.publishImage = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getApi(loginUser)
  const body = this.request.body
  const result = yield api.appstore.createBy([cluster, 'apps', 'images','publishment'], null, body)
  this.body = result
}

exports.manageImages = function* (){
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const body = this.request.body
  const result = yield api.appstore.updateBy(['apps','images'], null, body)
  this.body = result
}

exports.getImagesList = function* (){
  const loginUser = this.session.loginUser
  const query = this.query
  const api = apiFactory.getApi(loginUser)
  const result = yield api.appstore.getBy(['apps','images'], query)
  this.body = result
}

exports.getImageStatus = function* (){
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  let body = this.request.body
  if (!body.image){
    this.status = 400
    this.body = {message:"request repositories is empty"}
    return
  }
  let firstIndex = body.image.indexOf('/')
  if (firstIndex > 1) {
    let fullName = body.image.substring(firstIndex + 1)
    let splitIndex = fullName.indexOf('/')
    if (splitIndex > 1) {
      this.params.user = fullName.substring(0, splitIndex)
      this.params.name = fullName.substring(splitIndex + 1)
    }
  }
  yield registry_harbor.getRepositoriesTags.call(this)
  if ( !this.body.data || this.body.data.length == 0){
    return
  }

  body.tags = typeof this.body.data[0] === 'object' ? this.body.data.map(item => {
    return item.name || item.tag //name 新版 harbor tag 旧版harbor
  }) : this.body.data

  const result = yield api.appstore.createBy(['apps','images','status'], null, body)
  if (result.status != 200){
    return
  }
  let arrayResult = []
  for (let i in result.data.status){
    arrayResult.push({
      name:i,
      status:result.data.status[i]
    })
  }
  result.icon = result.data.icon
  result.description = result.data.description
  result.file_nick_name = result.data.file_nick_name
  result.classify_name = result.data.classify_name
  result.data = arrayResult
  this.body = result
}

exports.checkImageExists = function*(){
  const loginUser = this.session.loginUser
  const body = this.request.body
  const api = apiFactory.getApi(loginUser)
  const result = yield api.appstore.createBy(['apps','images','existence'], null,body)
  this.body = result
}

/*------------------------ image end--------------------*/


/*------------------------ icon start--------------------*/
exports.uploadIcon = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const app = this.params.app
  const content = yield parseForm(this)
  const response = yield api.appstore.createBy(['apps', app, 'icon'], null, content)
  this.status = response.statusCode
  this.body = response
}

exports.getIcon = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const id = this.params.id
  const file = yield api.appstore.downloadFile(['apps','icon', id, null])
  this.set('content-type', file.headers['content-type'])
  this.body = file.res
}

/*------------------------ image end--------------------*/


function* getAppStoreProjectID(){
  this.query.name = 'system_store'
  // Search in public scope
  this.query.is_public = 1
  yield registry_harbor.getProjects.call(this)
  if (this.body.total == 0){
    return -1
  }
  return this.body.data[0].project_id
}
function* parseForm(ctx) {
  const parts = parse(ctx, {autoFields: true})
  const fileStream = yield parts
  return new Promise((resolve, reject) => {
    ctx.field = parts.field
    try {
      let buffer = []
      fileStream.on('data', chunk => buffer.push(chunk))
      fileStream.on('end', () => resolve(Buffer.concat(buffer)))
    } catch (err) {
      reject(err)
    }
  })
}

/*------------------------ image end--------------------*/
