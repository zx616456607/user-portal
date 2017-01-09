/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */

/**
 * Routes for public cloud
 *
 * v0.1 - 2016-12-16
 * @author Zhangpc
 */
'use strict'

///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////  Router for public cloud service = Standard Mode ///////////////////
//////////////////////  Users who are not logged in are also accessible ///////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// 如果是显示在浏览器地址的URL，请不要添加"/api/v2"这样的前缀。其他的API请添加前缀，方便维护/升级

const indexCtl = require('../../controllers')
const teamController = require('../../controllers/_standard/team')
const alipayController = require('../../controllers/_standard/payments/alipay')
const wechatPayController = require('../../controllers/_standard/payments/wechat_pay')
const userController = require('../../controllers/_standard/user_info')
const authController = require('../../controllers/auth')
const wechatPayMiddleware = require('../../pay/wechat_pay').middleware
const middlewares = require('../../services/middlewares')
const API_URL_PREFIX = '/api/v2'

module.exports = function (Router) {
  const router = new Router({})

  // Invite
  router.get('/teams/invite', indexCtl.index)
  router.get(`${API_URL_PREFIX}/teams/invitations`, teamController.getInvitationInfo)

  //Regiser User
  router.post(`${API_URL_PREFIX}/stdusers`, userController.registerUser) // not open register
  router.post(`${API_URL_PREFIX}/stdusers/jointeam`, userController.registerUserAndJoinTeam)
  router.post(`${API_URL_PREFIX}/stdusers/captchas`, userController.sendCaptcha)
  router.post(`${API_URL_PREFIX}/stdusers/activationemail`, userController.sendUserActivationEmail)
  router.get(`/users/activation`, userController.activateUserByEmail)

  // login and jointeam
  router.post(`${API_URL_PREFIX}/stdusers/loginAndJointeam`, middlewares.verifyUser, authController.verifyUserAndJoinTeam)

  // Reset password
  router.put(`${API_URL_PREFIX}/users/:email/resetpwlink`, userController.sendResetPasswordLink)
  router.patch(`${API_URL_PREFIX}/users/resetpw`, userController.resetPassword)

  // Payment
  router.post(`${API_URL_PREFIX}/payments/alipay/notify`, alipayController.notify)
  router.post(
    `${API_URL_PREFIX}/payments/wechat_pay/notify`,
    wechatPayMiddleware(wechatPayController.getInitConfig()).getNotify().done(),
    wechatPayController.notify
  )

  //register
  router.get('/signup', indexCtl.index) // not open register

  //resetpassword
  router.get('/rpw', indexCtl.index)

  return router.routes()
}