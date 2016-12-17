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
'use strict';

const middlewares = require('../../services/middlewares')
const certificateController = require('../../controllers/_standard/certificate')
const alipayController = require('../../controllers/_standard/alipay')
const teamController = require('../../controllers/_standard/team')
const userInfoController = require('../../controllers/_standard/user_info')
const wechatPayController = require('../../controllers/_standard/wechat_pay')

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
  router.delete('/teams/:teamid/users/:username', teamController.removeMember)
  router.delete('/teams/:teamid/invitations/:code', teamController.cancelInvitation)
  router.post('/teams/join', teamController.joinTeam)
  router.get('/teams/:teamid/users/std', teamController.getTeamUsers)
  router.delete('/teams/:teamid/users/:username/std', teamController.removeTeamuser)
  router.delete('/teams/:teamid/invitations/:email', teamController.cancelInvitation)

  // Payment related
  router.post('/payments/wechat_pay', wechatPayController.createPrepayRecord)
  router.get('/payments/wechat_pay/:order_id', wechatPayController.getOrder)

  //alipay
  router.post('/payments/alipay', alipayController.rechare)
  router.get('/payments/alipay/direct', alipayController.direct)

  // Get user account info
  router.get('/myaccount', userInfoController.getMyAccountInfo)

  // Get qiniu upload token
  router.get('/store/token', userInfoController.upTokenToQiniu)
  return router.routes()
}