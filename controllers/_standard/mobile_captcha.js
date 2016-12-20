/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Certificate controller: for Public Cloud Only
 *
 * v0.1 - 2016-12-14
 * @author mengyuan
*/
'use strict'
const apiFactory = require('../../services/api_factory')
const constants = require('../../constants/')
const logger = require('../../utils/logger').getLogger('mobileCaptcha')
const urllib = require('urllib')
const redisClient = require('../../utils/redis').client
const md5 = require('md5')
const redisKeyPrefix = {
  captcha: 'regist_captcha',
  frequenceLimit: 'regist_send_captcha_frequence',
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