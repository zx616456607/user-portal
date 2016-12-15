/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Wechat pay controller: for Public Cloud Only
 *
 * v0.1 - 2016-12-14
 * @author Zhangpc
*/
'use strict'

const uuid = require('node-uuid')
const wechatConfig = require('../../configs/_standard/wechat_pay')
const wechatPay = require('../../pay/wechat_pay')
const logger = require('../../utils/logger').getLogger('wechat_pay')
const _this = this

// get the qr code and instert the order detail to db by api
exports.getQrCodeAndInsertOrder = function* () {
  // amount, user, createIP, callback
  const method = 'getQrCodeAndInsertOrder'
  // 交易金额默认为人民币交易，接口中参数支付金额单位为【分】，参数值不能带小数。对账单中的交易金额单位为【元】
  const body = this.request.body
  let amount = body.amount
  if (!amount) {
    const err = new Error('amount is needed')
    throw err
  }
  amount = parseInt(amount * 100)
  if (isNaN(amount)) {
    const err = new Error('pay amount illegal')
    throw err
  }
  const orderId = (new Date()).getTime()
  const order = {
    body: '[时速云]充值' + (amount / 100) + '元',
    attach: uuid.v4(), // 附加数据，作为 API server 验证的标志
    out_trade_no: orderId,
    total_fee: amount,
    spbill_create_ip: this.request.ip,
    trade_type: wechatConfig.trade_type,
    product_id: 'tenxcloud_charge'
  }
  const payment = new wechatPay.Payment(_this.getInitConfig())
  try {
    // step1: get qr code by wechat pay api
    const result = yield payment.getBrandWCPayRequestParams(order)
    // step2: insert order to db by api
    // @Todo
    this.body = result
  } catch (err) {
    console.log(`catch error ~~~~~`)
    throw err
  }
}

exports.queryOrder = function* () {
  const method = 'orderQuery'
  const orderId = this.query.orderId
  const payment = new wechatPay.Payment(_this.getInitConfig())
  const result = yield payment.orderQuery({ out_trade_no: orderId })
  this.body = result
}

exports.getInitConfig = function () {
  return {
    partnerKey: wechatConfig.key,
    appId: wechatConfig.appid,
    mchId: wechatConfig.mch_id,
    notifyUrl: wechatConfig.notify_url
  }
}