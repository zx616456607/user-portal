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
import { Icon, Input, Button, Modal, Row, Col, Spin, InputNumber, } from 'antd'
import { MIN_PAY_AMOUNT, PAY_AMOUNT_STEP } from '../../../../constants'
import { loadLoginUserDetail } from '../../../../actions/entities'
import { loadUserTeamspaceList } from '../../../../actions/user'
import { getWechatPayQrCode, getWechatPayOrder } from '../../../../actions/wechat_pay'
import QRCode from 'qrcode.react'
import './style/balance.less'

class UserPay extends Component {
  constructor(props) {
    super(props)
    this.renderRechargeTarget = this.renderRechargeTarget.bind(this)
    this.handlePayClick = this.handlePayClick.bind(this)
    this.showWechatQrCode = this.showWechatQrCode.bind(this)
    this.handleWechatPayCancel = this.handleWechatPayCancel.bind(this)
    this.handlePaySuccessModalCancel = this.handlePaySuccessModalCancel.bind(this)
    this.state = {
      payType: 'alipay', //支付类型
      payStatusModal: false, //充值状态
      payStatusAskModal: false, // 是否支付成功？
      wechatPayModal: false, // 微信充值
      qrCode: {
        url: '',
      },
      amount: 100,
      otherMoney: true, // 其他金额
      balance: 0,
      rechargeTarget: {
        loading: false,
        namespace: '',
      }
    }
  }

  componentWillMount() {
    const { loadUserTeamspaceList, teamName } = this.props
    if (!teamName) {
      return
    }
    this.setState({
      rechargeTarget: {
        loading: true
      }
    })
    loadUserTeamspaceList('default', { size: -1 }).then(({response}) => {
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

  renderRechargeTarget() {
    const { teamName } = this.props
    const { rechargeTarget } = this.state
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
    console.log(amount)
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

  setMoney(amount) {
    let otherMoney = true
    if (!amount) {
      otherMoney = false
    }
    this.setState({
      amount,
      otherMoney
    })
  }

  render() {
    const { teamName } = this.props
    let { payType, qrCode, amount, balance, rechargeTarget } = this.state
    if (balance !== undefined) {
      balance = (balance / 100).toFixed(2)
    }
    return (
      <div id="UserPay">
        <div className="topPay">
          <span className="backjia"></span>
          <span className="btn-back" onClick={() => browserHistory.goBack()}>返回</span>
          <span className="refill">充值</span>
        </div>
        <ul className="sendInfo">
          <li>温馨提示：</li>
          <li>1. 充值金额会在当天到账。如遇问题，可查看 <Icon type="link" />充值帮助。</li>
          <li>2. 您可以通过三种方式充值：微信充值、支付宝、银行转账（线下汇款充值）。采用线下汇款方式到账会有延误，强烈建议采用支付宝，微信支持。 </li>
          <li>3. 累计充值金额满￥200后可提交工单申请发票 </li>
        </ul>
        <div className="payDetail">
          <p>
            <span className="keys">充值目标</span>
            {this.renderRechargeTarget()}
          </p>
          <p>
            <span className="keys">充值金额</span>
            <div className={ this.state.amount =='100' ? 'pushMoney selected' :'pushMoney'} onClick={()=>this.setMoney(100)}>
              <span>100</span>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <div className={ this.state.amount =='200' ? 'pushMoney selected' :'pushMoney'} onClick={()=>this.setMoney(200)}>
              <span>200</span>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <div className={ this.state.amount =='300' ? 'pushMoney selected' :'pushMoney'} onClick={()=>this.setMoney(300)}>
              <span>300</span>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <div className={ this.state.amount =='400' ? 'pushMoney selected' :'pushMoney'} onClick={()=>this.setMoney(400)}>
              <span>400</span>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <div className={ this.state.amount =='500' ? 'pushMoney selected' :'pushMoney'} onClick={()=>this.setMoney(500)}>
              <span>500</span>
              <div className="triangle"></div>
              <Icon type="check" />
            </div>
            <Button size="large" onClick={()=>this.setMoney(false)} style={{marginRight:'10px'}}>其他金额</Button>
            {
              !this.state.otherMoney ?
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
              :null
            }
          </p>
          <p>
            <span className="keys">充值方式</span>
            ① 在线支付
          </p>
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
              <Button
                type="primary"
                size="large"
                disabled={rechargeTarget.loading}
                onClick={this.handlePayClick}>
                {
                  payType === 'alipay'
                    ? <a target="_blank" href="/api/v2/payments/alipay/direct">充值</a>
                    : '充值'
                }
              </Button>
              <br />
              <br />
              <br />
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
              <div className="list-row">打款后，请拔打电话<a>（400-626-1876）</a>、<a>邮件（service@tenxcloud.com）</a>或<a>右下角工单</a>的方式与我们联系并提供下列信息：（以便工作人员与您联系并登记到您的名下）</div>
              <div className="ticket">
                <span>汇款人单位和姓名</span>
                <span>汇款底单</span>
                <span>联系人手机</span>
                <span>您在时速云登录邮箱</span>
                <span>汇款银行账号</span>
                <span>要充值的账号名称</span>
              </div>
              <p className="list-top">3. 充值结果反馈</p>
              <div className="list-row">
                打款并提交汇款信息后，您可以前往 <Link to="/account">充值记录</Link> 查询页面查看您的充值记录
              </div>
              <div className="timeout">
                （由于银行处理时间影响，充值记录会有延误）
              </div>
            </div>
          </div>
          {/* 充值成功 Modal */}
          <Modal
            title="充值成功"
            visible={this.state.payStatusModal}
            maskClosable={false}
            onOk={() => this.setState({ payStatusModal: false })}
            onCancel={() => {
              this.setState({ payStatusModal: false })
              // browserHistory.push('/account/cost#payments')
            } }
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
            visible={this.state.payStatusAskModal}
            maskClosable={false}
            onCancel={() => this.setState({ payStatusAskModal: false })}
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
            visible={this.state.wechatPayModal}
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
  const { team } = location.query
  return {
    teamName: team,
  }
}

export default connect(mapStateToProps, {
  loadUserTeamspaceList,
  loadLoginUserDetail,
  getWechatPayQrCode,
  getWechatPayOrder,
})(UserPay)
