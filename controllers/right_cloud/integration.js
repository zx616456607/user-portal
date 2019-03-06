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

exports.subnetList = function* () {
  const query = this.query
  const vpcId = this.params.vpcId
  let path = `/vpc/${vpcId}/subnets`
  if (vpcId === '1455') {
    // 天熠云
    path = `/winserver/${vpcId}/subnets`
  }
  const result = yield HTKG_REQUEST(path, {
    data: query,
  })
  this.status = result.statusCode
  this.body = result.data
}

exports.networkList = function* () {
  const query = this.query
  const envId = this.params.envId
  const path = `/env/${envId}/vpc`
  const result = yield HTKG_REQUEST(path, {
    data: query,
  })
  this.status = result.statusCode
  this.body = result.data
}

exports.virtualNetwork = function* () {
  const query = this.query
  const path = 'networks/ports'
  const result = yield HTKG_REQUEST(path, {
    data: query,
  })
  this.status = result.statusCode
  this.body = result.data
}
