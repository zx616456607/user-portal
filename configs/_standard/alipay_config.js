/*
* Licensed Materials - Property of tenxcloud.com
* (C) Copyright 2015 TenX Cloud. All Rights Reserved.
*/

/*
 * Configuration file for Alipay
 * v0.1 - 2015-09-06
 * @author Zhangpc
*/

var config = require('./index');
var alipay = {
  production: {
    // partner:'' //合作身份者id，以2088开头的16位纯数字
    // ,key:''//安全检验码，以数字和字母组成的32位字符
    // ,sellerEmail:'' //卖家支付宝帐户 必填
    // ,host:'http://localhost:3000/'
    // ,cacert:'cacert.pem'//ca证书路径地址，用于curl中ssl校验
    // ,transport:'http' //访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
    // ,input_charset:'utf-8'//字符编码格式 目前支持 gbk 或 utf-8

    //↓↓↓↓↓↓↓↓↓↓请在这里配置您的基本信息↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

    // 合作身份者ID，以2088开头由16位纯数字组成的字符串
    partner : '2088811577082746',

    // 收款支付宝账号
    seller_email : 'huangqg@tenxcloud.com',

    // 交易安全检验码，由数字和字母组成的32位字符串
    key : 'sv3jsl442ozbpogdox6zcvw6fnfa253d',

    sign_type:'MD5',
    // host : 'http://localhost:3001/',
    // create_direct_pay_by_user_return_url : 'http://localhost:3001/account/pay/directpay_return',


    //域名
    host:'https://www.tenxcloud.com/',

    // 访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
    transport:'https',

    // 支付宝付款成功后返回的页面
    create_direct_pay_by_user_return_url:'https://console.tenxcloud.com/api/v2/payments/alipay/direct',

    // 支付宝异步通知页面
    create_direct_pay_by_user_notify_url: 'https://console.tenxcloud.com/api/v2/payments/alipay/notify',


    // ca证书路径地址，用于curl中ssl校验 请保证cacert.pem文件在当前文件夹目录中
    cacert:'./sslkey/certificate.pem'

    //↑↑↑↑↑↑↑↑↑↑请在这里配置您的基本信息↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
  },
  staging: {

    // 合作身份者ID，以2088开头由16位纯数字组成的字符串
    partner : '2088811577082746',

    // 收款支付宝账号
    seller_email : 'huangqg@tenxcloud.com',

    // 交易安全检验码，由数字和字母组成的32位字符串
    key : 'sv3jsl442ozbpogdox6zcvw6fnfa253d',

    sign_type:'MD5',

    //域名
    host:'http://localhost:8000/',

    // 访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
    transport:'https',

    // 支付宝付款成功后返回的页面
    create_direct_pay_by_user_return_url: 'http://localhost:8000/api/v2/payments/alipay/direct',

    // 支付宝异步通知页面
    create_direct_pay_by_user_notify_url: 'http://localhost:8000/api/v2/payments/alipay/notify',

    // ca证书路径地址，用于curl中ssl校验 请保证cacert.pem文件在当前文件夹目录中
    cacert:'./sslkey/certificate.pem'
  },
  developer: {

    // 合作身份者ID，以2088开头由16位纯数字组成的字符串
    partner : '2088811577082746',

    // 收款支付宝账号
    seller_email : 'huangqg@tenxcloud.com',

    // 交易安全检验码，由数字和字母组成的32位字符串
    key : 'sv3jsl442ozbpogdox6zcvw6fnfa253d',

    sign_type:'MD5',

    //域名
    host:'http://localhost:8003/',

    // 访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
    transport:'https',

    // 支付宝付款成功后返回的页面
    create_direct_pay_by_user_return_url: 'http://localhost:8003/api/v2/payments/alipay/direct',

    // 支付宝异步通知页面
    create_direct_pay_by_user_notify_url: 'http://localhost:8003/api/v2/payments/alipay/notify',

    // ca证书路径地址，用于curl中ssl校验 请保证cacert.pem文件在当前文件夹目录中
    cacert:'./sslkey/certificate.pem'
  }
};

if (config.production === true) {
  module.exports = alipay.production;
} else if (config.staging === true) {
  module.exports = alipay.staging;
} else {
  module.exports = alipay.developer;
}
