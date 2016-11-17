/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Auth controller
 *
 * v0.1 - 2016-11-16
 * @author Zhangpc
*/
'use strict'
const apiFactory = require('../services/api_factory')
const logger = require('../utils/logger').getLogger('controllers/auth')
const svgCaptcha = require('svg-captcha')

/* Login success return
  {
    "userID": 104,
    "userName": "zhangpc",
    "namespace": "zhangpc",
    "displayName": "zhangpc",
    "email": "zhangpc@tenxcloud.com",
    "phone": "18605955651",
    "creationTime": "2016-11-07T10:29:47+08:00",
    "apiToken": "jgokzgfitsewtmbpxsbhtggabvrnktepuzohnssqjnsirtot",
    "role": 0,
    "balance": 0,
    "teamCount": 0,
    "statusCode": 200
  }
*/
exports.verifyUser = function* () {
  const method = 'verifyUser'
  const body = this.request.body
  if (!body || (!body.username && !body.email) || !body.password || !body.captcha) {
    const err = new Error('username(email), password and captcha are required.')
    err.status = 400
    throw err
  }
  if (body.captcha !== this.session.captcha) {
    logger.error(method, `captcha error: ${body.captcha} | ${this.session.captcha}(session)`)
    const err = new Error('CAPTCHA_ERROR')
    err.status = 400
    throw err
  }
  const data = {
    password: body.password,
  }
  if (body.username) {
    data.userName = body.username
  }
  if (body.email) {
    data.email = body.email
  }
  const api = apiFactory.getApi()
  const result = yield api.users.createBy(['login'], null, data)
  this.session.loginUser = {
    user: result.userName,
    id: result.userID,
    namespace: result.namespace,
    email: result.email,
    phone: result.phone,
    token: result.apiToken,
    role: result.role,
    balance: result.balance,
  }
  delete result.userID
  delete result.statusCode
  this.body = {
    user: result,
    message: 'login success',
  }
}

exports.generateCaptcha = function* () {
  let text = svgCaptcha.randomText()
  let captcha = svgCaptcha(text)
  this.session.captcha = text.toLowerCase()
  this.status = 200
  this.set('Content-Type', 'image/svg+xml')
  this.body = captcha
}

exports.checkCaptchaIsCorrect = function* () {
  const captcha = this.params.captcha
  if (captcha !== this.session.captcha) {
    this.body = {
      correct: false,
    }
    return
  }
  this.body = {
    correct: true,
  }
}