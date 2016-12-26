/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */
/**
 * User pay - Standard
 *
 * v0.1 - 2016-12-13
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { Icon, Input, Button, Modal, Row, Col, Spin, InputNumber, Tooltip, } from 'antd'
import { MIN_PAY_AMOUNT, PAY_AMOUNT_STEP } from '../../../../constants'
import { loadLoginUserDetail } from '../../../../actions/entities'
import { loadUserTeamspaceList } from '../../../../actions/user'
import { getWechatPayQrCode, getWechatPayOrder, getPayOrderStatus } from '../../../../actions/payments'
import { upgradeOrRenewalsEdition } from '../../../../actions/user_preference'
import QRCode from 'qrcode.react'
import NotificationHandler from '../../../../common/notification_handler'
import './style/balance.less'
import { formatDate } from '../../../../common/tools'

const periodPrice = {
  period_1: 99,
  period_3: 89,
  period_12: 79,
}

class UserPay extends Component {
  constructor(props) {
    super(props)
    this.renderRechargeTarget = this.renderRechargeTarget.bind(this)
    this.handlePayClick = this.handlePayClick.bind(this)
    this.showWechatQrCode = this.showWechatQrCode.bind(this)
    this.handleWechatPayCancel = this.handleWechatPayCancel.bind(this)
    this.handlePaySuccessModalCancel = this.handlePaySuccessModalCancel.bind(this)
    this.renderPayButton = this.renderPayButton.bind(this)
    this.checkPayOrderStatus = this.checkPayOrderStatus.bind(this)
    this.renderPayments = this.renderPayments.bind(this)
    this.getUpgradeModalContent = this.getUpgradeModalContent.bind(this)
    const { hash } = props
    let title = '充值'
    let amount = 100
    let upgrade
    let period = 0
    if (hash === '#upgrade') {
      title = '升级版本'
      amount = 99
      upgrade = 1
      period = 1
    } else if (hash === '#renewals') {
      title = '续费'
      amount = 99
      upgrade = 1
      period = 1
    }
    this.state = {
      payType: 'alipay', //支付类型
      payStatusModal: false, //充值状态
      payStatusAskModal: false, // 是否支付成功？
      wechatPayModal: false, // 微信充值
      qrCode: {
        url: '',
      },
      amount,
      otherAmount: false, // 其他金额
      balance: 0,
      payBtnDisabled: false,
      rechargeTarget: {
        loading: false,
        namespace: '',
      },
      teamName: props.teamName,
      title,
      upgradeModalVisible: false,
      endTime: '',
      upgrade, // 升级版本
      period, // 有效期限(1,3,12)
    }
  }

  componentWillMount() {
    const { teamName, title } = this.state
    document.title = `${title} | 时速云`
    const { loadUserTeamspaceList, getPayOrderStatus, orderId } = this.props
    // Load team list
    if (teamName) {
      this.setState({
        payBtnDisabled: true,
        rechargeTarget: {
          loading: true
        }
      })
      loadUserTeamspaceList('default', { size: -1 }).then(({response}) => {
        const { teamspaces } = response.result
        this.setState({
          payBtnDisabled: false,
          rechargeTarget: {
            loading: false,
          }
        })
        teamspaces.map(space => {
          if (space.teamName === teamName) {
            this.setState({
              payBtnDisabled: false,
              rechargeTarget: {
                namespace: space.namespace
              }
            })
          }
        })
      }).catch(err => {
        this.setState({
          payBtnDisabled: false,
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
    let notification = new NotificationHandler()
    let { amount } = this.state
    const { loginUser } = this.props
    const newState = {
      payType: type,
    }
    amount *= 100
    if (type === 'user_balance' && amount > loginUser.balance) {
      notification.warn(`您的账户余额不足`, `请选择充值的方式进行升级`)
      newState.payBtnDisabled = true
    } else {
      newState.payBtnDisabled = false
    }
    this.setState(newState)
  }

  handlePayClick(e) {
    const { payType, amount, period } = this.state
    const { upgradeOrRenewalsEdition, loadLoginUserDetail, hash } = this.props
    let notification = new NotificationHandler()
    if (!amount) {
      e.preventDefault()
      document.getElementById('inputAmount').focus()
      return
    }
    const newState = {}
    if (payType === 'alipay') {
      newState.payStatusAskModal = true
    } else if (payType === 'wechat_pay') {
      newState.wechatPayModal = true
      this.showWechatQrCode()
    } else {
      const body = {
        env: 1,
        month: period,
      }
      upgradeOrRenewalsEdition(body).then(({ response, type }) => {
        const { endTime } = response.result.data
        this.setState({
          upgradeModalVisible: true,
          endTime: formatDate(endTime)
        })
        loadLoginUserDetail()
      }).catch(err => {
        // Must catch err here, response may be null
      })
    }
    this.setState(newState)
  }

  showWechatQrCode() {
    const { loadLoginUserDetail, getWechatPayQrCode, getWechatPayOrder } = this.props
    const { amount, rechargeTarget, period, upgrade } = this.state
    this.setState({
      qrCode: {
        url: '',
      }
    })
    const query = {
      upgrade,
      duration: period,
    }
    getWechatPayQrCode(amount, rechargeTarget.namespace, query).then(({ response, type }) => {
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
            let upgradeOrRenewalsResult = this.handleUpgradeOrRenewalsResult(result)
            if (upgradeOrRenewalsResult) {
              return
            }
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

  handleUpgradeOrRenewalsResult(result) {
    let notification = new NotificationHandler()
    const { chargePurpose } = result
    if (!chargePurpose) {
      return false
    }
    let { endTime, chargeType } = chargePurpose
    // `chargeType === 0` 代表充值成功，升级失败
    // `chargeType === 1` 代表充值成功，续费失败
    // `chargeType === 2` 代表充值成功，升级成功
    // `chargeType === 3` 代表充值成功，续费成功
    if (chargeType < 2) {
      this.setState({
        wechatPayModal: false,
        payStatusAskModal: false,
      })
      notification.warn(`充值成功，${chargeType === 1 ? '续费': '升级'}失败，请检查帐户余额`, '', null)
      return true
    }
    this.setState({
      wechatPayModal: false,
      payStatusAskModal: false,
      upgradeModalVisible: true,
      endTime: formatDate(endTime),
    })
    return true
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
    const {
      rechargeTarget,
      payType,
      amount,
      teamName,
      payBtnDisabled,
      title,
      period,
      upgrade,
    } = this.state
    const { namespace } = rechargeTarget
    if (payType === 'wechat_pay') {
      return (
        <Button
          type="primary"
          size="large"
          disabled={payBtnDisabled}
          onClick={this.handlePayClick}>
          {title}
        </Button>
      )
    }
    // Alipay
    if (payType === 'alipay') {
      return (
        <form id="payment" method="post" action="/api/v2/payments/alipay" target="_blank" role="form">
          <input type="hidden" id="paymentAmount" name="paymentAmount" value={amount} />
          <input type="hidden" id="teamspace" name="teamspace" value={namespace} />
          <input type="hidden" id="upgrade" name="upgrade" value={upgrade} />
          <input type="hidden" id="duration" name="duration" value={period} />
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            disabled={payBtnDisabled}
            onClick={this.handlePayClick}>
            {title}
          </Button>
        </form>
      )
    }
    return (
      <Button
        type="primary"
        size="large"
        disabled={payBtnDisabled}
        onClick={this.handlePayClick}>
        {title}
      </Button>
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

  setPeriod(period) {
    this.setState({
      period,
      amount: periodPrice[`period_${period}`] * period
    })
  }

  checkPayOrderStatus() {
    const { getPayOrderStatus, orderId, loadLoginUserDetail } = this.props
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
      let upgradeOrRenewalsResult = this.handleUpgradeOrRenewalsResult(response.result)
      if (upgradeOrRenewalsResult) {
        return
      }
      /*if (chargePurpose) {
        let { endTime, chargeType } = chargePurpose
        // `chargeType === 0` 代表充值成功，升级失败
        // `chargeType === 1` 代表充值成功，续费失败
        // `chargeType === 2` 代表充值成功，升级成功
        // `chargeType === 3` 代表充值成功，续费成功
        if (chargeType < 2) {
          this.setState({
            payStatusAskModal: false,
          })
          notification.warn(`充值成功，${chargeType === 1 ? '续费': '升级'}失败，请检查帐户余额`, '', null)
          return
        }
        this.setState({
          payStatusAskModal: false,
          upgradeModalVisible: true,
          endTime: formatDate(endTime),
        })
        loadLoginUserDetail()
        return
      }*/
      this.setState({
        payType: method,
        amount: chargeAmount / 100,
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

  renderPayments() {
    const { hash, loginUser } = this.props
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
      title,
      period,
    } = this.state
    let userBalance = loginUser.balance
    if (userBalance !== undefined) {
      userBalance = userBalance / 100
    }
    // 续费升级
    if (hash === '#upgrade' || hash === '#renewals') {
      return (
        <div className="upgradePayDetail">
          <div className="row">
            <span className="keys">充值帐户</span>
            {this.renderRechargeTarget()}
          </div>
          <div className="row">
            <span className="keys">选择有效期限</span>
            <div className={period == '1' ? 'pushMoney selected' : 'pushMoney'} onClick={() => this.setPeriod(1)}>
              <p>1个月</p>
              <p>￥<span className='bigSpan'>99/月</span></p>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <div className={period == '3' ? 'pushMoney selected' : 'pushMoney'} onClick={() => this.setPeriod(3)}>
              <p>3个月</p>
              <p>￥<span className='bigSpan'>89/月</span></p>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <div className={period == '12' ? 'pushMoney selected' : 'pushMoney'} onClick={() => this.setPeriod(12)}>
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
              <Tooltip placement="right" title={`余额：¥ ${userBalance}`}>
                <div
                  className={payType == 'user_balance' ? 'wrap-img selected' : 'wrap-img'}
                  onClick={() => this.changePayType('user_balance')}>
                  <img className='userBalanceImg' src='/img/standard/userBalance.png' />
                  <Icon type="check" />
                  <div className="triangle"></div> {/*no remove */}
                </div>
              </Tooltip>
            </div>
          </div>
          <div className="row">
            <span className="keys">合计</span>
            <span className="amount"><span style={{ fontSize: '18px' }}>¥</span> {amount}</span>
          </div>
          <div className="againMore">
            <div className="pay-row">
            </div>
            <div className="pay-row" style={{ marginTop: '20px' }}>
              {this.renderPayButton()}
            </div>
          </div>
        </div>
      )
    }
    // 充值
    return (
      <div>
        <ul className="sendInfo">
          <li>温馨提示：</li>
          <li>1. 充值金额会在当天到账。如遇问题，可查看 <Icon type="link" />充值帮助。</li>
          <li>2. 您可以通过三种方式充值：微信充值、支付宝、银行转账（线下汇款充值）。采用线下汇款方式到账会有延误，强烈建议采用支付宝，微信支持。 </li>
          <li>3. 累计充值金额满￥200后可提交工单申请发票 </li>
        </ul>
        <div className="payDetail">
          <div className="row">
            <span className="keys">充值帐户</span>
            {this.renderRechargeTarget()}
          </div>
          <div className="row">
            <span className="keys">充值金额</span>
            <div className={amount == '100' ? 'pushMoney selected' : 'pushMoney'} onClick={() => this.setAmount(100)}>
              <span>100</span>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <div className={amount == '200' ? 'pushMoney selected' : 'pushMoney'} onClick={() => this.setAmount(200)}>
              <span>200</span>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <div className={amount == '300' ? 'pushMoney selected' : 'pushMoney'} onClick={() => this.setAmount(300)}>
              <span>300</span>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <div className={amount == '400' ? 'pushMoney selected' : 'pushMoney'} onClick={() => this.setAmount(400)}>
              <span>400</span>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <div className={amount == '500' ? 'pushMoney selected' : 'pushMoney'} onClick={() => this.setAmount(500)}>
              <span>500</span>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <Button size="large" onClick={() => this.setAmount(false)} style={{ marginRight: '10px' }}>其他金额</Button>
            {
              otherAmount ?
                <InputNumber
                  id="inputAmount"
                  size="large"
                  style={{ width: '200px' }}
                  placeholder={`单笔充值金额最少 ${MIN_PAY_AMOUNT} 元`}
                  defaultValue=''
                  step={PAY_AMOUNT_STEP}
                  min={MIN_PAY_AMOUNT}
                  onChange={(value) => {
                    this.setState({
                      amount: value
                    })
                  } } />
                : null
            }
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
            </div>
            <div className="pay-row" style={{ marginTop: '20px' }}>
              {this.renderPayButton()}
            </div>
            <div className="downRow">② 线下汇款充值</div>
            <br />
            <div className="tips">
              <p className="list-top">1. 打款至时速云指定收款账号  <span className="timeout">注意：请妥善保管汇款底单</span></p>
              <Row className="list-row">
                <Col span="8">开户行</Col>
                <Col span="8">户名</Col>
                <Col span="8">账号</Col>
              </Row>
              <Row className="ticket">
                <Col span="8">招商银行股份有限公司北京中关村支行</Col>
                <Col span="8">北京云思畅想有限责任公司</Col>
                <Col span="8">110912611610301</Col>
              </Row>
              <p className="list-top">2. 与我们联系</p>
              <div className="list-row">
                打款后，请拔打电话<a href="phone:400-626-1876">（400-626-1876）</a>，
              发送邮件<a href="mailto:service@tenxcloud.com">（service@tenxcloud.com）</a>或<a>右下角工单</a>的方式与我们联系并提供下列信息：（以便工作人员与您联系并登记到您的名下）</div>
              <Row className="ticket">
                <Col span="4">汇款人单位和姓名</Col>
                <Col span="4">汇款底单</Col>
                <Col span="4">联系人手机</Col>
                <Col span="4">您在时速云登录邮箱</Col>
                <Col span="4">汇款银行账号</Col>
                <Col span="4">要充值的账号名称</Col>
              </Row>
              <p className="list-top">3. 充值结果反馈</p>
              <div className="list-row">
                打款并提交汇款信息后，您可以前往 <Link to="/account">充值记录</Link> 查询页面查看您的充值记录
              </div>
              <div className="timeout">
                （由于银行处理时间影响，充值记录会有延误）
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  getUpgradeModalContent() {
    const { hash } = this.props
    if (hash === '#upgrade') {
      return (
        <div>
          <div>
            <img alt="专业版" title="专业版" src="/img/version/proImg.png"/>
          </div>
          <p className="successText">恭喜您升级到专业版</p>
        </div>
      )
    }
    const { endTime } = this.state
    return (
      <div>
        <div className="renewalsSuccess"><Icon type="check" /></div>
        <p className="successText">恭喜您，续费成功</p>
        <p>有效期至 {endTime}</p>
      </div>
    )
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
      title,
      period,
      upgradeModalVisible,
    } = this.state
    if (balance !== undefined) {
      balance = (balance / 100).toFixed(2)
    }
    return (
      <div id="UserPay">
        <div className="topPay">
          <span className="backjia"></span>
          <span className="btn-back" onClick={() => browserHistory.goBack()}>返回</span>
          <span className="refill">{title}</span>
        </div>
        {this.renderPayments()}
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

        {/* 升级成功 Modal */}
        <Modal
          title="升级成功"
          visible={upgradeModalVisible}
          maskClosable={false}
          onCancel={() => this.setState({ upgradeModalVisible: false })}
          onOk={this.checkPayOrderStatus}
          wrapClassName="upgradeModal"
          okText="查看消费记录"
          cancelText="查看当前版本"
          width={400}
          footer={[
            <Button
              key="payHistory"
              type="primary"
              size="large"
              onClick={() => browserHistory.push('/account/cost')}>
              查看消费记录
            </Button>,
            <Button
              key="back"
              type="ghost"
              size="large"
              onClick={() => browserHistory.push('/account/version')}>
              查看当前版本
            </Button>,
          ]}
          >
          {/*<div>
            <div>
              <img alt="专业版" title="专业版" src="/img/version/proImg.png"/>
            </div>
            <p className="successText">恭喜您升级到专业版</p>
          </div>*/}
          {this.getUpgradeModalContent()}
          <br />
        </Modal>
        {/* 升级成功 end Modal */}
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { location } = props
  const { team, order_id } = location.query
  const { loginUser } = state.entities
  return {
    loginUser: loginUser.info,
    teamName: team,
    orderId: order_id,
    hash: location.hash,
  }
}

export default connect(mapStateToProps, {
  loadUserTeamspaceList,
  loadLoginUserDetail,
  getWechatPayQrCode,
  getWechatPayOrder,
  getPayOrderStatus,
  upgradeOrRenewalsEdition,
})(UserPay)
