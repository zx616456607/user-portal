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
///////////////////////////////////////////////////////////////////////////////////////////
'use strict';

const certificateController = require('../controllers/_standard/certificate')
const alipayController = require('../controllers/_standard/alipay')
const teamController = require('../controllers/_standard/team')
const userInfoController = require('../controllers/_standard/user_info')
const paymentController = require('../controllers/_standard/payment')
const wechatPayController = require('../controllers/_standard/wechat_pay')

module.exports = function (Router) {
  const router = new Router({
    prefix: '/api/v2'
  })
  // Certificate related
  router.get('/certificates', certificateController.listCertificates)
  router.post('/certificates', certificateController.createCertificate)
  router.put('/certificates/:id', certificateController.updateCertificate)
  


  // team
  router.post('/teams/teamandspace', teamController.createTeamAndSpace)
  router.post('/teams/:teamid/invitations', teamController.createInvitations)
  router.get('/teams/:team/dissolvable', teamController.checkDissolvable)
  router.delete('/teams/:team', teamController.deleteTeam)
  router.post('/teams/:team/quit', teamController.quitTeam)
  router.delete('/teams/:team/users/:username', teamController.removeMember)
  router.delete('/teams/:team/invitations/:code', teamController.cancelInvitation)
  router.post('/teams/join', teamController.joinTeam)

  // Payment related
  router.post('/payments', paymentController.createPrepayRecord)
  router.put('/payments/:id', paymentController.completePayment)
  router.post('/pay/wechat', wechatPayController.getQrCodeAndInsertOrder)

  //alipay
  router.post('/payments/alipay', alipayController.rechare)
  router.post('/payments/alipay/notify', alipayController.notify)
  router.get('/payments/alipay/direct', alipayController.direct)
  
  // Get user account info
  router.get('/myaccount', userInfoController.getMyAccountInfo)
  return router.routes()
}