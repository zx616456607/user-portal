/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * aplipay controller
 *
 * v0.1 - 2016-12-13
 * @author Yangyubiao
 */
const uuid = require('uuid')
const AliPay = require('../pay/alipay/customer')
const aliPayConfig = require('../configs/alipay_config')
const alipay = new AliPay(aliPayConfig)
const apiFactory = require('../services/api_factory')
const logger = require('../utils/logger.js').getLogger('alipay')

alipay.on('verify_fail', function() {
  logger.info('emit verify_fail')
}).on('trade_finished', function(out_trade_no, trade_no) {
  logger.info('trade_finished', `out_trade_no:${out_trade_no}`, `, trade_no:${trade_no}`)
}).on('trade_success', function(out_trade_no, trade_no) {
  logger.info('trade_success', `out_trade_no:${out_trade_no}, trade_no:${trade_no}`)
})

exports.rechare = function* () {
  const user = this.session.loginUser
  let paymentAmout = this.request.body.paymentAmount;
  const payMethod = this.request.body.payMent
  if(!paymentAmout) {

  }
  paymentAmount = parseFloat(paymentAmout)
  if(isNaN(paymentAmout)) {
    logger.info('paymentAmount is NaN')
    const error = new Error('paymentAmout is Nan')
    error.status = 400
    throw error
  }
  if(paymentAmount < 5) {
    const error = new Error('paymentAmout must be greater than 5')
    error.status = 400
    logger.info('paymentAmout < 5 ')
    throw error
  }
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
  this.status = 200
  const test = alipay.createDirectPayByUser(data)
  console.log(test)
  this.body  = test

}

exports.notify = function* () {
  const isverify = yield alipay.payReturn(this.body)
  if (isverify) {
    console.log(this.body)
  }
  logger.error('alipay sign is not pass verification')
}

exports.direct = function* (){
  console.log(this.query)
  const isverify = yield alipay.payReturn(this.query).catch(function(err) {
    console.log(err)
  })
  if(isverify) {
    console.log(this.query)
    console.log(isverify)
    this.status = 200
    this.body = {success: 'success'}
    return
  } 
  logger.error('alipay sign is not pass verification')
  this.status = 401
  this.body = { error: '非法订单'}
}