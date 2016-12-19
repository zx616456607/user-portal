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
  let qiniuConfig = qnAPI.getQiniuConfig()

  if (token === '') {
    this.status = 400
    this.body = 'Invalid bucket or file name'
    return
  }

  this.body = {
    upToken: token,
    url: qiniuConfig.origin
  }
}

exports.changeUserInfo = function* () {
  const body = this.request.body
  const password = body.password
  const email = body.email
  const newPassword = body.newPassword
  const newEmail = body.newEmail
  const user = this.session.loginUser
  const spi = apiFactory.getSpi(user)
  const updateBody = {}
  if(password) {
    updateBody.oldPassword = password
  }
  if(newPassword) {
    updateBody.password = newPassword
  }
  if(newEmail) {
    updateBody.email = newEmail
  }
  const api = apiFactory.getApi(user)
  console.log(updateBody)
  const apiResult = yield api.users.patchBy([user.id], null, updateBody)
  this.status = apiResult.statusCode
  this.body = apiResult
}

exports.uploadToken = function*() {
  const query = this.query
  const api = apiFactory.getApi(this.session.loginUser)
  const apiResult = api.getBy(['store', 'token'], {
    bucket: query.bucket,
    fileName: query.filename
  })
  this.status = apiResult.statusCode
  this.body = apiResult
}
