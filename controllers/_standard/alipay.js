/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * aplipay controller
 *
 * v0.1 - 2016-12-13
 * @author Yangyubiao
 */

"use strict"

const uuid = require('node-uuid')
const AliPay = require('../../pay/alipay/alipay')
const aliPayConfig = require('../../configs/_standard/alipay_config')

const apiFactory = require('../../services/api_factory')
const logger = require('../../utils/logger.js').getLogger('alipay')

// alipay.on('verify_fail', function() {
//   logger.info('emit verify_fail')
// }).on('trade_finished', function(out_trade_no, trade_no) {
//   logger.info('trade_finished', `out_trade_no:${out_trade_no}`, `, trade_no:${trade_no}`)
// }).on('trade_success', function(out_trade_no, trade_no) {
//   logger.info('trade_success', `out_trade_no:${out_trade_no}, trade_no:${trade_no}`)
// })

//TODO 错误格式标准化

exports.rechare = function* () {
  const method = 'rechare'
  const user = this.session.loginUser
  let paymentAmount = this.request.body.paymentAmount
  const payMethod = this.request.body.payMent
  if(!paymentAmount) {
    logger.info(method, 'paymentAmount is null')
    this.status = 400
    this.body ={
      fail: 'paymentAmount is necessary'
    }
    return
  }
  paymentAmount = parseFloat(paymentAmount)
  if(isNaN(paymentAmount)) {
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
  const orderID = user.id + '-' + uuid.v4()
  const orderName = `[时速云]充值${paymentAmount}元`
  const orderDescription = `${orderName}-${user.user}`
  const data = {
    // 订单描述
    body: orderDescription,

    // 商户网站订单系统中唯一订单号
    out_trade_no: orderID,

    // 商品展示网址
    show_url: 'https://www.tenxcloud.com/price',

    //订单名称
    subject: orderName,

    //订单金额
    total_fee: paymentAmount
  }
  aliPayConfig.extra_common_param = uuid.v4()
  const siginApi = apiFactory.getTenxSysSignSpi(this.session.loginUser)
  const apiResult = yield siginApi.payments.create({
    charge_amount: paymentAmount * 100 ,
    order_type: 101,
    verification_key: aliPayConfig.extra_common_param
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
    const apiResult = yield _requestSignUpdateApi(this.session.loginUser, body)
    this.status = apiResult.statusCode
    this.body = apiResult
  }
  logger.error('alipay sign is not pass verification')
}

exports.direct = function* (){
  const method = 'alipay_direct'
  const query = this.query
  const alipay = new AliPay(aliPayConfig) 
  const isverify = yield alipay.payReturn(query).catch(function(err) { 
    logger.erro(method, err) 
    const error = new Error('internal error')
    err.status = 500
    throw err
  })
  if(isverify) {
    const apiResult = yield _requestSignUpdateApi(this.session.loginUser, query)
    this.status = apiResult.statusCode
    this.body = apiResult
    return
  } 
  logger.error('alipay sign is not pass verification')
  this.status = 401
  this.body = { error: '非法订单'}
}

function  _requestSignUpdateApi (user, data) {
  const num = parseFloat(data.total_fee)
  const siginApi = apiFactory.getTenxSysSignSpi(user)
  return siginApi.payments.update(data.out_trade_no, {
    order_id: data.out_trade_no,
    order_type: 101,
    verification_key: data.extra_common_param,
    charge_amount: num * 100,
    detail: JSON.stringify(data)
  })
}

