/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2017-11-13
 * @author houxz
 */

'use strict'

const apiFactory = require('../services/api_factory')

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
  result = yield api.appstore.createBy(['apps','publish'], null, body)
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
  const body = this.request.body
  const result = yield api.appstore.createBy(['apps','images','status'], null, body)
  this.body = result
}

/*------------------------ image end--------------------*/


/*------------------------ icon start--------------------*/
exports.uploadIcon = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const parts = parse(this, {
    autoFields: true
  })
  if (!parts) {
    this.status = 400
    this.message = { message: 'error' }
    return
  }
  const fileStream = yield parts
  const stream = formStream()
  const mimeType = mime.lookup(fileStream.filename)
  stream.stream('pkg', fileStream, fileStream.filename, mimeType)
  const result = yield api.appstore.uploadFile(['apps','icon'], null, stream, stream.headers()).catch(err => {
    return err
  })
  this.status = result.statusCode
  this.body = result
}

exports.getIcon = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const id = this.params.id
  const result = yield api.appstore.getBy(['apps','icon', id, null])
  this.body = result
}

/*------------------------ image end--------------------*/