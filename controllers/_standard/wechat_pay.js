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
const apiFactory = require('../../services/api_factory')
const wechatConfig = require('../../configs/_standard/wechat_pay')
const wechatPay = require('../../pay/wechat_pay')
const logger = require('../../utils/logger').getLogger('wechat_pay')
const _this = this

/**
 * Create a new prepay record
 */
exports.createPrepayRecord = function* () {
  const method = 'createPrepayRecord'
  // 交易金额默认为人民币交易，接口中参数支付金额单位为【分】，参数值不能带小数。对账单中的交易金额单位为【元】
  const body = this.request.body
  let amount = body.amount
  if (!amount) {
    const err = new Error('amount is needed')
    err.staus = 400
    throw err
  }
  amount = parseInt(amount * 100)
  if (isNaN(amount)) {
    const err = new Error('pay amount illegal')
    err.staus = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const payment = new wechatPay.Payment(_this.getInitConfig())
  try {
    // step1: create a new prepay record by api
    const spi = apiFactory.getTenxSysSignSpi(loginUser)
    const verificationKey = uuid.v4()
    const paymentOrder = {
      charge_amount: amount,
      order_type: 100, // 100 微信，101 支付宝
      verification_key: verificationKey
    }
    const paymentOrderResult = yield spi.payments.create(paymentOrder)
    // step2: get qr code by wechat pay api
    const orderId = paymentOrderResult.data.order_id
    const timestrap = (new Date()).getTime()
    const wechatOrder = {
      body: '[时速云]充值' + (amount / 100) + '元',
      nonce_str: uuid.v4().replace(/-/g, ''),
      attach: verificationKey, // 附加数据，作为 API server 验证的标志
      out_trade_no: paymentOrderResult.data.order_id,
      total_fee: amount,
      spbill_create_ip: this.request.ip,
      trade_type: wechatConfig.trade_type,
      product_id: `tenx_${amount}_${timestrap}` // 商品id
    }
    const qrCodeResult = yield payment.getBrandWCPayRequestParams(wechatOrder)
    const nonceStr = qrCodeResult.nonceStr
    this.session.wechatPayNonceStr = nonceStr
    this.body = {
      codeUrl: qrCodeResult.codeUrl,
      nonceStr,
      orderId,
    }
  } catch (err) {
    throw err
  }
}

exports.getOrder = function* () {
  const method = 'getOrder'
  const nonceStr = this.query.nonce_str
  if (nonceStr !== this.session.wechatPayNonceStr) {
    const err = new Error('request illegal')
    err.status = 403
    throw err
  }
  const loginUser = this.session.loginUser
  const spi = apiFactory.getTenxSysSignSpi(loginUser)
  const orderId = this.params.order_id
  const payment = new wechatPay.Payment(_this.getInitConfig())
  /**
   *{
      "return_code": "SUCCESS",
      "return_msg": "OK",
      "appid": "wx4d07695bf03a7711",
      "mch_id": "1272104401",
      "nonce_str": "EdibrL7dDxztJSoV",
      "sign": "DB5F49D302E760BA4E7CF22FDF82E187",
      "result_code": "SUCCESS",
      "openid": "oDKNMs45ks41CWfawNRz-DcLhC2k",
      "is_subscribe": "Y",
      "trade_type": "NATIVE",
      "bank_type": "CMB_CREDIT",
      "total_fee": "1",
      "fee_type": "CNY",
      "transaction_id": "4007402001201612152877136143",
      "out_trade_no": "20161215092811617578132",
      "attach": "",
      "time_end": "20161215173047",
      "trade_state": "SUCCESS",
      "cash_fee": "1"
    }
   */
  const order = yield payment.orderQuery({ out_trade_no: orderId })
  /**
   * @param {String} trade_state
   * SUCCESS—支付成功
   * REFUND—转入退款
   * NOTPAY—未支付
   * CLOSED—已关闭
   * REVOKED—已撤销（刷卡支付）
   * USERPAYING--用户支付中
   * PAYERROR--支付失败(其他原因，如银行返回失败)
   */
  if (order.return_code === 'SUCCESS' && order.result_code === 'SUCCESS' && order.trade_state === 'SUCCESS') {
    console.log(`order------------------`)
    console.log(order)
    // Validate result
    const error = payment.validateObj(order)
    if (error) {
      this.status = 400
      this.body = {
        message: error.name
      }
      return
    }
    const data = {
      charge_amount: parseInt(order.total_fee),  // 成功支付的金额
      order_type: 100,
      order_id: order.transaction_id, // 支付宝、微信的订单号
      verification_key: order.attach, // 对应请求的key
      detail: JSON.stringify(order),
    }
    const result = yield spi.payments.update(order.out_trade_no, data)
    this.body = result
    return
  }
  this.body = order
}

exports.notify = function* () {
  const method = 'notify'
  const order = this.request.wechat_pay_notify_message
  try {
    if (order.trade_state !== 'SUCCESS') {
      logger.warn(method, `trade_state is ${order.trade_state}`, JSON.stringify(order))
      res.reply('success')
      return
    }
    const loginUser = this.session.loginUser
    const spi = apiFactory.getTenxSysSignSpi(loginUser)
    const data = {
      charge_amount: parseInt(order.total_fee),  // 成功支付的金额
      order_type: 100,
      order_id: order.transaction_id, // 支付宝、微信的订单号
      verification_key: order.attach, // 对应请求的key
      detail: JSON.stringify(order),
    }
    const result = yield spi.payments.update(order.out_trade_no, data)
    this.reply('success')
  } catch (error) {
    throw error
  }
}

exports.getInitConfig = function () {
  return {
    partnerKey: wechatConfig.key,
    appId: wechatConfig.appid,
    mchId: wechatConfig.mch_id,
    notifyUrl: wechatConfig.notify_url
  }
}