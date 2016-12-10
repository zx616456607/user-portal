/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Index services for app
 * v0.1 - 2016-11-17
 * @author Zhangpc
 */
'use strict'

const crypto = require('crypto')
const i18n = require('i18next')
const apiFactory = require('./api_factory')
const logger = require('../utils/logger').getLogger('services/index')
const constants = require('../constants')
const USER_CURRENT_CONFIG = constants.USER_CURRENT_CONFIG

exports.setUserCurrentConfigCookie = function* (loginUser) {
  const method = 'setUserCurrentConfigCookie'
  // Get default clusters
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.clusters.getBy(['default'])
  const clusters = result.clusters || [{}]
  const config = `default,default,${clusters[0].clusterID}`
  logger.info(method, `set current config cookie to: ${config}`)
  this.cookies.set(USER_CURRENT_CONFIG, config, {
    httpOnly: false
  })
}

exports.getLicense = function* (loginUser) {
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.license.get()
  let plain = {}
  try {
    let licenseObj = JSON.parse(_decrypt(result.data.license))
    if (!licenseObj.ExpireDate) {
      plain.status = 'LICENSE_ERROR'
      plain.code = -1
      return
    }
    let expireDate = new Date(licenseObj.ExpireDate)
    let currentDate = new Date()
    plain.expireDate = expireDate
    if (currentDate > expireDate) {
      plain.status = 'TRAIL_EXPIRED'
      plain.code = -1
      return
    }
    plain.clusterLimit = licenseObj.ClusterLimit
    plain.nodesLimitPerCluster = licenseObj.NodesLimitPerCluster
    let trialDays = Math.round((expireDate - currentDate) / (24 * 3600 * 1000))
    if (trialDays < 365) {
      plain.status = 'NO_LICENSE'
      plain.code = 1
      return
    }
    plain.status = 'LICENSE_OK'
    plain.code = 0
  } catch (e) {
    plain.status = 'LICENSE_ERROR'
    plain.code = -1
  } finally {
    return {
      license: result.data.license,
      plain: plain,
      message: i18n.t(`common:license.${plain.status}`)
    }
  }
}

function _decrypt(text) {
  const algorithm = 'aes-192-cbc'
  let iv = new Buffer([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1])
  let pwd1 = 'T1X2C3D!'
  let pwd2 = 'F^I$G&H*'
  let pwd3 = 'T(E)R088'
  let pwd = pwd1 + pwd2 + pwd3
  let decipher = crypto.createDecipheriv(algorithm, pwd, iv)
  let dec = decipher.update(text, 'base64', 'utf8')
  dec += decipher.final('utf8')
  return dec
}