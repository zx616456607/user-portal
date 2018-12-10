/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/* activation page for enterprise
 *
 * v0.1 - 2017-2-8
 * @author BaiYu
 */
import React, { PropTypes } from 'react'
import { Button, Form, Input, Card, message, Alert, Col, Row, Icon, Tooltip, Modal } from 'antd'
import { connect } from 'react-redux'
import QRCode from 'qrcode.react'
import { browserHistory } from 'react-router'
import Top from '../../components/Top'
import '../Login/Enterprise/style/Login.less'
import { addLicense, loadLicensePlatform } from '../../actions/license'
import NotificationHandler from '../../components/Notification'
import Title from '../../components/Title'
import LoginBgV3 from '../Login/Enterprise/LoginBgV3'
import './styles/LogActivation.less'

const createForm = Form.create
const FormItem = Form.Item

let Activation = React.createClass({
  getInitialState() {
    return {
      submitting: false,
      loginResult: {},
      intNameFocus: false,
      copySuccess:false,
      qrCodeModalVisible: false,
    }
  },

  handleSubmit(e) {
    e.preventDefault()
    const _this = this
    this.props.form.validateFields((error, value) => {
      if (!!error) {
        return
      }
      _this.props.addLicense({rawlicense: value.name}, {
        success: {
          func: () => {
            new NotificationHandler().success('激活成功')
            browserHistory.push('/login')
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            new NotificationHandler().error('激活失败', 'License 错误或不可重复添加！')
          }
        }
      })
    })
  },
  checkName(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写许可证')])
      return
    }
    callback()
  },

  componentWillMount() {
    this.props.loadLicensePlatform()
  },

  componentDidMount() {
    this.refs.intName.refs.input.focus()
  },
  copyDownloadCode() {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("CodeInput");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  },
  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function () {
      scope.setState({
        copySuccess: false
      });
    }, 500);
  },
  render() {
    const { platform, form } = this.props
    const { getFieldProps } = form
    const { submitting, loginResult, submitProps } = this.state
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.checkName },
      ],
    })
    const { result } = this.props
    return (
      // <div id="LoginBg">
      <LoginBgV3>
        <Title title="激活" />
        <div className="login LogActivation">
          <div className="loginContent">
          <Row style={{ textAlign: 'center' }}>
            {/* <span className='logoLink'>
              <div className='logTitle'>{result.company.productName}</div>
              <div className=''>技术领先的容器云计算服务商</div>
            </span> */}
            <Top loginLogo={result.loginLogo}/>
          </Row>
          <div className="loginForm" bordered={false}>
            <div>
              {
                loginResult.error && <Alert message={loginResult.error} type="error" showIcon />
              }
            </div>
            <div className="platform"><span className="id">平台ID</span> <span className="platformId textoverflow">{platform.platformid}</span>
              <Tooltip title={this.state.copySuccess ? '复制成功': '点击复制'}>
                <a className={this.state.copySuccess ? "actions copyBtn":"copyBtn"} onClick={()=> this.copyDownloadCode()} onMouseLeave={()=> this.returnDefaultTooltip()}>
                  <Icon type="copy" />
                </a>
              </Tooltip>
              <Tooltip title="查看平台 ID 二维码">
                <a className="copyBtn qrcode">
                  <Icon type="qrcode" onClick={() => this.setState({ qrCodeModalVisible: true })} />
                </a>
              </Tooltip>
              <input className="CodeInput" style={{ position: "fixed", opacity: "0", top:'0'}} value={platform.platformid} />
            </div>
            <Form onSubmit={(e)=> this.handleSubmit(e)}>
              <FormItem>
                <Input {...nameProps}
                  ref="intName"
                  type="textarea" placeholder="请输入许可证"
                  style={{ maxHeight: 180 , height:180}} />
              </FormItem>

              <FormItem wrapperCol={{ span: 24, }}>
                <Button
                  htmlType="submit"
                  type="primary"
                  onClick={(e)=> this.handleSubmit(e)}
                  loading={submitting}
                  className="subBtn">
                  {submitting ? '激活中...' : '激活'}
                </Button>
              </FormItem>
            </Form>
          </div>
        </div>
        </div>
        <div className="LogActivationFooter">
         { result.company.visible ?
            result.company.name
          :null
          }
        </div>
        <Modal
          title="平台 ID 二维码"
          visible={this.state.qrCodeModalVisible}
          wrapClassName="platformid-qrcode-modal"
          onCancel={() => this.setState({ qrCodeModalVisible: false })}
          footer={
            <Button type="primary" size="large" onClick={() => this.setState({ qrCodeModalVisible: false })}>
              确 定
            </Button>
          }
          width={260}
        >
          <QRCode value={platform.platformid} size={200} />
        </Modal>
      </LoginBgV3>
    )
  }
})

function mapStateToProps(state, props) {
  const defaultState = {data: {'platformid': ''}}
  const defaultOemInfo = {
    company:{}
  }
  const {data} = state.license.platform.result || defaultState
  const { result } = state.personalized.info
  return {
   platform: data,
   result: result || defaultOemInfo
  }
}

Activation = createForm()(Activation)

Activation = connect(mapStateToProps, {
  loadLicensePlatform,
  addLicense
})(Activation)

export default Activation
