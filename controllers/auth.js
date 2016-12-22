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
const indexService = require('../services')
const config = require('../configs')
const devOps = require("../configs/devops")
const enterpriseMode = require('../configs/constants').ENTERPRISE_MODE
const emailUtil = require("../utils/email")
const security = require("../utils/security")

exports.login = function* () {
  let method = 'login'
  let title = `${this.t('common:login')} | ${this.t('common:tenxcloud')}`

  if (this.session.loginUser) {
    this.status = 302
    this.redirect('/')
    return
  }
  yield this.render(global.indexHtml, { title, body: '' })
}

exports.logout = function* () {
  delete this.session.loginUser
  this.session = null
  if (this.method === 'GET') {
    this.status = 302
    this.redirect('/login')
    return
  }
  this.body = {
    message: 'login out success.'
  }
}

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
  if (!body || (!body.username && !body.email) || !body.password) {
    const err = new Error('username(email), password and captcha are required.')
    err.status = 400
    throw err
  }
  if (config.running_mode === enterpriseMode) {
    if (!body.captcha) {
      const err = new Error('username(email), password and captcha are required.')
      err.status = 400
      throw err
    }
    body.captcha = body.captcha.toLowerCase()
    if (body.captcha !== this.session.captcha) {
      logger.error(method, `captcha error: ${body.captcha} | ${this.session.captcha}(session)`)
      const err = new Error('CAPTCHA_ERROR')
      err.status = 400
      throw err
    }
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
  // These message(and watchToken etc.) will be save to session
  const loginUser = {
    user: result.userName,
    id: result.userID,
    namespace: result.namespace,
    email: result.email,
    phone: result.phone,
    token: result.apiToken,
    role: result.role,
    balance: result.balance,
    tenxApi: config.tenx_api,
    cicdApi: devOps
  }
  result.tenxApi = loginUser.tenxApi
  result.cicdApi = loginUser.cicdApi
  const licenseObj = yield indexService.getLicense(loginUser)
  if (licenseObj.plain.code === -1) {
    const err = new Error(licenseObj.message)
    err.status = 403
    throw err
  }
  yield indexService.setUserCurrentConfigCookie.apply(this, [loginUser])
  // Delete sensitive information
  delete result.userID
  delete result.statusCode
  delete result.apiToken
  // Get user MD5 encrypted watch token
  try {
    const spi = apiFactory.getSpi(loginUser)
    const watchToken = yield spi.watch.getBy(['token'])
    result.watchToken = watchToken.data
    loginUser.watchToken = watchToken.data
  } catch (err) {
    logger.error(`Get user MD5 encrypted watch token failed.`)
    logger.error(err.stack)
  }
  // public cloud need check users active status
  if (config.running_mode !== enterpriseMode) {
    // 0: inactive, 1: actived
    if (result.active === 0) {
      this.status = 401
      this.body = {
        email: result.email,
        emailLink: emailUtil.getLoginURL(result.email),
        message: 'NOT_ACTIVE',
      }
      // encrypt email as code params to avoid attack, before resend activation email must check email and code
      this.body.code = security.encryptContent(result.email)
      return
    }
  }
  this.session.loginUser = loginUser
  delete result.active
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
  const captcha = this.params.captcha.toLowerCase()
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