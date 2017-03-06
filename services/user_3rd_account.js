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
const constants = require('../constants')
const logger = require('../utils/logger').getLogger('services/user_3rd_account')

exports.sendTemplateToWechatLoginUser = function (user) {
  const wechatApi = require('../3rd_account/wechat')
  const wechat = new wechatApi()
  const method = 'sendTemplateToWechatLoginUser'
  const TEMPLATE_ID = 'IgjIeRv2j-ApC5CN9dPGxoh5toMToPhHhXkwvQeqesg'
  const color = '#586C95'
  const api = apiFactory.getApi(user)
  const userID = user.id
  const reqArray = []
  // Get user 3rd accounts
  reqArray.push(api.users.getBy([userID, 'bindings']))
  // Get wechat access_token
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
      // Catch error here
      logger.error(method, error.stack)
    }
    if (!openid) {
      logger.warn(method, `get wechat user openid failed`)
      return
    }
    const balance = (user.balance / constants.AMOUNT_CONVERSION) * 100 / 100
    const data = {
      first: {
        value: `您好，您已在「时速云 | 公有云」成功登录\n`,
      },
      keyword1: {
        value: user.user,
        color
      },
      keyword2: {
        value: moment().format('YYYY-MM-DD hh:mm:ss'),
      },
      remark: {
        value: `账号余额：${balance}元\n\n[客服电话：400-626-1876 | 控制台右下角工单]`
      },
    }
    wechat.sendTemplate(access_token, openid, TEMPLATE_ID, data)
  })
}