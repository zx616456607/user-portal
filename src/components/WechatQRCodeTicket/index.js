/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Wechat QRCode Ticket - Standard
 * 微信登录 / 绑定微信账号
 *
 * v0.1 - 2017-01-12
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import QRCode from 'qrcode.react'
import { getWechatAuthQrCode, getWechatAuthQrCodeStatus } from '../../actions/user_3rd_account'
import { Popover, Spin, } from 'antd'
import './style/WechatQRCodeTicket.less'

class WechatQRCodeTicket extends Component {
  constructor(props) {
    super(props)
    this.clearAllTimeout = this.clearAllTimeout.bind(this)
    this.clearGetAuthQrCodeStatusTimeout = this.clearGetAuthQrCodeStatusTimeout.bind(this)
    this.onVisibleChange = this.onVisibleChange.bind(this)
    this.setTimeOutGetAuthQrCode = this.setTimeOutGetAuthQrCode.bind(this)
    this.setTimeOutGetAuthQrCodeStatus = this.setTimeOutGetAuthQrCodeStatus.bind(this)
    this.state = {
      visible: false,
      wechat_auth_url: '',
    }
  }

  clearAllTimeout() {
    clearTimeout(this.getAuthQrCodeTimeout)
    this.clearGetAuthQrCodeStatusTimeout()
  }

  clearGetAuthQrCodeStatusTimeout() {
    clearTimeout(this.getAuthQrCodeStatusTimeout)
    this.getStatusTimes = 0
  }

  componentWillUnmount() {
    this.clearAllTimeout()
  }

  onVisibleChange(visible) {
    this.setState({visible})
    const { wechat_auth_url } = this.state
    // Pop hide
    if(!visible) {
      this.clearAllTimeout()
      return
    }
    // Pop show: load wechat auth url
    if (!wechat_auth_url){
      this.setTimeOutGetAuthQrCode()
    } else {
      this.setTimeOutGetAuthQrCodeStatus()
    }
  }

  setTimeOutGetAuthQrCode() {
    const { getWechatAuthQrCode } = this.props
    getWechatAuthQrCode().then(({ response, type }) => {
      this.clearGetAuthQrCodeStatusTimeout()
      const { expireSeconds, url } = response.result
      this.setState({
        wechat_auth_url: url,
      })
      // Get wechat auth status
      this.setTimeOutGetAuthQrCodeStatus()
      // When url expired load again
      const timeout = expireSeconds * 1000
      this.getAuthQrCodeTimeout = setTimeout(this.setTimeOutGetAuthQrCode, timeout)
      // When url expired set url in state to empty
      setTimeout(() => {
        this.setState({
          wechat_auth_url: '',
        })
      }, timeout)
    }).catch(err => {
      // Must catch err here, response may be null
      clearTimeout(this.getAuthQrCodeTimeout)
    })
  }

  setTimeOutGetAuthQrCodeStatus() {
    const { getWechatAuthQrCodeStatus, getStatusDelay, onScanChange, getStatusMaxTimes } = this.props
    if (this.getStatusTimes >= getStatusMaxTimes) {
      this.setState({
        visible: false,
        wechat_auth_url: '',
      })
      this.clearAllTimeout()
      return
    }
    this.getStatusTimes ++
    getWechatAuthQrCodeStatus().then(({ response, type }) => {
      const { status, message } = response.result
      if (message === 'scan' || message === 'subsribe') {
        onScanChange(true)
        this.setState({
          visible: false,
          wechat_auth_url: '',
        })
        this.clearAllTimeout()
        return
      }
      this.getAuthQrCodeStatusTimeout = setTimeout(this.setTimeOutGetAuthQrCodeStatus, getStatusDelay)
    }).catch(err => {
      // Must catch err here, response may be null
      this.clearGetAuthQrCodeStatusTimeout()
    })
  }

  render() {
    const { triggerElement, getTooltipContainer, message } = this.props
    const { visible, wechat_auth_url } = this.state
    const wechatPopContent = (
      <div className="wechatPopContent">
      {
        wechat_auth_url
        ? <div>
            <div className="qrCode">
              <QRCode value={wechat_auth_url} size={110} />
            </div>
            <div className="desc">{message}</div>
          </div>
        : <div className="qrCodeLoading"><Spin /></div>
      }
      </div>
    )
    return (
      <Popover
        overlayClassName="wechatPop"
        placement="top"
        title={null}
        content={wechatPopContent}
        getTooltipContainer={getTooltipContainer}
        visible={visible}
        onVisibleChange={this.onVisibleChange}
        trigger="click">
        {triggerElement}
      </Popover>
    )
  }
}

WechatQRCodeTicket.propTypes = {
  triggerElement: PropTypes.element.isRequired,
  onScanChange: PropTypes.func.isRequired, // when user scan return ture
  getStatusDelay: PropTypes.number.isRequired,
  getStatusMaxTimes: PropTypes.number.isRequired,
  message: PropTypes.string,
  getTooltipContainer: PropTypes.func,
}

WechatQRCodeTicket.defaultProps = {
  getStatusDelay: 1500,
  getStatusMaxTimes: 60,
}

function mapStateToProps(state, props) {
  return {
    //
  }
}

export default connect(mapStateToProps, {
  getWechatAuthQrCode,
  getWechatAuthQrCodeStatus,
})(WechatQRCodeTicket)
