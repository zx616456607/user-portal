/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
*/

/* Qiniu API for upload files
 * Code reference: https://github.com/qiniu/nodejs-sdk.v6
 *
 * 2016-12-16
 * @author Lei
*/
'use strict'

var qn = require('qn')
var logger = require('../utils/logger.js').getLogger("qiniu_api")
var storeConfig = require('../configs/_standard/qiniu') 

// 10 mins to expire
const ExpireTime = 600
/*
 * Qiniu upload APIs
 */
function QiniuAPI(bucket) {
  this.qiniuConfig = {}
  switch (bucket) {
    case 'ticket':
      if (storeConfig.qn_access_upload && storeConfig.qn_access_upload.bucket === 'tenxcloud-upload') {
        this.qiniuConfig = storeConfig.qn_access_upload
      }
      break
    case 'icon':
      if (storeConfig.qn_access_icon && storeConfig.qn_access_icon.bucket === 'tenxcloud-icon') {
        this.qiniuConfig = storeConfig.qn_access_icon
      }
      break
    case 'avatars':
      if (storeConfig.qn_access_avatar && storeConfig.qn_access_avatar.bucket === 'avatars') {
        this.qiniuConfig = storeConfig.qn_access_avatar
      }
      break
    case 'volume':
      if (storeConfig.qn_volume_private && storeConfig.qn_volume_private.bucket === 'tenx-volume') {
        this.qiniuConfig = storeConfig.qn_volume_private
      }
      break
    case 'certificate':
      if (storeConfig.qn_certification && storeConfig.qn_certification.bucket === 'tenx-enterprise-certification') {
        this.qiniuConfig = storeConfig.qn_certification
      }
      break
    default:
      logger.error("Invalid qiniu bucket: " + bucket)
      return
  }
  // Add other options
  this.qiniuConfig.deadline = ExpireTime + Math.floor(Date.now() / 1000)
  this.qiniuConfig.scope = this.qiniuConfig.bucket
}

/*
Get the token to upload file
*/
QiniuAPI.prototype.getUpToken = function (fileName) {
  if (!this.qiniuConfig.scope || !fileName) {
    logger.error('Invalid configuration or no file name, return empty token')
    return ''
  }
  // Clone the cnofig from base
  let config = JSON.parse(JSON.stringify(this.qiniuConfig))
  // Add file name to scope
  config.scope= config.scope + ':' + fileName
  // Create the client
  let client = qn.create(config)
  // Return upload token
  return client.uploadToken()
}

// Testing purpose for now
QiniuAPI.prototype.uploadFile = function (fileName, callback) {
  let method = 'uploadFile'
  if (!this.qiniuConfig.scope || !fileName) {
    logger.error('Invalid configuration or no file name, return empty token')
    return ''
  }
  // Clone the config from base
  let config = JSON.parse(JSON.stringify(this.qiniuConfig))
  // Add file name to scope
  config.scope= config.scope + ':' + fileName
  // Create the client
  let client = qn.create(config)
  // upload a file with custom key
  client.uploadFile(fileName, function (err, result) {
    if (err) {
      logger.err(method, "Failed to update to qiniu: " + JSON.stringify(err))
    }
    logger.info(method, JSON.stringify(result))
    if (callback) {
      callback(err, result)
    }
  })
}

module.exports = QiniuAPI
