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
var parse = require('co-busboy')

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
  if(!reqData.type || !reqData.volumeName) {
    this.status = 400
    this.body = { message:　'error'}
  }
  this.status = 200
  this.body = {}
}

exports.resizeVolume = function*() {
  const pool = this.params.pool
  this.status = 200
  this.body = {} 
}
exports.getVolumeDetail = function*() {
  this.status = 200
  this.body = {
    volumeName: 'dd',
    isUsed: true,
    create_time:new Date(),
    usedSize: 100,
    totalSize: 1024,
    mount_point: '/test'
  }
}

exports.uploadFile = function*() {
  const parts = yield parse(this, {
    autoFields: true
  })
  if(!parts) {
    this.status = 400
    this.message = { message: 'error'}
    return
  }
  const pool = this.params.pool
  const volumeName = this.params.name
  const isUnzip = this.request.query.isUnzip || 'false'
  console.log(parts)
  let response = yield volumeApi.volumes.uploadFile([pool, volumeName, 'import'], { isUnzip }, parts)
  this.status = response.code
  this.body = response
}