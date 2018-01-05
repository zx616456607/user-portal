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
  const file = yield api.pkg.downloadFile(['download', id])
  const disposition = file.headers['content-disposition']
  if (disposition) {
    this.set('content-disposition', file.headers['content-disposition'])
  }
  this.set('content-type', file.headers['content-type'])
  if (file.status === 403) {
    this.body = '当前操作未被授权，请联系管理员进行授权后，再进行操作。'
    return
  }
  if (file.status === 404) {
    this.body = '应用包不存在，如有疑问，请联系管理员。'
    return
  }
  this.body = file.res
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
  const query = this.query
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
  let response = yield api.pkg.uploadFile(null, query, stream, { headers: stream.headers() }).catch(err => {
    return err
  })
  this.status = response.statusCode
  this.body = response
}

exports.romoteUploadPkg = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const query = this.query
  const body = yield api.pkg.createBy(['remote'],query,this.request.body)
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

exports.auditPkg = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const body = this.request.body
  const id = this.params.id
  const result = yield api.pkg.createBy([id, 'audit'], null, body)
  this.body = result
}

exports.publishPkg = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const body = this.request.body
  const id = this.params.id
  const result = yield api.pkg.createBy([id, 'publish'], null, body)
  this.body = result
}

exports.getPkgDetail = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const id = this.params.id
  const result = yield api.pkg.getBy([id])
  this.body = result
}

exports.updatePkgDetail = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const id = this.params.id
  const body = this.request.body
  const result = yield api.pkg.updateBy([id, 'edit'], null, body)
  this.body = result
}

exports.passPkgPublish = function* () {
  const loginUser = this.session.loginUser
  const body = this.request.body
  const api = apiFactory.getApi(loginUser)
  const id = this.params.id
  const result = yield api.pkg.updateBy(['publish', id, 'pass'], null, body)
  this.body = result
}

exports.refusePkgPublish = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const id = this.params.id
  const body = this.request.body
  const result = yield api.pkg.updateBy(['publish', id, 'refuse'], null, body)
  this.body = result
}

exports.offShelfPkg = function* () {
  const loginUser = this.session.loginUser
  const body = this.request.body
  const api = apiFactory.getApi(loginUser)
  const id = this.params.id
  const result = yield api.pkg.updateBy(['store', id, 'status'], null, body)
  this.body = result
}

exports.getPkgPublishList = function* () {
  const loginUser = this.session.loginUser
  const query = this.query
  const api = apiFactory.getApi(loginUser)
  const request = yield api.pkg.getBy(['publish'], query)
  this.body = request
}

exports.getPkgStoreList = function* () {
  const loginUser = this.session.loginUser
  const query = this.query
  const api = apiFactory.getApi(loginUser)
  const request = yield api.pkg.getBy(['store'], query)
  this.body = request
}

exports.getPkgGroupList = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const request = yield api.pkg.getBy(['group'], null)
  this.body = request
}

exports.uploadPkgIcon = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const content = yield parseForm(this)
  const response = yield api.pkg.createBy(['icon'], null, content)
  this.status = response.statusCode
  this.body = response
}

exports.getPkgIcon = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const id = this.params.id
  const file = yield api.pkg.downloadFile(['icon', id])
  this.set('content-type', file.headers['content-type'])
  this.body = file.res
}

exports.uploadDocs = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const id = this.params.id
  const query = this.query
  let parts = parse(this, {
    autoFields: true
  })
  if (!parts) {
    this.status = 400
    this.message = { message: 'error' }
    return
  }
  // const fileStream = yield parts
  let part
  let response
  const stream = formStream()
  while (part = yield parts) {
    const mimeType = mime.lookup(part.filename)
    stream.stream('docs', part, part.filename, mimeType)
    response = yield api.pkg.uploadFile([id, 'docs'], query, stream, { headers: stream.headers() })
    this.status = response.statusCode
    this.body = response
  }
}

exports.deleteDocs = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const id = this.params.id
  const body = this.request.body
  const result = yield api.pkg.createBy([id, 'docs', 'batch-delete'], null, body)
  this.body = result
}

exports.downloadDocs = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const id = this.params.id
  const query = this.query
  const result = yield api.pkg.downloadFile([id, 'docs', 'download'], query)
  const disposition = result.headers['content-disposition']
  if (disposition) {
    this.set('content-disposition', result.headers['content-disposition'])
  }
  this.set('content-type', result.headers['content-type'])
  if (result.status === 403) {
    this.body = '当前操作未被授权，请联系管理员进行授权后，再进行操作。'
    return
  }
  this.set('content-type', result.headers['content-type'])
  this.body = result.res
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