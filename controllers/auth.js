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
const enterpriseMode = require('../configs/constants').ENTERPRISE_MODE
const emailUtil = require("../utils/email")
const security = require("../utils/security")
const cas = require('../3rd_account/cas')
const saml2 = require('../3rd_account/saml2')

const isCasMode = !!process.env.CAS_SSO_BASE
const isSAML2Mode = !!process.env.SAML2_SSO_BASE

exports.login = function* () {
  let method = 'login'
  let title = this.t('common:login')
  const oemInfo = global.globalConfig.oemInfo || {}
  const productName = oemInfo.company && oemInfo.company.productName
  if (productName) {
    title = title + ' | ' + productName
  }

  // cas mode
  if (isCasMode) {
    return this.redirect('/cas/login')
  }

  if (this.session.loginUser && this.session.loginUser.user) {
    this.status = 302
    let redirect = this.query.redirect
    if (redirect) {
      this.redirect(redirect)
      return
    }
    this.redirect('/')
    return
  }

  // SAML2
  if (isSAML2Mode) {
    return this.redirect('/saml2/login')
  }

  yield this.render(global.indexHtml, { title, body: '' })
}

exports.logout = function* () {
  if (isSAML2Mode) {
    return yield saml2.logoutRedirect.apply(this)
  }

  delete this.session.loginUser
  this.session = null

  // cas mode
  if (isCasMode) {
    return cas.casLogout.apply(this)
  }

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
  VerifyUser move to services/middlewares.js as a middleware
*/
exports.verifyUser = function* () {
  const method = 'verifyUser'
  const result = this.request.result
  // public cloud need check users active status
  if (config.running_mode !== enterpriseMode) {
    // 0: inactive, 1: actived
    if (result.active === 0) {
      delete this.session.loginUser
      this.status = 401
      this.body = {
        statusCode: 401,
        email: result.email,
        message: 'NOT_ACTIVE',
        // encrypt email as code params to avoid attack, before resend activation email must check email and code
        code: security.encryptContent(result.email),
      }
      return
    }
  }
  delete result.active
  this.body = {
    user: result,
    message: 'login success',
  }
}

/**
 * VerifyUser and join team
 * `verifyUser move to services/middlewares.js as a middleware`
 */
exports.verifyUserAndJoinTeam = function* () {
  const method = 'verifyUserAndJoinTeam'
  const body = this.request.body
  const result = this.request.result
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  // join team
  const joinTeamBody = {
    code: body.invitationCode
  }
  yield spi.teams.createBy(['join'], null, joinTeamBody)

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

exports.getEmailApproval = function* () {
  let method = 'emailApproval'
  let title = this.t('邮件审批')
  const oemInfo = global.globalConfig.oemInfo || {}
  const productName = oemInfo.company && oemInfo.company.productName
  if (productName) {
    title = title + ' | ' + productName
  }
  yield this.render(global.indexHtml, { title, body: '' })
}
