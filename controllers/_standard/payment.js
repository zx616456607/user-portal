/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Payment controller: for Public Cloud Only
 *
 * v0.1 - 2016-12-15
 * @author Lei
*/
'use strict'

const apiFactory = require('../../services/api_factory')
const logger     = require('../../utils/logger.js').getLogger("payment")

/*
Create a new prepay record
*/
exports.createPrepayRecord = function* () {
  const loginUser = this.session.loginUser

  const spi = apiFactory.getSpi(loginUser)
  const payment = this.request.body

  const result = yield spi.payments.create(payment)

  this.body = {
    data: result
  }
}
/*
Update an existing certificate
*/
exports.completePayment = function* () {
  const loginUser = this.session.loginUser
  const paymentId = this.params.id

  const spi = apiFactory.getSpi(loginUser)
  const payment = this.request.body

  const result = yield spi.payments.update(paymentId, payment)

  this.body = {
    data: result
  }
}
