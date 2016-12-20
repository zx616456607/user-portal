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
const redisClient = require('../../utils/redis').client
const redisKeyPrefix = require('../../utils/redis').redisKeyPrefix
const sendCaptchaToPhone = require('../../utils/captchaSms').sendCaptchaToPhone

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
    uploadUrl: 'http://upload.qiniu.com',
    origin: qiniuConfig.origin
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

exports.registerUser = function* () {
  const spi = apiFactory.getSpi()
  const user = this.request.body
  if (!user || !user.userName || !user.password || !user.email) {
    const err = new Error('user name, password and email are required.')
    err.status = 400
    throw err
  }

  const result = yield spi.users.create(user)

  this.body = {
    data: result
  }
}

exports.registerUserAndJoinTeam = function* () {
  const spi = apiFactory.getSpi()
  const user = this.request.body
  if (!user || !user.userName || !user.password || !user.email || !user.code) {
    const err = new Error('user name, password, email and inviting code are required.')
    err.status = 400
    throw err
  }

  yield checkMobileCaptcha(user)

  const result = yield spi.users.createBy(['jointeam'], null, user)

  this.body = {
    data: result
  }
}

exports.sendCaptcha = function* () {
  const method = 'sendCaptcha'
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  if (!this.request.body || !this.request.body.mobile) {
    const err = new Error('user mobile are required.')
    err.status = 400
    yield Promise.reject(err)
  }
  const mobile = this.request.body.mobile
  const redisConf = {
    captchaPrefix: `${redisKeyPrefix.captcha}`,
    captchaSendFrequencePrefix: `${redisKeyPrefix.frequenceLimit}`
  }
  yield sendCaptchaToPhone(mobile, redisConf)
}

function checkMobileCaptcha(user) {
  const method = "checkMobileCaptcha"
  if (!user || !user.phone || !user.captcha) {
    const err = new Error('user mobile, mobile captcha are required.')
    err.status = 400
    return Promise.reject(err)
  }

  return new Promise((resolve, reject) => {
    const key = `${redisKeyPrefix.captcha}#${user.phone}`
    redisClient.get(key, (err, reply) => {
      if (err) {
        logger.error(method, `get key(${key}) failed.`, err)
        return reject('internal error')
      }
      if (reply != user.captcha) {
        logger.info(method, `get redis key(${key}), captcha in redis(${reply}) not equal to captcha in request(${user.captcha})`)
        const err = new Error('验证码错误或已失效')
        err.status = 400
        return reject(err)
      }
      else {
        resolve()
      }
    })
  })
}
