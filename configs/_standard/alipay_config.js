/*
* Licensed Materials - Property of tenxcloud.com
* (C) Copyright 2015 TenX Cloud. All Rights Reserved.
*/

/*
 * Configuration file for Alipay
 * v0.1 - 2015-09-06
 * @author Zhangpc
*/

const host = require('./').host
const alipay = {
  //↓↓↓↓↓↓↓↓↓↓请在这里配置您的基本信息↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

  // 合作身份者ID，以2088开头由16位纯数字组成的字符串
  partner: '2088811577082746',

  // 收款支付宝账号
  seller_email: 'huangqg@tenxcloud.com',

  // 交易安全检验码，由数字和字母组成的32位字符串
  key: 'sv3jsl442ozbpogdox6zcvw6fnfa253d',

  sign_type: 'MD5',

  // 域名
  host: host,

  // 访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
  transport: 'https',

  // 支付宝付款成功后返回的页面
  create_direct_pay_by_user_return_url: `${host}/api/v2/payments/alipay/direct`,

  // 支付宝异步通知页面
  create_direct_pay_by_user_notify_url: `${host}/api/v2/payments/alipay/notify`,


  // ca证书路径地址，用于curl中ssl校验 请保证cacert.pem文件在当前文件夹目录中
  cacert:'./sslkey/certificate.pem'

  //↑↑↑↑↑↑↑↑↑↑请在这里配置您的基本信息↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
}

module.exports = alipay
