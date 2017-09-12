/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2017-07-01
 * @author baiyu
 */

'use strict'

const apiFactory = require('../services/api_factory')
const formStream = require('formstream')
const constants = require('../constants')
const parse = require('co-busboy')
const mime = require('mime')
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE

exports.getPkgManageList = function*() {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const query = this.query
  // let page = parseInt(query.page || DEFAULT_PAGE)
  // let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  // let name = query.filename
  // if (isNaN(page) || page < 1) {
  //   page = DEFAULT_PAGE
  // }
  // if (isNaN(size) || size < 1 || size > MAX_PAGE_SIZE) {
  //   size = DEFAULT_PAGE_SIZE
  // }
  // const from = size * (page - 1)
  // const queryObj = { from, size }
  // if (name) {
  //   queryObj.filter = `filename ${name}`
  // }

  const list = yield api.pkg.get(query)
  if (list.data) {
    list.data.registry = global.globalConfig.registryConfig.url
  }
  this.body = list
}

exports.downloadPkg = function*() {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const id = this.params.id
  const file = yield api.pkg.downloadFile([id])
  this.set('content-disposition', file.headers['content-disposition'])
  this.set('content-type', file.headers['content-type'])
  this.body = file.data
}

exports.deletePkg = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const id = this.request.body
  const file = yield api.pkg.createBy(['batch-delete'],null, id)
  this.body = file
}

exports.localUploadPkg = function*() {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const filename = this.params.filename
  const filetag = this.params.filetag
  const filetype = this.params.filetype
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
  let response = yield api.pkg.uploadFile([filename,filetag,filetype], null, stream, stream.headers()).catch(err => {
    return err
  })
  this.status = response.statusCode
  this.body = response
}

exports.romoteUploadPkg = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const filename = this.params.filename
  const filetag = this.params.filetag
  const filetype = this.params.filetype
  const body = yield api.pkg.createBy([filename,filetag,filetype,'remote'],null,this.request.body)
  this.body = body
}


exports.getVersions = function* (){
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const filename = this.params.filename
  const filetype = this.params.filetype
  if (!filename){
    this.status = 400
    this.body = {
      message:"filename is empty"
    }
  }
  const query = {
    "filter":`fileName contains ${filename}`
  }
  const list = yield api.pkg.getBy([filename,filetype,'versions'],query)
  this.body = list
}