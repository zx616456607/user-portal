/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */

/**
 * Routes for public cloud
 *
 * v0.1 - 2016-12-13
 * @author Lei
 */

///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////  Router for public cloud service = Standard Mode ///////////////////
//////////////////////  Only login users can access                     ///////////////////
///////////////////////////////////////////////////////////////////////////////////////////
'use strict'

const middlewares = require('../../services/middlewares')
const certificateController = require('../../controllers/_standard/certificate')
const teamController = require('../../controllers/_standard/team')
const userInfoController = require('../../controllers/_standard/user_info')
const paymentsController = require('../../controllers/_standard/payments')
const wechatPayController = require('../../controllers/_standard/payments/wechat_pay')
const alipayController = require('../../controllers/_standard/payments/alipay')
const userPreferenceController = require('../../controllers/_standard/user_preference')
const user3rdAccountCtl = require('../../controllers/_standard/user_3rd_account')

module.exports = function (Router) {
  const router = new Router({
    prefix: '/api/v2'
  })
  router.use(middlewares.auth)

  // Certificate related
  router.get('/certificates', certificateController.listCertificates)
  router.post('/certificates', certificateController.createCertificate)
  router.put('/certificates/:id', certificateController.updateCertificate)

  // team
  router.post('/teams/teamandspace', teamController.createTeamAndSpace)
  router.post('/teams/:teamid/invitations', teamController.createInvitations)
  router.get('/teams/:teamid/dissolvable', teamController.checkDissolvable)
  router.delete('/teams/:teamid', teamController.deleteTeam)
  router.post('/teams/:teamid/quit', teamController.quitTeam)
  router.post('/teams/join', teamController.joinTeam)
  router.get('/teams/:teamid/users/std', teamController.getTeamUsers)
  router.delete('/teams/:teamid/users/:username/std', teamController.removeTeamuser)
  router.delete('/teams/:teamid/invitations/:email', teamController.cancelInvitation)

  // Payment related
  router.post('/payments/wechat_pay', wechatPayController.createPrepayRecord)
  router.get('/payments/wechat_pay/:order_id', wechatPayController.getOrder)
  router.get('/payments/orders/status', paymentsController.getOrderStatusFromSession)
  router.post('/payments/alipay', alipayController.rechare)
  router.get('/payments/alipay/direct', alipayController.direct)

  // Upgrade or renewals
  router.post('/user_preference/edition', userPreferenceController.upgradeOrRenewalsEdition)
  router.get('/user_preference/edition', userPreferenceController.getEdition)

  // Get user account info
  router.get('/myaccount', userInfoController.getMyAccountInfo)
  router.patch('/myaccount', userInfoController.changeUserInfo)

  // 3rd account bind
  router.patch('/users/bind', user3rdAccountCtl.bindAccount)
  router.patch('/users/unbind', user3rdAccountCtl.unbindAccount)

  // Get qiniu upload token
  router.get('/store/token', userInfoController.upTokenToQiniu)
  return router.routes()
}
