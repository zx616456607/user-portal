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
const constants = require('../../constants/')
const urllib = require('urllib')
const redisKeyPrefix = require('../../utils/redis').redisKeyPrefix
const md5 = require('md5')
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
  let mobile = this.request.body

  // check mobile format
  if (!mobile || !constants.PHONE_REGEX.test(mobile)) {
    logger.info(method, 'check mobile failed. mobile is', mobile)
    const err = new Error('mobile is invalid')
    err.status = 400
    throw err
  }

  // generate captcha
  const captcha = Math.random().toString().substr(2,6)
  
  // set sms sending frequence to 60 second
  yield new Promise((resolve, reject) => {
    const redisFrequenceLimitKey = `${redisKeyPrefix.frequenceLimit}#${mobile}`
    redisClient.set(redisFrequenceLimitKey, '1', 'NX', 'EX', 60, function(err, reply) {
      if (err) {
        logger.error(method, 'write frequence limit to redis failed.', err)
        return reject('internal error')
      }
      if (reply == null) {
        logger.info(method, 'frequence limit not timeout, not send captcha sms')
        const err = new Error('frequence limit not timeout, not send captcha sms')
        err.status = 403
        return reject(err)
      }
      resolve()
    })
  })

  // save captcha in redis, expire time 15 minute
  yield new Promise((resolve, reject) => {
    const redisKey = `${redisKeyPrefix.captcha}#${mobile}`
    redisClient.set(redisKey, captcha, 'EX', 15 * 60, function(err, reply) {
      if (err) {
        logger.error(method, 'write captcha to redis failed.', err)
        return reject('internal error')
      }
      resolve()
    })
  })

  // send sms
  const smsConfig = require('../../configs/_standard').sms
  if (!smsConfig.apiKey || !smsConfig.account) {
    logger.error(method, 'get sms service account/apiKey failed. please check envionment variables USERPORTAL_IHUYI_ACCOUNT/USERPORTAL_IHUYI_APIKEY')
    const err = new Error('internal error')
    err.status = 500
    throw err
  }
  const content = `您的验证码是：${captcha}。请不要把验证码泄露给其他人。`
  const timestamp = Date.parse(new Date()) / 1000
  const rawData = `${smsConfig.account}${smsConfig.apiKey}${mobile}${content}${timestamp}`
  const md5Pwd = md5(rawData)
  // 当参数format为json，请求失败时还是有可能返回xml，所以没有设置format参数为json
  const url = `${smsConfig.host}?method=Submit&account=${smsConfig.account}&password=${md5Pwd}&mobile=${mobile}&content=${encodeURI(content)}&time=${timestamp}`
  logger.info(method, `sending captcha to ${mobile} url: ${url}`)
  yield new Promise((resolve, reject) => {
    urllib.request(url, function(err, data, res) {
      if (err) {
        logger.error(method, 'call sms service failed.', err)
        return reject('internal error')
      }
      const parseString = require('xml2js').parseString
      parseString(data, function(err, result) {
        if (err) {
          logger.error(method, 'parse response xml failed. return xml:', data, 'err:', err)
          return reject('internal error')
        }
        if (result && result.SubmitResult && result.SubmitResult.code.length === 1) {
          const code = result.SubmitResult.code[0]
          switch (code) {
          case '2':
            resolve()
          case '4085': {
            const err = new Error('同一手机号验证码短信发送超出5条')
            err.status = 400
            return reject(err)
          }
          case '4030': {
            const err = new Error('手机号码已被列入黑名单')
            err.status = 400
            return reject(err)
          }
          default:
            return reject('内部错误')
          }
        }
        else {
          logger.error(method, 'send sms failed. return xml:', data, 'exception:', e)
          return reject('internal error')
        }
      })
    })
  })

  this.body = {
    data: captcha
  }
}

function checkMobileCaptcha(user) {
  const method = "checkMobileCaptcha"
  if (!user || !user.phone || !user.captcha) {
    const err = new Error('user mobile, mobile captcha are required.')
    err.status = 400
    return Promise.reject(err)
  }

  return new Promise((resolve, reject) => {
    const key = `${redisKeyPrefix.captcha}#${user.mobile}`
    redisClient.get(key, (err, reply) => {
      if (err) {
        logger.error(method, `get key(${key}) failed.`, err)
        return reject('internal error')
      }
      if (reply != user.captcha) {
        logger.info(method, `captcha in redis(${reply}) not equal to captcha in request(${user.captcha})`)
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
