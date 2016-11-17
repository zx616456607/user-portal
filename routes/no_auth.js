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
const indexCtl = require('../controllers')

module.exports = function (Router) {
  const router = new Router({})

  // Auth
  router.get('/login', authController.login)
  router.get('/logout', authController.logout)
  router.post('/logout', authController.logout)
  router.post('/auth/users/verify', authController.verifyUser)
  // Captcha
  router.get('/captcha/gen', authController.generateCaptcha)
  router.get('/captcha/:captcha/verify', authController.checkCaptchaIsCorrect)

  return router.routes()
}