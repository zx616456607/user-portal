/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/* Login page for standard
 *
 * v0.1 - 2016-11-16
 * @author Zhangpc
 */
import React, { PropTypes } from 'react'
import { Button, Form, Input, Card, Tooltip, message, Alert, Col, Row, Spin, } from 'antd'
import './style/Login.less'
import { login } from '../../../actions/entities'
import { connect } from 'react-redux'
import { USERNAME_REG_EXP_NEW, EMAIL_REG_EXP } from '../../../constants'
import { browserHistory } from 'react-router'
import { genRandomString } from '../../../common/tools'
import { Link } from 'react-router'
import LogInLogo from '../../../assets/img/sider/LogInLogo.svg'
import loginMethodWeixinPNG from '../../../assets/img/loginMethodWeixin.png'
import ReactDom from 'react-dom'
import Top from '../../../components/Top'
import WechatQRCodeTicket from '../../../components/WechatQRCodeTicket'

const createForm = Form.create
const FormItem = Form.Item

function noop() {
  return false
}

let Login = React.createClass({
  getInitialState() {
    return {
      random: genRandomString(),
      submitting: false,
      loginResult: {},
      submitProps: {},
      intNameFocus: false,
      intPassFocus: false,
      // intCheckFocus: false,
      passWord: false,
      // intCodeFocus: false,
      loginSucess: false,
    }
  },

  handleSubmit(e) {
    e.preventDefault()
    const { login, form, redirect } = this.props
    const { validateFields, resetFields } = form
    const self = this
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        submitting: true,
        submitProps: {
          disabled: 'disabled'
        }
      })
      const body = {
        password: values.password,
        // captcha: values.captcha,
        // inviteCode : values.code,
      }
      if (values.name.indexOf('@') > -1) {
        body.email = values.name
      } else {
        body.username = values.name
      }
      login(body, {
        success: {
          func: (result) => {
            self.setState({
              submitting: false,
              loginSucess: true,
              submitProps: {},
            })
            message.success(`用户 ${values.name} 登录成功`)
            browserHistory.push(redirect || '/')
            resetFields()
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            let msg = err.message.message || err.message
            if (err.statusCode === 401 && err.message === 'NOT_ACTIVE' && err.email && err.code) {
              browserHistory.push(`/signup?email=${err.email}&code=${err.code}&msg=${err.message}`)
              resetFields()
              return
            }
            /*if (err.statusCode === 403 && err.message.message === 'NOT_INVITED') {
              msg = "邀请码无效"
            }*/
            if (err.statusCode == 401) {
              msg = "用户名或者密码错误"
            }
            self.setState({
              submitting: false,
              loginResult: {
                error: msg
              },
              submitProps: {},
            })
            // self.changeCaptcha()
            resetFields(['password'])
          },
          isAsync: true
        },
      })
    })
  },

  checkName(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写用户名')])
      return
    }
    if (value.indexOf('@') > -1) {
      if (!EMAIL_REG_EXP.test(value)) {
        callback([new Error('邮箱地址填写错误')])
        return
      }
      callback()
      return
    }
    callback()
  },

  checkPass(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    callback()
  },
  /*checkCode(rule, value, callback) {
    if (value.length > 20) {
      callback([new Error('邀请码无效')])
      return
    }
    callback()
  },*/
  /*checkCaptcha(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    const { verifyCaptcha } = this.props
    if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
      callback([new Error('验证码输入错误')])
      return
    }
    verifyCaptcha(value, {
      success: {
        func: (result) => {
          if (!result.correct) {
            callback([new Error('验证码输入错误')])
            return
          }
          callback()
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          callback([new Error('校验错误')])
        },
        isAsync: true
      },
    })
  },*/

  /*changeCaptcha() {
    const { resetFields, getFieldProps } = this.props.form
    const captcha = getFieldProps('captcha').value
    if (captcha) {
      resetFields(['captcha'])
    }
    this.setState({
      random: genRandomString(),
    })
  },*/

  intOnBlur(current) {
    const { getFieldProps } = this.props.form
    if (current === 'name') {
      let name = getFieldProps('name').value
      if (name === '' || !name) {
        this.setState({
          intNameFocus: false
        })
      }
      return
    }
    if (current === 'pass') {
      let password = getFieldProps('password').value
      if (password === '' || !password) {
        this.setState({
          intPassFocus: false,
          passWord: true,
        })
      }
      return
    }
    /*if (current === 'code') {
      let code = getFieldProps('code').value
      if (code === '' || !code) {
        this.setState({
          intCodeFocus: false
        })
      }
      return
    }*/
    /*if (current === 'check') {
      let captcha = getFieldProps('captcha').value
      if (captcha === '' || !captcha) {
        this.setState({
          intCheckFocus: false
        })
      }
    }*/
    return
  },

  intOnFocus(current) {
    if (current === 'name') {
      this.refs.intName.refs.input.focus()
      this.setState({
        intNameFocus: true
      })
      return
    }
    if (current === 'pass') {
      this.refs.intPass.refs.input.focus()
      this.setState({
        intPassFocus: true,
        passWord: true,
      })
      return
    }
    /*if (current === 'code') {
      this.refs.intCode.refs.input.focus()
      this.setState({
        intCodeFocus: true,
      })
      return
    }*/
    /*if (current === 'check') {
      this.refs.intCheck.refs.input.focus()
      this.setState({
        intCheckFocus: true
      })
    }*/
    return
  },

  componentWillMount() {
    const { resetFields } = this.props.form
    const { from } = this.props
    if (from === 'active') {
      message.success('帐户已经激活')
    }
    resetFields()

  },

  componentDidMount() {
    ReactDom.findDOMNode(this.refs.intName.refs.input).focus()
  },

  onScanChange(scan) {
    const self = this
    self.setState({
      submitting: true,
    })
    const { login, redirect } = this.props
    const body = {
      accountType: 'wechat'
    }
    login(body, {
      success: {
        func: (result) => {
          self.setState({
            submitting: false,
            loginSucess: true,
          })
          message.success(`用户 ${result.user.userName} 登录成功`)
          browserHistory.push(redirect || '/')
          resetFields()
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          const { statusCode } = err
          const errMsg = err.message
          let msg = errMsg.message || errMsg
          if (statusCode == 404) {
            msg = '您的微信还未绑定时速云平台账户，请使用账户密码登录后，在“我的账户”中进行绑定'
          }
          self.setState({
            submitting: false,
            loginResult: {
              error: msg
            },
            submitProps: {},
          })
        },
        isAsync: true
      },
    })
  },

  render() {
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const { random, submitting, loginResult, submitProps, loginSucess } = this.state
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.checkName },
      ],
    })
    const passwdProps = getFieldProps('password', {
      rules: [
        { validator: this.checkPass },
      ],
    })
    /*const codeProps = getFieldProps('code', {
      rules: [
        { required: false, message: '请填写邀请码' },
        { validator: this.checkCode },
      ],
    })*/
    /*const captchaProps = getFieldProps('captcha', {
      rules: [
        { required: true, message: '请填写验证码' },
       { validator: this.checkCaptcha },
      ],
    })*/
    const formItemLayout = {
      wrapperCol: { span: 24 },
    }
    // 登录成功显示加载动画
    if (loginSucess) {
      return (
        <div className="loading">
          <Spin size="large" />
        </div>
      )
    }
    return (
      <div id="LoginBgStd">
        <Top/>
        <div className="login">
          <Row style={{ textAlign: 'center' }}>
            <span className='logoLink'>

              {/*<img src="/img/sider/LogInLogo.svg" alt="logo" className="logo" />*/}
              {/*<img src={LogInLogo} alt="logo" className="logo" />*/}

              {/*<div className='logTitle'>时速云</div>
              <div className="logtext" style={{ fontSize: '14px' }}>技术领先的容器云计算服务商</div>*/}

              <div className='logTitle'>登&nbsp;&nbsp;录</div>
            </span>
          </Row>
          <Card className="loginForm" bordered={false}>
            <div>
              {
                loginResult.error && <Alert message={loginResult.error} type="error" showIcon />
              }
            </div>
            <Form onSubmit={this.handleSubmit}>
              <input style={{ display: 'none' }} />
              <FormItem
                {...formItemLayout}
                hasFeedback
                help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
                className="formItemName"
                >
                <div className={this.state.intNameFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'name')}>用户名 / 邮箱</div>

                <Input {...nameProps} autoComplete="off" onBlur={this.intOnBlur.bind(this, 'name')}
                  onFocus={this.intOnFocus.bind(this, 'name')}
                  ref="intName"
                  style={{ height: 35 }} />
              </FormItem>

              <FormItem
                {...formItemLayout}
                hasFeedback
                className="formItemName"
                >
                <div className={this.state.intPassFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'pass')}>密码</div>
                <Input {...passwdProps} autoComplete="off" type={this.state.passWord ? 'password' : 'text'}
                  onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                  onBlur={this.intOnBlur.bind(this, 'pass')}
                  onFocus={this.intOnFocus.bind(this, 'pass')}
                  ref="intPass"
                  style={{ height: 35 }}
                  />
              </FormItem>

              {/*<FormItem
                {...formItemLayout}
                hasFeedback
                className="formItemName"
                >
                <div className={this.state.intCodeFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'code')}>
                  邀请码（若已经输入过，请忽略）
                </div>
                <Input {...codeProps} autoComplete="off"
                  onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                  onBlur={this.intOnBlur.bind(this, 'code')}
                  onFocus={this.intOnFocus.bind(this, 'code')}
                  ref="intCode"
                  style={{ height: 35 }}
                  />
              </FormItem>*/}

              {/*<FormItem
                {...formItemLayout}
                hasFeedback
                className="formItemName"
                help={isFieldValidating('captcha') ? '校验中...' : (getFieldError('captcha') || []).join(', ')}
                >
                <div className={this.state.intCheckFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'check')}>验证码</div>
                <Input {...captchaProps} autoComplete="off" onBlur={this.intOnBlur.bind(this, 'check')}
                  onFocus={this.intOnFocus.bind(this, 'check')}
                  ref="intCheck"
                  style={{ height: 35 }} />
                <Tooltip placement="top" title="点击更换">
                  <img className="captchaImg" src={`/captcha/gen?_=${random}`} onClick={this.changeCaptcha} />
                </Tooltip>
              </FormItem>*/}

              <FormItem wrapperCol={{ span: 24, }}>
                <Button
                  htmlType="submit"
                  type="primary"
                  onClick={this.handleSubmit}
                  loading={submitting}
                  {...submitProps}
                  className="subBtn">
                  {submitting ? '登录中...' : '登录'}
                </Button>
              </FormItem>
            </Form>
            <div className='logInFooter'>
                <div className='footerTip'>
                <div className='toRegister'>
                  <span>*&nbsp;还没有时速云帐户?</span>
                  <Link to='/signup'>立即注册</Link>
                </div>
                <div className='toReset'>
                  <Link to='/rpw'>忘记密码</Link>
                </div>
              </div>
              <div className='moreMethod'>
                <div className='methodTitle'>
                  <div className='line'></div>
                  <div className='methodText'>更多登录方式</div>
                  <div className='line'></div>
                </div>
                <div className="methodIcon">
                  <div className='weixin'>
                    <WechatQRCodeTicket
                      message="微信扫一扫立即登录"
                      triggerElement={<img src={loginMethodWeixinPNG}/>}
                      getTooltipContainer={() => document.getElementById('LoginBgStd')}
                      onScanChange={this.onScanChange} />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="footer">
          © 2017 时速云 京ICP备14045471号
        </div>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const { redirect, from } = props.location.query
  return {
    redirect,
    from,
  }
}

Login = createForm()(Login)

Login = connect(mapStateToProps, {
  login,
})(Login)

export default Login