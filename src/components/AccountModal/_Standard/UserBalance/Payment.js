/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User pay - Standard
 *
 * v0.1 - 2016-12-13
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { Icon, Input, Button, Modal, Row, Col, Spin, } from 'antd'
import { loadLoginUserDetail } from '../../../../actions/entities'
import { getWechatPayQrCode, getWechatPayOrder } from '../../../../actions/wechat_pay'
import QRCode from 'qrcode.react'
import './style/balance.less'

class UserPay extends Component {
  constructor(props) {
    super(props)
    this.handlePayClick = this.handlePayClick.bind(this)
    this.showWechatQrCode = this.showWechatQrCode.bind(this)
    this.handleWechatPayCancel = this.handleWechatPayCancel.bind(this)
    this.state = {
      payType: 'alipay', //支付类型
      payStatusModal: false, //充值状态
      payStatusAskModal: false, // 是否支付成功？
      wechatPayModal: false, // 微信充值
      qrCode: {
        url: '',
      },
      amount: 0.01,
      balance: 0,
    }
  }

  changePayType(type) {
    this.setState({ payType: type })
  }

  handlePayClick() {
    const { payType } = this.state
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
    const { amount } = this.state
    this.setState({
      qrCode: {
        url: '',
      }
    })
    getWechatPayQrCode(amount).then(({ response, type }) => {
      const { codeUrl, nonceStr, orderId } = response.result
      this.setState({
        qrCode: {
          url: codeUrl
        }
      })
      this.getOrder && clearInterval(this.getOrder)
      this.getOrder = setInterval(() => {
        getWechatPayOrder(orderId, { nonce_str: nonceStr }).then(({ response, type }) => {
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

  render() {
    let { payType, qrCode, amount, balance } = this.state
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
            研发团队
          </p>
          <p>
            <span className="keys">充值金额</span>
            <Input
             size="large"
             style={{ width: '200px' }}
             placeholder="单笔充值金额最少5元"
             onChange={(e) => {
               this.setState({
                 amount: e.target.value
               })
             }}/>
          </p>
          <p>
            <span className="keys">充值方式</span>
            在线支付
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
            <div className="downRow">线下汇款充值</div>
            <div className="sendInfo">
              Tip: 若您无法通过线上的方式充值，可点击查看详情根据指引申请线下充值
            </div>
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
            }}
            wrapClassName="paySuccessModal"
            okText="继续充值"
            cancelText="查看充值记录" width={490}
            >
            <div className="paySuccess"><Icon type="check" /></div>
            <p className="payText">支付成功</p>
            <br />
            <p>通过{payType === 'alipay' ? `支付宝` : `微信`}向团队 <a>研发团队</a></p>
            <p>充值金额为<span className="success"> {amount}</span>元，当前团队余额为 <a>{balance}</a>元</p>
          </Modal>
          {/* 充值成功 end Modal */}


          {/* 是否支付成功 Modal */}
          <Modal
            title="是否支付成功"
            visible={this.state.payStatusAskModal}
            maskClosable={false}
            onOk={this.handleOk}
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
            okText="支付成功"
            cancelText="支付失败"
            footer={null}
            width={300}
            >
            {
              !qrCode.url
              ? <div className="qrCodeLoading"><Spin  size="large" /></div>
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
  return props
}

export default connect(mapStateToProps, {
  loadLoginUserDetail,
  getWechatPayQrCode,
  getWechatPayOrder,
})(UserPay)
