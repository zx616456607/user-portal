/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/*
 * User 3rd account controller: for Public Cloud Only
 *
 * v0.1 - 2017-01-11
 * @author Zhangpc
*/
'use strict'

const apiFactory = require('../../services/api_factory')
const Wechat = require('../../3rd_account/wechat')
const wechat = new Wechat()
const logger = require('../../utils/logger').getLogger('user_3rd_account')
const indexConfig = require('../../configs/_standard')
const indexService = require('../../services')
// const WECHAT_QR_EXPIRE_SECONDS = 60 * 15 // 二维码15分钟有效期
const WECHAT_QR_EXPIRE_SECONDS = 15

exports.bindAccount = function* () {
  const loginUser = this.session.loginUser
  const userID = loginUser.id
  const api = apiFactory.getApi(loginUser)
  const data = this.request.body || {}
  const accountID = this.session.wechat_account_id
  delete this.session.wechat_account_id
  const access_token = yield wechat.initWechat()
  const userInfo = yield wechat.getUserInfo(access_token, accountID)
  data.accountID = accountID
  data.accountDetail = JSON.stringify(userInfo)
  yield api.users.patchBy([userID, 'bind'], null, data)
  this.body = userInfo
}

exports.unbindAccount = function* () {
  const loginUser = this.session.loginUser
  const userID = loginUser.id
  const api = apiFactory.getApi(loginUser)
  const data = this.request.body || {}
  const result = yield api.users.patchBy([userID, 'unbind'], null, data)
  this.body = result
}

exports.getWechatAuthUrl = function* () {
  const access_token = yield wechat.initWechat()
  const action_name = 'QR_SCENE'
  const scene = {
    scene_id: indexConfig.wechat.Login_EventKey
  }
  const QRTicket = yield wechat.getQRTicket(access_token, WECHAT_QR_EXPIRE_SECONDS, action_name, scene)
  this.session.wechat_ticket = QRTicket.ticket
  setTimeout(() => {
    delete this.session.wechat_ticket
  }, QRTicket.expire_seconds * 1000)
  delete QRTicket.ticket
  this.body = QRTicket
}

exports.checkWechatAuthStatus = function* () {
  const query = this.query
  const wechat_ticket = this.session.wechat_ticket
  if (!wechat_ticket) {
    this.status = 404
    this.body = {
      status: 404,
      message: 'WECHAT_TICKET_NOT_EXIST'
    }
    return
  }
  let result
  let resData = {
    status: 200
  }
  try {
    result = yield wechat.getEventByTicket(wechat_ticket)
    let Event = result.Event
    let accountID
    if (Event && Event.Ticket === wechat_ticket) {
      let event = Event.Event
      if (event === 'SCAN' || event === 'subscribe') {
        accountID = Event.FromUserName
        resData.message = event.toLowerCase()
        // Check if wechat account already signup
        let wechatAccountExist
        if (query.action === 'signup') {
          let data = {
            accountType: 'wechat',
            accountID,
          }
          let checkWechatAccountExist = yield indexService.checkWechatAccountIsExist(data)
          wechatAccountExist = checkWechatAccountExist.exist
        }
        resData.wechatAccountExist = wechatAccountExist
        if (!wechatAccountExist) {
          const access_token = yield wechat.initWechat()
          const userInfo = yield wechat.getUserInfo(access_token, accountID)
          resData.accountDetail = {
            nickname: userInfo.nickname,
            headimgurl: userInfo.headimgurl,
          }
        }
      }
    } else {
      resData = {
        status: 400,
        message: 'scan_error'
      }
    }
    this.session.wechat_account_id = accountID
  } catch (error) {
    if (error.statusCode == 500 && error.message.error == "can't find ticket.") {
      resData = {
        status: 201,
        message: 'no_scan'
      }
    } else {
      resData = {
        status: 500,
        message: 'server_error'
      }
    }
  }
  this.status = resData.status
  this.body = resData
}
