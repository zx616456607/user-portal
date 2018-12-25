/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Right cloud integration controller
 *
 * v0.1 - 2018-11-23
 * @author Zhangxuan
 */
'use strict'

const HTKG_REQUEST = require('../../services/htkg_request')

exports.hostList = function* () {
  const query = this.query
  const path = '/hosts'
  const result = yield HTKG_REQUEST(path, {
    data: query,
  })
  this.status = result.statusCode
  this.body = result.data
}

exports.volumeList = function* () {
  const query = this.query
  const path = '/volumes'
  const result = yield HTKG_REQUEST(path, {
    data: query,
  })
  this.status = result.statusCode
  this.body = result.data
}

exports.envList = function* () {
  const query = this.query
  const path = '/envs'
  const result = yield HTKG_REQUEST(path, {
    data: query,
  })
  this.status = result.statusCode
  this.body = result.data
}
