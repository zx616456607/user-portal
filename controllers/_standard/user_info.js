/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * User info controller: for Public Cloud Only
 *
 * v0.1 - 2016-12-13
 * @author Lei
*/
'use strict'

const apiFactory = require('../../services/api_factory')
const logger     = require('../../utils/logger.js').getLogger('user_info')
const qiniuAPI = require('../../store/qiniu_api')
/*
Get basic user info including user and certificate
*/
exports.getMyAccountInfo = function* () {
  const loginUser = this.session.loginUser
  const userID = this.session.loginUser.id

  const api = apiFactory.getApi(loginUser)
  // Get User info
  const result = yield api.users.getBy([userID])
  const userInfo = result.data ? result.data : {}
  // Get certificate info
  const spi = apiFactory.getSpi(loginUser)
  const certInfo = yield spi.certificates.get()

  this.body = {
    userInfo: userInfo,
    certInfo: certInfo
  }
}

/*
Get the token to upload specified file to qiniu
*/
exports.upTokenToQiniu = function* () {
  // Get bucket and file name from body
  const bucketName = this.query.bucket
  const fileName = this.query.fileName
  if (!bucketName || !fileName) {
    this.status = 400
    this.body = 'bucket and fileName are required.'
    return
  }

  let qnAPI = new qiniuAPI(bucketName)
  let token = qnAPI.getUpToken(fileName)

  if (token === '') {
    this.status = 400
    this.body = 'Invalid bucket or file name'
    return
  }

  this.body = {
    upToken: token
  }
}
