/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */
/**
 * User pay - Standard
 *
 * v0.1 - 2016-12-23
 * @author Gaojian
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { Icon, Input, Button, Modal, Row, Col, Spin, InputNumber, } from 'antd'
import { MIN_PAY_AMOUNT, PAY_AMOUNT_STEP } from '../../../../constants'
import { loadLoginUserDetail } from '../../../../actions/entities'
import { loadUserTeamspaceList } from '../../../../actions/user'
import { parseAmount }from '../../../../common/tools'
import { getWechatPayQrCode, getWechatPayOrder, getPayOrderStatus } from '../../../../actions/payments'
import QRCode from 'qrcode.react'
import NotificationHandler from '../../../../common/notification_handler'
import './style/PaymentUpgrade.less'

class UserPayUpgrade extends Component {
  constructor(props) {
    super(props)
    this.renderRechargeTarget = this.renderRechargeTarget.bind(this)
    this.handlePayClick = this.handlePayClick.bind(this)
    this.showWechatQrCode = this.showWechatQrCode.bind(this)
    this.handleWechatPayCancel = this.handleWechatPayCancel.bind(this)
    this.handlePaySuccessModalCancel = this.handlePaySuccessModalCancel.bind(this)
    this.renderPayButton = this.renderPayButton.bind(this)
    this.checkPayOrderStatus = this.checkPayOrderStatus.bind(this)
    this.state = {
      payType: 'alipay', //支付类型
      payStatusModal: false, //充值状态
      payStatusAskModal: false, // 是否支付成功？
      wechatPayModal: false, // 微信充值
      qrCode: {
        url: '',
      },
      amount: 100,
      otherAmount: false, // 其他金额
      balance: 0,
      rechargeTarget: {
        loading: false,
        namespace: '',
      },
      teamName: props.teamName,
    }
  }

  componentWillMount() {
    document.title = '充值 | 时速云'
    const { loadUserTeamspaceList, getPayOrderStatus, orderId } = this.props
    const { teamName } = this.state
    // Load team list
    if (teamName) {
      this.setState({
        rechargeTarget: {
          loading: true
        }
      })
      loadUserTeamspaceList('default', { size: 100 }).then(({response}) => {
        const { teamspaces } = response.result
        this.setState({
          rechargeTarget: {
            loading: false,
          }
        })
        teamspaces.map(space => {
          if (space.teamName === teamName) {
            this.setState({
              rechargeTarget: {
                namespace: space.namespace
              }
            })
          }
        })
      }).catch(err => {
        this.setState({
          rechargeTarget: {
            loading: false,
          }
        })
      })
    }
    // Load order status
    if (orderId) {
      this.checkPayOrderStatus()
    }
  }

  renderRechargeTarget() {
    const { rechargeTarget, teamName } = this.state
    const { loading, namespace } = rechargeTarget
    if (loading) {
      return <Icon type='loading' />
    }
    if (namespace) {
      return `${teamName} 团队`
    }
    return '个人帐户'
  }

  changePayType(type) {
    this.setState({ payType: type })
  }

  handlePayClick(e) {
    const { payType, amount } = this.state
    if (!amount) {
      e.preventDefault()
      document.getElementById('inputAmount').focus()
      return
    }
    const newState = {}
    if (payType === 'alipay') {
      newState.payStatusAskModal = true
    } else {
      newState.wechatPayModal = true
      this.showWechatQrCode()
    }
    this.setState(newState)
  }

  showWechatQrCode() {
    const { loadLoginUserDetail, getWechatPayQrCode, getWechatPayOrder } = this.props
    const { amount, rechargeTarget } = this.state
    this.setState({
      qrCode: {
        url: '',
      }
    })
    getWechatPayQrCode(amount, rechargeTarget.namespace).then(({ response, type }) => {
      const { codeUrl, nonceStr, orderId } = response.result
      this.setState({
        qrCode: {
          url: codeUrl
        }
      })
      this.getOrder && clearInterval(this.getOrder)
      this.getOrder = setInterval(() => {
        getWechatPayOrder(orderId, rechargeTarget.namespace, { nonce_str: nonceStr }).then(({ response, type }) => {
          const { tradeState, result } = response.result
          if (tradeState === 'SUCCESS') {
            clearInterval(this.getOrder)
            this.setState({
              wechatPayModal: false,
              payStatusModal: true,
              balance: result.newBalance,
            })
            loadLoginUserDetail()
          }
        })
      }, 1500)
    }).catch(err => {
      // Must catch err here, response may be null
    })
  }

  componentWillUnmount() {
    this.getOrder && clearInterval(this.getOrder)
  }

  handleWechatPayCancel() {
    this.setState({ wechatPayModal: false })
    this.getOrder && clearInterval(this.getOrder)
  }

  handlePaySuccessModalCancel() {
    this.setState({ payStatusModal: false })
  }

  renderPayButton() {
    const { rechargeTarget, payType, amount, teamName } = this.state
    const { loading, namespace } = rechargeTarget
    if (payType === 'wechat_pay') {
      return (
        <Button
          type="primary"
          size="large"
          disabled={rechargeTarget.loading}
          onClick={this.handlePayClick}>
          充值
        </Button>
      )
    }
    // Alipay
    return (
      <form id="payment" method="post" action="/api/v2/payments/alipay" target="_blank" role="form">
        <input type="hidden" id="paymentAmount" name="paymentAmount" value={amount} />
        <input type="hidden" id="teamspace" name="teamspace" value={namespace} />
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          disabled={rechargeTarget.loading}
          onClick={this.handlePayClick}>
          充值
        </Button>
      </form>
    )
  }

  setAmount(amount) {
    let otherAmount = false
    if (!amount) {
      otherAmount = true
    }
    this.setState({
      amount,
      otherAmount
    })
  }

  checkPayOrderStatus() {
    const { getPayOrderStatus, orderId } = this.props
    let notification = new NotificationHandler()
    getPayOrderStatus({ order_id: orderId }).then(({ response }) => {
      let {
        chargeAmount,
        newBalance,
        method,
        code,
        teamId,
        teamName,
        namespace,
      } = response.result
      if (code === 404) {
        notification.warn('获取订单状态失败，请查看充值记录')
        browserHistory.push('/account/cost#payments')
        return
      }
      this.setState({
        payType: method,
        amount: parseAmount(chargeAmount).amount,
        balance: newBalance,
        payStatusModal: true,
        payStatusAskModal: false,
        rechargeTarget: {
          namespace: (teamId ? namespace : null)
        },
        teamName,
      })
    }).catch(err => {
      notification.warn('获取订单状态失败，请查看充值记录')
      browserHistory.push('/account/cost#payments')
    })
  }

  render() {
    let {
      payType,
      qrCode,
      amount,
      balance,
      rechargeTarget,
      teamName,
      otherAmount,
      payStatusModal,
      payStatusAskModal,
      wechatPayModal,
    } = this.state
    if (balance !== undefined) {
      balance = parseAmount(balance).amount
    }
    return (
      <div id="UserPayUpgrade">
        <div className="topPay">
          <span className="backjia"></span>
          <span className="btn-back" onClick={() => browserHistory.goBack()}>返回</span>
          <span className="refill">充值</span>
        </div>
        <ul className="sendInfo">
          <li>温馨提示：</li>
          <li>1. 充值金额会在当天到帐。如遇问题，可查看 <Icon type="link" />充值帮助。</li>
          <li>2. 您可以通过三种方式充值：微信充值、支付宝、用户余额。 </li>
          <li>3. 累计充值金额满￥200后可提交工单申请发票 </li>
        </ul>
        <div className="payDetail">
          <div className="row">
            <span className="keys">充值帐户</span>
            {this.renderRechargeTarget()}
          </div>
          <div className="row">
            <span className="keys">充值金额</span>
            <div className={amount == '1' ? 'pushMoney selected' : 'pushMoney'} onClick={() => this.setAmount(1)}>
              <p>1个月</p>
              <p>￥<span className='bigSpan'>99/月</span></p>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <div className={amount == '3' ? 'pushMoney selected' : 'pushMoney'} onClick={() => this.setAmount(3)}>
              <p>3个月</p>
              <p>￥<span className='bigSpan'>89/月</span></p>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <div className={amount == '12' ? 'pushMoney selected' : 'pushMoney'} onClick={() => this.setAmount(12)}>
              <p>12个月</p>
              <p>￥<span className='bigSpan'>79/月</span></p>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className="row">
            <span className="keys">充值方式</span>
            ① 在线支付
          </div>
          <div className="againMore">
            <div className="pay-row">
              <div
                className={payType == 'alipay' ? 'wrap-img selected' : 'wrap-img'}
                onClick={() => this.changePayType('alipay')}>
                <img src="/img/standard/allpay.png" />
                <Icon type="check" />
                <div className="triangle"></div> {/*no remove */}
              </div>
              <div
                className={payType == 'wechat_pay' ? 'wrap-img selected' : 'wrap-img'}
                onClick={() => this.changePayType('wechat_pay')}>
                <img src="/img/standard/weixin.png" alt="" />
                <Icon type="check" />
                <div className="triangle"></div> {/*no remove */}
              </div>
              <div
                className={payType == 'user_balance' ? 'wrap-img selected' : 'wrap-img'}
                onClick={() => this.changePayType('user_balance')}>
                <span>用户余额</span>
                <Icon type="check" />
                <div className="triangle"></div> {/*no remove */}
              </div>
            </div>
            <div className="pay-row" style={{ marginTop: '20px' }}>
              {this.renderPayButton()}
            </div>
          </div>
          {/* 充值成功 Modal */}
          <Modal
            title="充值成功"
            visible={payStatusModal}
            maskClosable={false}
            onOk={() => this.setState({ payStatusModal: false })}
            onCancel={this.handlePaySuccessModalCancel}
            wrapClassName="paySuccessModal"
            okText="继续充值"
            cancelText="查看充值记录"
            footer={[
              <Button
                key="payHistory"
                type="primary"
                size="large"
                onClick={() => browserHistory.push('/account/cost#payments')}>
                充值记录
              </Button>,
              <Button
                key="back"
                type="ghost"
                size="large"
                onClick={this.handlePaySuccessModalCancel}>
                继续充值
              </Button>,
            ]}
            width={490}
            >
            <div className="paySuccess"><Icon type="check" /></div>
            <p className="payText">支付成功</p>
            <br />
            <p>通过{payType === 'alipay' ? `支付宝` : `微信`}向 <a>{this.renderRechargeTarget()}</a></p>
            <p>充值金额为 <span className="success"> {amount}</span> 元，当前团队余额为 <a>{balance}</a> 元</p>
          </Modal>
          {/* 充值成功 end Modal */}

          {/* 是否支付成功 Modal */}
          <Modal
            title="是否支付成功"
            visible={payStatusAskModal}
            maskClosable={false}
            onCancel={() => this.setState({ payStatusAskModal: false })}
            onOk={this.checkPayOrderStatus}
            wrapClassName="paySuccessModal"
            okText="支付成功"
            cancelText="支付失败"
            width={490}
            >
            <div className="paySuccess question"><Icon type="question" /></div>
            <p className="payText question">是否支付成功</p>
            <br />
          </Modal>
          {/* 是否支付成功 end Modal */}


          {/* 微信支付 Modal */}
          <Modal
            title="微信支付"
            visible={wechatPayModal}
            maskClosable={false}
            onOk={this.handleOk}
            onCancel={this.handleWechatPayCancel}
            wrapClassName="wechatPayModal"
            footer={null}
            width={300}
            >
            {
              !qrCode.url
                ? <div className="qrCodeLoading"><Spin size="large" /></div>
                : <div className="qrCode"><QRCode value={qrCode.url} size={200} /></div>
            }
            <div className="wechatPayModalFooter">支付成功后，页面会自动刷新</div>
          </Modal>
          {/* 是否支付成功 end Modal */}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { location } = props
  const { team, order_id } = location.query
  return {
    teamName: team,
    orderId: order_id,
  }
}

export default connect(mapStateToProps, {
  loadUserTeamspaceList,
  loadLoginUserDetail,
  getWechatPayQrCode,
  getWechatPayOrder,
  getPayOrderStatus,
})(UserPayUpgrade)
