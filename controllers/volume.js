/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Index controller
 *
 * v0.1 - 2016-09-22
 * @author YangYuBiao
 */

'use strict'
const parse = require('co-busboy')
const fs = require('fs')
const formStream = require('formstream')
const mime = require('mime')
const http = require('http')

const VolumeApi = require('../tenx_api/v2')
const volumeConfig = {
  protocol: 'http',
  host: '192.168.1.103:48000',
  version: 'v2',
  auth: {
    user: 'zhangpc',
    token: 'jgokzgfitsewtmbpxsbhtggabvrnktepuzohnssqjnsirtot',
    namespace: 'zhangpc'
  },
  timeout: 50000
}
const volumeApi = new VolumeApi(volumeConfig)

exports.getVolumeListByPool = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const appName = this.query.appname
  let response = yield volumeApi.clusters.getBy([cluster, 'volumes'], {
    appname: appName
  })
  this.status = response.code
  this.body = response
}

exports.deleteVolume = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const volumeArray = this.request.body
  if (!volumeArray) {
    this.status = 400
    this.body = {
      message: 'error'
    }
    return
  }
  let response = yield volumeApi.clusters.batchDeleteBy([cluster, 'volumes', 'batch-delete'], null, volumeArray)
  this.status = 200
  this.body = {}
}


exports.createVolume = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const reqData = this.request.body
  let response = yield volumeApi.clusters.createBy([cluster, 'volumes'], null, reqData)
  this.status = response.code
  this.body = response
}


exports.formateVolume = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  let reqData = this.request.body

  if (!reqData.type || !reqData.name) {
    this.status = 400
    this.body = { message: 'error' }
  }
  const response = yield volumeApi.clusters.updateBy([cluster, 'volumes', reqData.name, 'format'], null, {
    fsType: reqData.fsType,
  })
  this.status = response.code
  this.body = response
}

exports.resizeVolume = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const reqData = this.request.body
  if (!reqData.name || !reqData.size) {
    this.status = 400
    this.body = { message: 'error' }
  }
  const response = yield volumeApi.clusters.updateBy([cluster, 'volumes', reqData.name, 'expansion'], null, {
    size: reqData.size
  })
  this.status = response.code
  this.body = response
}
exports.getVolumeDetail = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const volumeName = this.params.name
  const response = yield volumeApi.clusters.getBy([cluster, 'volumes', volumeName, 'consumption'])
  this.status = response.code
  this.body = {
    body: response.data
  }
}


exports.beforeUploadFile = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const volumeName = this.params.name
  const reqData = this.request.body
  if (!reqData.fileName || !reqData.size) {
    this.status = 400
    this.body = { message: 'error' }
    return
  }
  const response = yield volumeApi.clusters.createBy([cluster, 'volumes', volumeName, 'beforimport'], null, reqData)
  this.status = response.code
  this.body = response
}

exports.uploadFile = function* () {
  const parts = parse(this, {
    autoFields: true
  })
  if (!parts) {
    this.status = 400
    this.message = { message: 'error' }
    return
  }
  const cluster = this.params.cluster
  const fileStream = yield parts
  const pool = parts.field.pool
  const isUnzip = parts.field.isUnzip
  const format = parts.field.format
  const volumeName = parts.field.volumeName
  const backupId = parts.field.backupId
  const stream = formStream()
  const mimeType = mime.lookup(fileStream.filename)
  stream.stream(fileStream.filename, fileStream, fileStream.filename, mimeType)
  let response = yield volumeApi.clusters.uploadFile([cluster, volumeName, backupId, 'import'], { isUnzip }, stream, stream.headers())
  this.status = response.code
  this.body = response
}


exports.getFileHistory = function* () {
  const volumeName = this.params.name
  const pool = this.params.pool
  const cluster = this.params.cluster
  let response = yield volumeApi.clusters.getBy([cluster, volumeName, 'filehistory'])
  this.status = response.code
  this.body = response
}

exports.getBindInfo = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const volumeName = this.params.name
  const response = yield volumeApi.clusters.getBy([cluster, 'volumes', volumeName, 'bindinfo'], null)
  this.status = response.code
  this.body = response
}

exports.getAvailableVolume = function*() {
  volumeConfig.version = 'v2'
  volumeConfig.host = '192.168.1.103:48000'
  const volumeApi = new VolumeApi(volumeConfig)
  const cluster = this.params.cluster
  const response = yield volumeApi.clusters.getBy([cluster, 'volumes', 'available'], null)
  this.status = response.code
  this.body = response
}
 


exports.exportFile = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const volumeName = this.params.name
  const option = {
    protocol: 'http:',
    hostname: 'localhost',
    port: 8000,
    headers: {
      "user": 'zhangpc',
      "token": 'jgokzgfitsewtmbpxsbhtggabvrnktepuzohnssqjnsirtot',
      "namespace": 'zhangpc'
    },
    path: '/api/v1/volumes/pool/cluster/name/exportfile'
  }
  const request = http.request(option, res => {
    res.setEncoding('utf8')
    res.on('data', data => {
      this.res.write(data.toString())
    })
    res.on('end', (a) => {
      this.res.end()
    })
  })
  request.on('error', error => {
    this.res.end(`{ "message": "${JSON.stringify(error)}" }`)
  })
}
