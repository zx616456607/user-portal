/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * No auth route
 *
 * v0.1 - 2016-11-16
 * @author Zhangpc
*/
'use strict'

const authController = require('../controllers/auth')
const licenseController = require('../controllers/license')
const adminController = require('../controllers/admin')
const middlewares = require('../services/middlewares')
const alertController = require('../controllers/alert')
const oemController = require('../controllers/oem_info')
const globalConfigController = require('../controllers/global_config')
const userController = require('../controllers/user_manage')
const emailApprovalController = require('../controllers/emailApproval')
const indexCtl = require('../controllers')

module.exports = function (Router) {
  const router = new Router({})

  // Auth
  router.get('/login', authController.login, indexCtl.index)
  router.get('/logout', authController.logout)
  router.post('/logout', authController.logout)
  router.post('/auth/users/verify', middlewares.verifyUser, authController.verifyUser)
  // Captcha
  router.get('/captcha/gen', authController.generateCaptcha)
  router.get('/captcha/:captcha/verify', authController.checkCaptchaIsCorrect)
  // Notfound
  router.get('/notfound', function* (next) {
    this.title = 'Page not found'
    yield next
  }, indexCtl.index)

  // email-approval
  router.get('/email/email_Approval', indexCtl.index)
  router.get('/api/v2/devops/emailapproval/:stageId/:stageBuildId/status', emailApprovalController.getEmailApprovalStatus)
  router.post('/api/v2/devops/emailapproval/:stageId/:stageBuildId/:type', emailApprovalController.updateEmailApprovalStatus)

  // oem info
  router.get('/oem/info', oemController.getOEMInfo)

  // License
  router.get('/api/v2/licenses/merged', licenseController.checkLicense)
  router.post('/api/v2/licenses', licenseController.addLicense)
  router.get('/api/v2/licenses/platform', licenseController.getPlatformID)

  // Admin
  router.get('/api/v2/admin/ispwset', adminController.isPasswordSet)
  router.patch('/api/v2/admin/setpw', adminController.SetPassword)

  // alert
  router.get('/email/invitations/join', function* (){
    yield this.render(global.indexHtml, { title: '', body: '' })
  })

  router.get('/email/invitations/join-code', alertController.acceptInvitation)
  // router.get('/alerts/invitations/join-code', alertController.acceptInvitation)
  router.patch(`/api/v2/users/resetpw`, userController.resetPassword)

  return router.routes()
}