/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * User 3rd account
 * v0.1 - 2017-03-04
 * @author Zhangpc
 */

const moment = require('moment')
const apiFactory = require('./api_factory')
const wechatApi = require('../3rd_account/wechat')
const constants = require('../constants')
const wechat = new wechatApi()

exports.sendTemplateToWechatLoginUser = function (user) {
  const TEMPLATE_ID = 'ZbvwDgYXkdImQlThudqfQxP8bvf5pfdqHOBlEgZ5Q3s'
  const color = '#173177'
  const api = apiFactory.getApi(user)
  const userID = user.id
  const reqArray = []
  // Get user 3rd accounts
  reqArray.push(api.users.getBy([userID, 'bindings']))
  // Get Wechat access_token
  reqArray.push(wechat.initWechat())
  Promise.all(reqArray).then(results => {
    const user3rdAccounts = results[0]
    const access_token = results[1]
    let openid
    try {
      user3rdAccounts.every(account => {
        if (account.accountType === 'wechat') {
          account.accountDetail = JSON.parse(account.accountDetail)
          openid = account.accountDetail.openid
          return false
        }
        return true
      })
    } catch (error) {
      //
    }
    if (!openid) {
      console.log(`openid not found.`)
      return
    }
    const balance = (user.balance / constants.AMOUNT_CONVERSION) * 100 / 100
    const data = {
      first: {
        value: '登录成功提醒（通过微信扫描登录操作）',
        color
      },
      keyword1: {
        value: user.user,
        color
      },
      keyword2: {
        value: '时速云 | 公有云',
        color
      },
      keyword3: {
        value: moment().format('YYYY-MM-DD hh:mm'),
        color
      },
      remark: {
        value: `帐号余额：${balance}元\n【客服电话：400-626-1876 | 控制台右下角工单】`
      },
    }
    wechat.sendTemplate(access_token, openid, TEMPLATE_ID, data)
  })
}