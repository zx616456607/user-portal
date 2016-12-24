
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Payments controller: for Public Cloud Only
 *
 * v0.1 - 2016-12-19
 * @author Zhangpc
*/
'use strict'

const apiFactory = require('../../../services/api_factory')
const emailUtils = require('../../../utils/email')
const logger = require('../../../utils/logger').getLogger('payments')
const stdConfigs = require('../../../configs/_standard')

exports.getOrderStatusFromSession = function* () {
  const status = this.session.payment_status
  if (!status) {
    this.body = {
      code: 404
    }
    return
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  try {
    const teamId = status.team_id
    const spaceId = status.space_id
    if (teamId && spaceId) {
      let balance = yield api.teams.getBy([teamId, 'spaces', spaceId, 'balance'])
      status.newBalance = balance.balance
    } else {
      let userDetail = yield api.users.getBy([loginUser.id])
      status.newBalance = userDetail.balance
    }
  } catch (error) {
    // Use the new balance of order
  }

  this.body = status
}

/**
 * 发送充值成功邮件
 *
 * @param {String} email
 * @param {Number} type
 * @param {Number} amount
 * @param {Object} order
 */
exports.sendPaySuccessEmail = function (email, type, amount, order) {
  const method = 'sendPaySuccessEmail'
  // when order.paied is true, send the email
  if (!order.paid) return
  if (!email) email = order.user_email
  if (!email) {
    logger.warn(method, `send email faild, because of email is null: ${JSON.stringify(order)}`)
    return
  }
  let balance = order.new_balance
  amount = parseInt(amount) / 100
  balance = parseInt(balance) / 100
  const payHistoryUrl = `${stdConfigs.host}/account/cost#payments`
  emailUtils.sendChargeSuccessEmail(email, type, amount, balance, payHistoryUrl, order.team_name)
}