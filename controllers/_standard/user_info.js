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
const emailUtil = require('../../utils/email')
const security = require('../../utils/security')
const activationMixCode = 'tEn.Xclou210*'
const stdConfigs = require('../../configs/_standard')
const config = require('../../configs')

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
  const protocol = this.query.protocol
  if (!bucketName || !fileName) {
    this.status = 400
    this.body = 'bucket and fileName are required.'
    return
  }

  let qnAPI = new qiniuAPI(bucketName)
  let token = qnAPI.getUpToken(fileName)
  let qiniuConfig = qnAPI.getQiniuConfig()
  // Different upload url for different protocol
  let uploadUrl = 'http://upload.qiniu.com'
  if (protocol === 'https') {
    uploadUrl = 'https://up.qbox.me'
  }
  if (token === '') {
    this.status = 400
    this.body = 'Invalid bucket or file name'
    return
  }

  this.body = {
    upToken: token,
    uploadUrl: uploadUrl,
    origin: qiniuConfig.origin
  }
}

exports.changeUserInfo = function* () {
  const body = this.request.body
  const password = body.password
  const email = body.email
  const newPassword = body.newPassword
  const newEmail = body.newEmail
  const avatar = body.avatar
  const user = this.session.loginUser
  const spi = apiFactory.getSpi(user)
  const phone = body.phone
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
  if(avatar) {
    updateBody.avatar = avatar
  }
  const checkBody = {
    captcha: body.captcha
  }
  if(phone) {
    checkBody.phone = phone
    yield checkMobileCaptcha(checkBody)
    updateBody.phone = phone
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
  const method = 'registerUser'
  const spi = apiFactory.getSpi()
  const user = this.request.body
  if (!user || !user.userName || !user.password || !user.email) {
    const err = new Error('user name, password and email are required.')
    err.status = 400
    throw err
  }

  yield checkMobileCaptcha(user)

  const result = yield spi.users.create(user)

  // send activation email
  logger.info(method, "call apiserver result:", result)
  if (result && result.data && result.data.email) {
    const activationCode = genActivationCode(result.data.email)
    const userActivationURL = `${stdConfigs.host}/users/activation?code=${encodeURIComponent(activationCode)}`
    try {
      emailUtil.sendUserActivationEmail(user.email, userActivationURL)
    } catch (e) {
      logger.error(method, "send user activation email failed.", e)
      // response 200 if send email failed, because user can resend again
    }
  }
  this.body = {
    email: result.data.email,
    code: security.encryptContent(result.data.email),
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
  this.status = 200
  this.body = {
    data: ''
  }
}

function checkMobileCaptcha(user) {
  const method = 'checkMobileCaptcha'
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
      } else {
        resolve()
      }
    })
  })
}

exports.sendResetPasswordLink = function* () {
  const method = "sendResetPasswordLink"

  const email = this.params.email
  const spi = apiFactory.getSpi()
  const result = yield spi.users.getBy([email, 'resetpwcode'])
  const code = result.Code
  const key = `${redisKeyPrefix.resetPassword}#${email}` 
  yield new Promise((resolve, reject) => {
    redisClient.set(key, code, 'EX',  24*60*60, (error) => {
      if (error) {
        logger.error(method, `set key(${key}) value($code) failed.`, error)
        return reject('internal error')
      }
      resolve()
    })
  })

  const link = `${stdConfigs.host}/rpw?email=${email}&code=${encodeURIComponent(code)}`
  try {
    yield emailUtil.sendResetPasswordEmail(email, link)
    this.body = {
      data: {}
    }
  } catch (error) {
    logger.error(method, "Send email error: ", error)
    const err = new Error(error)
    err.status = 500
    throw err
  }
}

exports.sendUserActivationEmail = function* () {
  const method = 'sendUserActivationEmail'
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const email = this.request.body.email
  const code = this.request.body.code

  if (!email || !code) {
    const err = new Error('invalid params')
    err.status = 400
    throw err
  }
  // check email and verification code
  const emailFromCode = security.decryptContent(code)
  if (emailFromCode !== email) {
    const err = new Error('invalid params')
    err.status = 400
    throw err
  }

  // get activation code, this code will send to apiserver when user click the activation URL
  const activationCode = genActivationCode(email)

  // send email
  const userActivationURL = genUserActivationURL(activationCode)
  try {
    emailUtil.sendUserActivationEmail(email, userActivationURL)
  } catch (e) {
    logger.error(method, "send user activation email failed.", e)
    const err = new Error('send email failed')
    err.status = 500
    throw err
  }
  this.body = {
    data: ''
  }
}

exports.activateUserByEmail = function* () {
  const method = 'activateUserByEmail'
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const code = this.query.code  // activation code

  const email = getEmailFromActivationCode(code)
  if (!email) {
    const err = new Error('invalid code')
    err.status = 400
    throw err
  }
  
  // code is valid, call apiserver to set user status to activated
  yield spi.users.createBy(['activations'], null, {email})

  this.status = 302
  this.redirect('/login&from=active')
  return
}

function genUserActivationURL(code) {
  return `${stdConfigs.host}/users/activation?code=${encodeURIComponent(code)}`
}

function genActivationCode(email) {
  return security.encryptContent(activationMixCode + email)
}

// check code validity and get email from code
function getEmailFromActivationCode(code) {
  if (!code) {
    return ''
  }
  const mixCode = security.decryptContent(code)
  if (!mixCode) {
    return ''
  }
  if (mixCode.indexOf(activationMixCode) != 0) {
    return ''
  }
  return mixCode.slice(activationMixCode.length)
}

exports.resetPassword = function* () {
  const method = "resetPassword"

  //Get email, code, password
  const user = this.request.body
  if (!user.email || !user.code || !user.password) {
    const err = new Error('user email, code and password are required.')
    err.status = 400
    throw err
  }
  const key = `${redisKeyPrefix.resetPassword}#${user.email}`

  //Check the email and code are valid
  yield new Promise((resolve, reject) => {
    redisClient.get(key, (error, reply) => {
      if (error) {
        logger.error(method, 'get reset password code failed.', error)
        return reject('internal error')
      }
      if (!reply) {
        logger.error(method, `the key(${key}) does not exist`)
        return reject('重置密码链接已经过期')
      }
      if (reply != user.code) {
        logger.error(method, `the stored code (${reply}) is differnt from the iputted one(${user.code})`)
        return reject('重置密码链接无效')
      }
      resolve()
    })
  })

  //Reset password for the email account
  const spi = apiFactory.getSpi()
  yield spi.users.patchBy([user.email, 'resetpw'], null, user)

  //Remove email/code pair from redis
  yield new Promise((resolve, reject) => {
    redisClient.del(key, (error) => {
      if (error) {
        logger.error(method, `delete key(${key}) failed.`, error)
        //It does not matter if the key cannot be deleted, so don't need to reject
      }
      resolve()
    })
  })

  this.body = {
    data: ''
  }

}