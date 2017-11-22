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
  const api = apiFactory.getApi(loginUser)
  const body = this.request.body
  const result = yield api.appstore.updateBy(['apps','approval'], null, body)
  this.body = result
}

exports.getAppslist = function* () {
  const loginUser = this.session.loginUser
  const query = this.query
  const api = apiFactory.getApi(loginUser)
  const result = yield api.appstore.getBy(['apps'], query)
  this.body = result
}

exports.checkAppNameExists = function*(){
  const loginUser = this.session.loginUser
  const name = this.params.name
  if (!name){
    this.status = 400
    this.message = { message: 'name is empty' }
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
  const api = apiFactory.getApi(loginUser)
  const body = this.request.body
  const result = yield api.appstore.createBy(['apps', 'images','publishment'], null, body)
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
    this.statusCode = 400
    this.message = {message:"request repositories is empty"}
    return
  }
  const repositories = body.image.split('/')
  if (repositories.length != 3){
    this.statusCode = 400
    this.message = {message:"request repositories is invalid"}
    return
  }
  this.params.user = repositories[1]
  this.params.name = repositories[2]
  yield registry_harbor.getRepositoriesTags.call(this)
  if ( !this.body.data || this.body.data.length == 0){
    return
  }
  body.tags = this.body.data
  const result = yield api.appstore.createBy(['apps','images','status'], null, body)
  if (result.statusCode != 200){
    return
  }
  let arrayResult = []
  for (let i in result.data){
    arrayResult.push({
      name:i,
      status:result.data[i]
    })
  }
  result.data = arrayResult
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
  const result = yield api.appstore.getBy(['apps','icon', id, null])
  this.body = result
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