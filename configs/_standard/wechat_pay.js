/*
* Licensed Materials - Property of tenxcloud.com
* (C) Copyright 2016 TenX Cloud. All Rights Reserved.
*/

/*
 * Configuration file for Wechat pay
 * v0.1 - 2016-02-16
 * @author Zhangpc
*/

var wecahtPay = {
  production: {
    appid: 'wx4d07695bf03a7711',
    key: '7a90e864bf784372b88a2be02eed5f2d',
    AppSecret: '6b8ce33f07b3f8aac0db43624f08ac10',
    mch_id: '1272104401',
    notify_url: 'https://console.tenxcloud.com/api/pay/wechat_qr_pay_notify',
    trade_type: 'NATIVE'
  },
  staging: {
    appid: 'wx4d07695bf03a7711',
    key: '7a90e864bf784372b88a2be02eed5f2d',
    AppSecret: '6b8ce33f07b3f8aac0db43624f08ac10',
    mch_id: '1272104401',
    notify_url: 'http://builder2.tenxcloud.com/api/pay/wechat_qr_pay_notify',
    trade_type: 'NATIVE'
  },
  developer: {
    appid: 'wx4d07695bf03a7711',
    key: '7a90e864bf784372b88a2be02eed5f2d',
    AppSecret: '6b8ce33f07b3f8aac0db43624f08ac10',
    mch_id: '1272104401',
    notify_url: 'http://builder2.tenxcloud.com/api/pay/wechat_qr_pay_notify',
    trade_type: 'NATIVE'
  }
}

module.exports = wecahtPay.developer