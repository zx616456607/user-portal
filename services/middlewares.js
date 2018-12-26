/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Middlewares for app
 * v0.1 - 2016-11-07
 * @author Zhangpc
 */
'use strict'

const apiFactory = require('./api_factory')
const enterpriseMode = require('../configs/constants').ENTERPRISE_MODE
const logger = require('../utils/logger').getLogger('middlewares')
const constants = require('../constants')
const USER_CURRENT_CONFIG = constants.USER_CURRENT_CONFIG
const NO_CLUSTER_FLAG = constants.NO_CLUSTER_FLAG
const CLUSTER_PAGE = constants.CLUSTER_PAGE
const indexService = require('./')
const _ = require('lodash')
const user3rdAccount = require('./user_3rd_account')
const utils = require('../utils')
const securityUtil = require('../utils/security')
const harbor = require('../controllers/registry_harbor')
const configs = require('../configs/index')
const urllib = require('urllib')

let Wechat
if (process.env.RUNNING_MODE === 'standard') {
  Wechat = require('../3rd_account/wechat')
}

/**
 * Auth user by session
 */
exports.auth = function* (next) {
  const loginUser = this.session.loginUser
  const accept = indexService.accepts.apply(this)
  if (!loginUser || !loginUser.user) {
    let redirectUrl = '/login'
    let requestUrl = this.request.url
    if (requestUrl.indexOf(redirectUrl) < 0 && requestUrl !== '/') {
      // @Todo remove redirect url hash
      redirectUrl += `?redirect=${requestUrl}`
    }
    if (accept === 'html') {
      this.status = 302
      this.redirect(redirectUrl)
      return
    }
    this.status = 401
    this.headers['content-type'] = 'application/json'
    this.body = {
      message: 'LOGIN_EXPIRED'
    }
    return
  }
  // If no clusters, redirect to CLUSTER_PAGE to add cluster
  if (utils.isAdmin(loginUser) && loginUser[NO_CLUSTER_FLAG] === true) {
    if (accept === 'html') {
      const isNoCluster = yield indexService.isNoCluster.apply(this)
      if (isNoCluster) {
        if (this.request.path !== CLUSTER_PAGE) {
          this.status = 302
          this.redirect(CLUSTER_PAGE)
          return
        }
      } else {
        delete this.session.loginUser[NO_CLUSTER_FLAG]
      }
    }
  }
  let teamspace = this.headers.teamspace
  // let onbehalfuser = this.headers.onbehalfuser
  // get teamspace from cookie
  if (typeof teamspace === 'undefined') {
    const currentConfig = this.cookies.get(USER_CURRENT_CONFIG) || ''
    const _teamspace = currentConfig.split(',')[1]
    if (_teamspace && _teamspace !== 'undefined') {
      teamspace = _teamspace
    }
  }
  this.session.loginUser.teamspace = teamspace
  // this.session.loginUser.onbehalfuser = onbehalfuser
  yield next
}

exports.verifyUser = function* (next) {
  const method = 'verifyUser'
  const body = this.request.body || {}
  const accountID = this.session.wechat_account_id
  const data = {}
  let err
  // For wechat login
  if (body.accountType === 'wechat') {
    if (!accountID){
      err = new Error('username(email), password are required.')
      err.status = 400
      throw err
    }
    data.accountType = body.accountType
    data.accountID = accountID
    // Login and bind wechat
    if (body.action === 'bind') {
      const wechat = new Wechat()
      const access_token = yield wechat.initWechat()
      const userInfo = yield wechat.getUserInfo(access_token, accountID)
      data.accountDetail = JSON.stringify(userInfo)
    }
  } else if(body.accountType == 'vsettan' || body.accountType == 'cas' ||
    body.accountType == 'saml2' || body.accountType == 'keycloak') {
    data.accountType = body.accountType
    data.accountID = body.accountID
    data.userName = body.userName
    data.bearerToken = body.bearerToken
  } else if ((!body.username && !body.email) || !body.password) {
    err = new Error('username(email), password are required.')
    err.status = 400
    throw err
  }
  /*if (configIndex.running_mode === enterpriseMode) {
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
  }*/
  if (body.password) {
    data.password = body.password
  }
  if (body.username) {
    data.userName = body.username
  }
  if (body.email) {
    data.email = body.email
  }
  if (body.inviteCode) {
    data.inviteCode = body.inviteCode
  }
  const api = apiFactory.getApi(this.session.loginUser)
  let result = {}
  try {
    result = yield api.users.createBy(['login'], null, data)
    delete this.session.wechat_account_id
  } catch (err) {
    if (body.accountType === 'wechat' && err.statusCode === 404) {
      this.session.wechat_account_id = accountID // add back for bind wechat
    }
    // Better handle error >= 500
    if (err.statusCode >= 500) {
      const returnError = new Error("服务异常，请联系管理员或者稍候重试")
      returnError.status = err.statusCode
      throw returnError
    } else {
      throw err
    }
  }
  // These message(and watchToken etc.) will be save to session
  let registryAuth = Buffer(result.userName + ':' + body.password).toString('base64');
  if (body.accountType === 'vsettan' || body.accountType === 'cas' ||
    body.accountType === 'saml2' || body.accountType == 'keycloak') {
    // Use accountName and accountID for authority checknameIDFormat
    if (body.accountType == 'keycloak') {
      body.accountID = result.apiToken
    }
    registryAuth =  Buffer(result.namespace + ':' + body.accountID).toString('base64');
  }
  const loginUser = {
    user: result.userName,
    id: result.userID,
    namespace: result.namespace,
    email: result.email,
    phone: result.phone,
    token: result.apiToken,
    role: result.role,
    globalRoles: result.globalRoles,
    balance: result.balance,
    // Encrypt base64 password to make it some secure, and save to session
    registryAuth: securityUtil.encryptContent(registryAuth),
    harbor: {},
    openstack:{
      withProject:{},
      withoutProject:{}
    },
    ip: this.request.ip,
    ua: this.headers['user-agent'],
    accountType: body.accountType || 'db-user',
  }
  // get harbor current user for check is harbor admin user
  try {
    const harborCurrentUser = yield harbor.getCurrentUser(loginUser)
    loginUser.harbor = harborCurrentUser || {}
  } catch (error) {
    logger.error(method, error)
  }
  // Add config into user for frontend websocket
  indexService.addConfigsForFrontend(loginUser)
  _.merge(result, loginUser)
  // Private cloud need check users license
  /*if (configIndex.running_mode === enterpriseMode) {
    const licenseObj = yield indexService.getLicense(loginUser)
    if (licenseObj.plain.code === -1) {
      const err = new Error(licenseObj.message)
      err.status = 403
      throw err
    }
  }*/
  // Send template to user wechat
  if (body.accountType === 'wechat') {
    setTimeout(() => {
      user3rdAccount.sendTemplateToWechatLoginUser(loginUser)
    })
  }
  yield indexService.setUserCurrentConfigCookie.apply(this, [loginUser])
  // Delete sensitive information
  // delete result.userID
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
  // If admin login, get all clusters
  if (utils.isAdmin(loginUser)) {
    let k8sApi = apiFactory.getK8sApi(loginUser)
    let clusterList = yield k8sApi.get()
    let clusters = clusterList.clusters || []
    if (clusters.length < 1) {
      result[NO_CLUSTER_FLAG] = true
      // Save to session for redirect when user refresh page
      loginUser[NO_CLUSTER_FLAG] = true
    }
  }
  if (body.IDPClientId) {
    loginUser.IDPClientId = body.IDPClientId
    loginUser.nameIDFormat = body.nameIDFormat
    loginUser.nameID = body.nameID
  }

  this.session.loginUser = loginUser
  this.request.result = result
  yield next
}