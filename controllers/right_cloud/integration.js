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
const DEFAULT_HEADERS = {
  /*'api-key-id': htkgConfig.api_key_id,
  'api-key-secret': htkgConfig.api_key_secret,*/
}
exports.login = function* () {
  const body = {
    account: 'yunxin',
  }
  const url = HTKG_URL + '/users/login'
  const result = yield urllib.request(url, {
    method: 'POST',
    dataType: 'json',
    data: body,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return result
}
exports.hostList = function* () {
  const query = this.query
  const url = HTKG_URL + '/hosts/grid'
  const tokenRes = yield exports.login()
  const result = yield urllib.request(url, {
    dataType: 'json',
    dataAsQueryString: true,
    data: query,
    headers: Object.assign({}, DEFAULT_HEADERS, {
      Authorization: `Bearer ${tokenRes.data.data.token}`
    }),
  })
  this.body = result.data
}

exports.volumeList = function* () {
  const query = this.query
  const url = HTKG_URL + '/volumes'
  const tokenRes = yield exports.login()
  const result = yield urllib.request(url, {
    dataType: 'json',
    dataAsQueryString: true,
    data: query,
    headers: Object.assign({}, DEFAULT_HEADERS, {
      Authorization: `Bearer ${tokenRes.data.data.token}`
    }),
  })
  this.body = result.data
}

exports.envList = function* () {
  const query = this.query
  const url = HTKG_URL + '/envs'
  const tokenRes = yield exports.login()
  const result = yield urllib.request(url, {
    dataType: 'json',
    dataAsQueryString: true,
    data: query,
    headers: Object.assign({}, DEFAULT_HEADERS, {
      Authorization: `Bearer ${tokenRes.data.data.token}`
    }),
  })
  this.body = result.data
}