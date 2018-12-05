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

const urllib = require('urllib')
const config = require('../../configs/index')

const htkgConfig = config.htkg_api
const HTKG_URL = htkgConfig.protocol + '://' + htkgConfig.host + htkgConfig.prefix

exports.hostList = function* () {
  const query = this.query
  const url = HTKG_URL + '/hosts'
  const result = yield urllib.request(url, {
    dataType: 'json',
    dataAsQueryString: true,
    data: query,
  })
  this.body = result.data
}

exports.volumeList = function* () {
  const query = this.query
  const url = HTKG_URL + '/volumes'
  const result = yield urllib.request(url, {
    dataType: 'json',
    dataAsQueryString: true,
    data: query,
  })
  this.body = result.data
}

exports.envList = function* () {
  const query = this.query
  const url = HTKG_URL + '/envs'
  const result = yield urllib.request(url, {
    dataType: 'json',
    dataAsQueryString: true,
    data: query,
  })
  this.body = result.data
}