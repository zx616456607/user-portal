/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Wechat API - Standard
 * Document reference: http://mp.weixin.qq.com/wiki/home/index.html
 * v0.1 - 2017-01-10
 * @author Zhangpc
 */
'use strict'

const logger = require('../../utils/logger').getLogger('wechat')
const indexConfig = require('../../configs/_standard')
const oauth = require('../../tenx_api/v2/lib/oauth')
const request = require('../request')('wechat')
const DEFAULT_LANG = 'zh_CN'
const DEFAULT_COLOR = '#2db7f5'
const DEFAULT_URL = 'https://www.tenxcloud.com'

class Wechat {
  constructor(config) {
    if (!config) {
      config = indexConfig.wechat
    }
    this.config = config
  }

  _getAuthHeader() {
    const headers = oauth.getAuthHeader(indexConfig.wechat_user)
    headers.onbehalfuser = indexConfig.wechat_user.user
    return headers
  }

  /**
   * Init wechat to get access_token
   *
   * @returns {Promise}
   *
   * @memberOf Wechat
   */
  initWechat() {
    const headers = this._getAuthHeader()
    const url = `${this.config.tenxwechat_url}/refresh_token`
    return request(url, {
      dataType: 'text',
      method: 'POST',
      headers
    })
  }

  /**
   * 获取 ticket
   *
   * @param {any} access_token 调用接口凭证
   * @param {Number} expire_seconds 该二维码有效时间，以秒为单位。 最大不超过604800（即7天）
   * @param {String} action_name 二维码类型，QR_SCENE为临时,QR_LIMIT_SCENE为永久,QR_LIMIT_STR_SCENE为永久的字符串参数值
   * @param {Object} scene { scene_id, scene_str }
   * - scene_id 场景值ID，临时二维码时为32位非0整型，永久二维码时最大值为100000（目前参数只支持1--100000）
   * - scene_str 场景值ID（字符串形式的ID），字符串类型，长度限制为1到64，仅永久二维码支持此字段
   * @returns {Promise}
   *
   * @memberOf Wechat
   *
   */
  getQRTicket(access_token, expire_seconds, action_name, scene) {
    const url = `${this.config.api_url}/cgi-bin/qrcode/create?access_token=${access_token}`
    const data = {
      expire_seconds,
      action_name,
      action_info: { scene }
    }
    return request(url, {
      method: 'POST',
      data
    })
  }

  /**
   * Get event by ticket
   *
   * @param {String} ticket
   * @returns {Promise}
   *
   * @memberOf Wechat
   */
  getEventByTicket(ticket) {
    const headers = this._getAuthHeader()
    const url = `${this.config.tenxwechat_url}/wechat/get_event?ticket=${ticket}`
    return request(url, {
      method: 'GET',
      headers
    })
  }

  /**
   * Get wechat user info by openid
   *
   * @param {String} access_token
   * @param {String} openid
   * @param {String} lang
   * @returns {Promise}
   *
   * @memberOf Wechat
   */
  getUserInfo(access_token, openid, lang) {
    if (!lang) {
      lang = DEFAULT_LANG
    }
    const url = `${this.config.api_url}/cgi-bin/user/info`
    return request(url, {
      method: 'GET',
      data: {
        access_token,
        openid,
        lang,
      }
    })
  }

  /**
   * Send template to wechat user
   *
   * @param {String} access_token
   * @param {String} openid 用户的openid
   * @param {String} template_id 模板ID
   * @param {Objec} data 渲染模板的数据
   * @param {String} topcolor 顶部颜色
   * @param {url} url URL置空，则在发送后，点击模板消息会进入一个空白页面（ios），或无法点击（android）
   * @returns
   *
   * @memberOf Wechat
   */
  sendTemplate(access_token, openid, template_id, data, topcolor, url) {
    if (!topcolor) {
      topcolor = DEFAULT_COLOR
    }
    if (!url) {
      url = DEFAULT_URL
    }
    const requrl = `${this.config.api_url}/cgi-bin/message/template/send?access_token=${access_token}`
    return request(requrl, {
      method: 'POST',
      data: {
        touser: openid,
        template_id,
        url,
        topcolor,
        data
      }
    })
  }
}

module.exports = Wechat
