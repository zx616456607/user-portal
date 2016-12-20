
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