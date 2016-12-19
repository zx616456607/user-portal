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

const indexCtl = require('../../controllers') 
const teamController = require('../../controllers/_standard/team')
const userController = require('../../controllers/_standard/user_info')
const alipayController = require('../../controllers/_standard/alipay')
const wechatPayController = require('../../controllers/_standard/wechat_pay')
const wechatPayMiddleware = require('../../pay/wechat_pay').middleware
const API_URL_PREFIX = '/api/v2'

module.exports = function (Router) {
  const router = new Router({})

  // Invite
  router.get('/teams/invite', indexCtl.index)
  router.get('/teams/invitations/:code', teamController.getInvitationInfo)

  //Regiser User
  router.post(`${API_URL_PREFIX}/stdusers`, userController.registerUser)
  router.post(`${API_URL_PREFIX}/stdusers/jointeam`, userController.registerUserAndJoinTeam)

  // Payment
  router.post('/payments/alipay/notify', alipayController.notify)
  router.post(
    '/payments/wechat_pay/notify',
    wechatPayMiddleware(wechatPayController.getInitConfig()).getNotify().done(),
    wechatPayController.notify
  )

  return router.routes()
}