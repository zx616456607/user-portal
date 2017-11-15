/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2017-11-13
 * @author houxz
 */

'use strict'

const apiFactory = require('../services/api_factory')

exports.publish = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const body = this.request.body
  if (!body.versions){
    this.status = 400
    this.message = { message: 'versions is required' }
    return
  }
  let result = {}
  let requestBody = body
  body.versions.forEach(item => {
    requestBody.id = body.imageName + `:` + item
    result = yield api.appstore.createBy(['apps','publish'], null, requestBody)
    if (result.statusCode != 200){
        this.body = result
        return
    }
  })
  this.body = result
}

exports.management = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const body = this.request.body
  const result = yield api.appstore.updateBy([apps], null, body)
  this.body = result
}

exports.getStorelist = function* () {
  const loginUser = this.session.loginUser
  const query = this.query
  const api = apiFactory.getApi(loginUser)
  const result = yield api.appstore.getBy(['apps'], query)
  this.body = result
}

exports.getVisibleList = function* (){
  const loginUser = this.session.loginUser
  const query = this.query
  const api = apiFactory.getApi(loginUser)
  const result = yield api.appstore.getBy(['apps','visible'], query)
  this.body = result
}

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
  const result = yield api.appstore.uploadFile(['icon'], null, stream, stream.headers()).catch(err => {
    return err
  })
  this.status = result.statusCode
  this.body = result
}

exports.getIcon = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const id = this.params.id
  const result = yield api.appstore.getBy(['icon', id, null])
  this.body = result
}