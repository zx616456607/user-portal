/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * aplipay controller
 *
 * v0.1 - 2016-12-13
 * @author Yangyubiao
 */

'use strict'

const uuid = require('node-uuid')
const _ = require('lodash')
const AliPay = require('../../../pay/alipay/alipay')
const aliPayConfig = require('../../../configs/_standard/alipay_config')

const apiFactory = require('../../../services/api_factory')
const logger = require('../../../utils/logger.js').getLogger('alipay')
const payments = require('./')

// alipay.on('verify_fail', function() {
//   logger.info('emit verify_fail')
// }).on('trade_finished', function(out_trade_no, trade_no) {
//   logger.info('trade_finished', `out_trade_no:${out_trade_no}`, `, trade_no:${trade_no}`)
// }).on('trade_success', function(out_trade_no, trade_no) {
//   logger.info('trade_success', `out_trade_no:${out_trade_no}, trade_no:${trade_no}`)
// })


exports.rechare = function* () {
  const method = 'rechare'
  delete this.session.payment_status
  const user = _.cloneDeep(this.session.loginUser)
  const body = this.request.body
  let paymentAmount = body.paymentAmount
  const teamspace = body.teamspace
  if (teamspace) user.teamspace = teamspace // switch to the space which will be charged
  if (!paymentAmount) {
    const error = new Error('paymentAmount is necessary')
    error.status = 400
    throw error
  }
  paymentAmount = parseFloat(paymentAmount)
  if (isNaN(paymentAmount)) {
    logger.info(method, 'paymentAmount is NaN')
    const error = new Error('paymentAmout is Nan')
    error.status = 400
    throw error
  }
  // if(paymentAmount < 5) {
  //   const error = new Error('paymentAmout must be greater than 5')
  //   error.status = 400
  //   logger.info('paymentAmout < 5 ')
  //   throw error
  // }
  const dateNow = new Date()
  const orderName = `[时速云]充值${paymentAmount}元`
  const orderDescription = `${orderName}-${user.user}`
  const data = {
    // 订单描述
    body: orderDescription,

    // 商户网站订单系统中唯一订单号
    out_trade_no: '',

    // 商品展示网址
    show_url: 'https://www.tenxcloud.com/price',

    //订单名称
    subject: orderName,

    //订单金额
    total_fee: paymentAmount
  }
  aliPayConfig.extra_common_param = uuid.v4()
  const siginApi = apiFactory.getTenxSysSignSpi(user)
  const apiResult = yield siginApi.payments.create({
    charge_amount: paymentAmount * 100,
    order_type: 101,
    verification_key: aliPayConfig.extra_common_param,
    upgrade: parseInt(body.upgrade),
    duration: parseInt(body.duration),
  })
  data.out_trade_no = apiResult.data.order_id
  const alipay = new AliPay(aliPayConfig)
  this.status = 200
  this.body = alipay.createDirectPayByUser(data)
}

exports.notify = function* () {
  const alipay = new AliPay(aliPayConfig)
  const body = this.request.body
  const method = 'notify'
  const isverify = yield alipay.payReturn(body).catch(err => {
    logger.error(method, err)
    const error = new Error('internal error')
    error.status = 500
    throw error
  })
  if (isverify) {
    const apiResult = yield _requestSignUpdateApi(null, body)
    this.status = apiResult.statusCode
    this.body = apiResult
    return
  }
  logger.error('alipay sign is not pass verification')
  this.status = 401
  this.body = {
    statusCode: 401,
    message: '非法订单'
  }
}

exports.direct = function* () {
  const method = 'alipay_direct'
  const query = this.query
  const alipay = new AliPay(aliPayConfig)
  const isverify = yield alipay.payReturn(query).catch(function (err) {
    logger.erro(method, err)
    const error = new Error('internal error')
    err.status = 500
    throw err
  })
  const loginUser = this.session.loginUser
  if (isverify) {
    const data = yield _requestSignUpdateApi(loginUser, query)
    this.session.payment_status = data
    this.redirect(`/account/balance/payment?order_id=${data.order_id}`)
    return
  }
  logger.error('alipay sign is not pass verification')
  this.status = 401
  this.body = { statusCode: 401, message: '非法订单' }
}

function _requestSignUpdateApi(user, data) {
  const num = parseFloat(data.total_fee)
  const order = {
    order_id: data.out_trade_no,
    order_type: 101,
    verification_key: data.extra_common_param,
    charge_amount: num * 100,
    detail: JSON.stringify(data)
  }
  // Async notification has no loginUser, so here do not use loginUser by api server support
  const siginApi = apiFactory.getTenxSysSignSpi()
  return siginApi.payments.update(data.out_trade_no, order).then(result => {
    const resultData = result.data
    resultData.method = 'alipay'
    resultData.charge_amount = order.charge_amount
    // Send pay success email
    let email
    if (user) email = user.email
    payments.sendPaySuccessEmail(email, 101, order.charge_amount, resultData)
    return resultData
  })
}