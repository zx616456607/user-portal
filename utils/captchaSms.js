/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2016-12-20
 * @author mengyuan
 */
'use strict'

const logger = require('./logger').getLogger('captchaSms')
const urllib = require('urllib')
const md5 = require('md5')
const constants = require('../constants')
const redisClient = require('./redis').client
const security = require('./security')
const utils = require('./index')
const internalError = genInternalError()

function sendCaptchaToPhone(mobile, redisConf) {
  const method = 'sendCaptchaToPhone'
  // check mobile format
  if (!mobile || !constants.PHONE_REGEX.test(mobile)) {
    logger.info(method, 'check mobile failed. mobile is', mobile)
    const err = new Error('手机号不合法')
    err.status = 400
    return Promise.reject(err)
  }

  const captchaPrefix = redisConf.captchaPrefix
  const captchaRetainSec = redisConf.captchaRetaiSec || 900 // 15 minute
  const captchaSendFrequencePrefix = redisConf.captchaSendFrequencePrefix
  const captchaSendFrequenceSec = redisConf.captchaSendFrequenceSec || 60 // 1 minute
  if (!captchaPrefix || !captchaSendFrequencePrefix) {
    logger.error(method, 'redisConf invalid. redisConf:', redisConf)
    return Promise.reject(internalError)
  }

  // generate captcha
  const captcha = Math.random().toString().substr(2,6)

  // set sms sending frequence to 60 second
  const setFrequence = new Promise((resolve, reject) => {
    const sendCaptchaFrequenceKey = `${captchaSendFrequencePrefix}#${mobile}`
    redisClient.set(sendCaptchaFrequenceKey, '1', 'NX', 'EX', captchaSendFrequenceSec, function(err, reply) {
      if (err) {
        logger.error(method, 'write frequence limit to redis failed.', err)
        return Promise.reject(internalError)
      }
      if (reply == null) {
        logger.info(method, 'frequence limit not timeout, not send captcha sms')
        const returnError = new Error('短信发送太快了，请稍后再试')
        returnError.status = 403
        return reject(returnError)
      }
      resolve()
    })
  })

  return setFrequence.then(() => {
    // save captcha in redis, expire time 15 minute
    return new Promise((resolve, reject) => {
      const redisKey = `${captchaPrefix}#${mobile}`
      redisClient.set(redisKey, captcha, 'EX', 15 * 60, function(err, reply) {
        if (err) {
          logger.error(method, 'write captcha to redis failed.', err)
          return reject(internalError)
        }
        resolve()
      })
    })
  }).then(() => {
    return sendSmsX({
      tos: [{
        phone: `${mobile}`,// must be string
        vars: {
          '%captcha%': captcha,
        },
      }],
    })
  })
}

function genInternalError() {
  const internalError = new Error('内部错误')
  internalError.status = 500
  return internalError
}

exports.sendCaptchaToPhone = sendCaptchaToPhone

function sendSmsX(params) {
  const method = 'sendSmsX'
  const smsConfig = require('../configs/_standard').sendcloud_sms
  const smsKey = smsConfig.apiKey
  const DEFAYLT_PARAMS = {
    msgType: 0,
    smsUser: smsConfig.apiUser,
    templateId: 7738, // 验证码
  }
  params = Object.assign({}, DEFAYLT_PARAMS, params)
  params.tos = JSON.stringify(params.tos)

  // generate sign
  const paramKeys = Object.keys(params).sort()
  let sign
  let paramsSignStr = ''
  paramKeys.forEach(key => {
    let value = params[key]
    paramsSignStr += `&${key}=${value}`
  })
  paramsSignStr = `${smsKey}${paramsSignStr}&${smsKey}`
  sign = security.md5(paramsSignStr)
  params['signature'] = sign.toUpperCase()

  const options = {
    dataType: 'json',
    contentType: 'json',
    timeout: 1000 * 60,
    method: 'POST',
  }
  let url = smsConfig.apiUrl
  url += `?${utils.toQuerystring(params)}`
  url = encodeURI(url)
  return urllib.request(url, options).then(res => {
    const data = res.data
    let statusCode = data.statusCode
    if (data.statusCode > 300) {
      const message = data.message
      logger.error(method, JSON.stringify(data))
      const err = new Error(message)
      if (statusCode > 500) {
        statusCode = 500
      } else if (statusCode > 400) {
        statusCode = 400
      }
      err.status = statusCode
      throw err
    }
    logger.info(method, 'send sms success', params.tos)
    return data
  })
}

exports.sendSmsX = sendSmsX
