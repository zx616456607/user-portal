/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Payments controller: for Public Cloud Only
 *
 * v0.1 - 2016-12-19
 * @author Zhangpc
*/
'use strict'

exports.getOrderStatusFromSession = function* () {
  const orderId = this.params.order_id
  const status = this.session.payment_status
  if (!status || status.order_id !== orderId) {
    this.body = {
      code: 404
    }
    return
  }
  this.body = status
}