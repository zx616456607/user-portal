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

module.exports = function (Router) {
  const router = new Router({
    prefix: '/api/v2'
  })
  // Certificate related
  router.get('/certificates', certificateController.listCertificates)
  router.post('/certificates', certificateController.createCertificate)
  router.put('/certificates/:id', certificateController.updateCertificate)
  //alipay
  router.post('/account/pay/alipay', alipayController.rechare)
  router.post('/account/pay/alipay/notify', alipayController.notify)
  router.get('/account/pay/alipay/direct', alipayController.direct)
  return router.routes()
}