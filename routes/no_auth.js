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
const middlewares = require('../services/middlewares')

module.exports = function (Router) {
  const router = new Router({})

  // Auth
  router.get('/login', authController.login)
  router.get('/logout', authController.logout)
  router.post('/logout', authController.logout)
  router.post('/auth/users/verify', middlewares.verifyUser, authController.verifyUser)
  // Captcha
  router.get('/captcha/gen', authController.generateCaptcha)
  router.get('/captcha/:captcha/verify', authController.checkCaptchaIsCorrect)
  // Notfound
  router.get('/notfound', function* () {
    yield this.render(global.indexHtml, { title: 'Page not found | 时速云', body: '' })
  })

  // License
  router.get('/licenses/merged', licenseController.checkLicense)
  router.post('/licenses', licenseController.addLicense)

  return router.routes()
}