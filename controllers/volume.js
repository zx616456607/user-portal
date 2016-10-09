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

const VolumeApi = require('../tenx_api/v2')
const volumeConfig = {
  protocol: 'http',
  host: 'localhost:8001',
  version: 'v1',
  auth: {
    user: 'yubiao',
    token: 'osakbsmsyxdqczwrxcvrvouqvruccapbwgguwrloyrcrnzlu',
    namespace: 'yubiao'
  },
  timeout: 500
}
const volumeApi = new VolumeApi(volumeConfig)

exports.getVolumeListByPool = function*() {
  let pool = this.params.pool
  let response = yield volumeApi.volumes.getBy([pool,'list'])
  this.status = response.code
  this.body = response
}

exports.deleteVolume = function*() {
  const pool = this.params.pool
  const volumeArray = this.request.body
  if(!volumeArray) {
    this.status = 400
    this.body = {
      message: 'error'
    }
    return
  }
  let response = yield volumeApi.volumes.batchDeleteBy([pool,'delete'], null, volumeArray)
  this.status = 200
  this.body = {}
}


exports.createVolume = function*() {
  const pool = this.params.pool
  const reqData = this.request.body
  let response = yield volumeApi.volumes.create(reqData)
  this.status = response.code
  this.body = response
}


exports.formateVolume = function*() {
  let pool = this.params.pool
  let reqData = this.request.body
  if(!reqData.type || !reqData.name) {
    this.status = 400
    this.body = { message:　'error'}
  }
  const response = yield volumeApi.volumes.updateBy([pool, reqData.name, 'format'], null, {
    format: reqData.type,
    diskType: 'rbd'
  })
  this.status = response.code
  this.body = response
}

exports.resizeVolume = function*() {
  const pool = this.params.pool
  const reqData = this.request.body
  if(reqData.name || reqData.size) {
    this.status = 400
    this.body = { message: 　'error' }
  }
  const response = yield volumeApi.volumes.updateBy([pool, reqData.name], null, {
    size: reqData.size
  })
  this.status = response.code
  this.body = response
}
exports.getVolumeDetail = function*() {
  const pool = this.params.pool
  const volumeName = this.params.name
  const response = yield volumeApi.volumes.getBy([pool, volumeName, 'consumption'])
  this.status = response.code
  this.body = {
    body: response.body
  }
}

exports.uploadFile = function*() {
  const parts = parse(this, {
    autoFields: true
  })
  if(!parts) {
    this.status = 400
    this.message = { message: 'error'}
    return
  }
  const fileStream = yield parts
  const { pool, isUnzip, format, volumeName} = parts.field
  const stream = formStream()
  stream.stream(fileStream.filename, fileStream, fileStream.filename, fileStream.mimeType, fileStream._readableState.length)
  let response = yield volumeApi.volumes.uploadFile([pool, volumeName, 'import'], { isUnzip }, stream, stream.headers())
  this.status = response.code
  this.body = response
}


exports.getFileHistory = function* () {
  const volumeName = this.params.name
  
}