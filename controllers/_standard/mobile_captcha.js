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
const redisClient = createRedisClient()
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
        // const err = new Error('frequence limit not timeout, not send captcha sms')
        // err.status = 400
        // return reject(err)
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
  if (!smsConfig.pwd || !smsConfig.account) {
    logger.error(method, 'get sms service account/pwd failed. please check envionment variables USERPORTAL_IHUYI_ACCOUNT/USERPORTAL_IHUYI_PWD')
    const err = new Error('internal error')
    err.status = 500
    throw err
  }
  const content = `您的验证码是：${captcha}。请不要把验证码泄露给其他人。如非本人操作，可不用理会！`
  const url = `${smsConfig.host}?method=Submit&account=${smsConfig.account}&password=${smsConfig.pwd}&mobile=${mobile}&content=${encodeURI(content)}`
  logger.info(method, `sending captcha to ${mobile} url: ${url}`)
  urllib.request(url, function(err, data, res) {
    logger.info('call sms service', err, data.toString(), res)
    if (err) {
      reject('internal error')
    }
  })

  this.body = {
    data: captcha
  }
}

function createRedisClient() {
  const redis = require("redis")
  const redisConfig = require('../../configs/').redis
  let redisOption = {
    host: redisConfig.host || '192.168.1.124',
    port: redisConfig.port || '6379',
  }
  if (redisConfig.password) {
    redisOption.password = redisConfig.password
  }
  const redisClient = redis.createClient(redisOption)

  redisClient.on("error", function (err) {
      logger.error("redis error " + err);
  });

  return redisClient
}