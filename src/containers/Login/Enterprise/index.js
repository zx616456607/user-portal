/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/* Login page for enterprise
 *
 * v0.1 - 2016-11-16
 * @author Zhangpc
 */
import React, { PropTypes } from 'react'
import { Button, Form, Input, Card, message, Alert, Col, Row } from 'antd'
import './style/Login.less'
import { verifyCaptcha, login } from '../../../actions/entities'
import { connect } from 'react-redux'
import { USERNAME_REG_EXP_NEW, EMAIL_REG_EXP } from '../../../constants'
import { browserHistory } from 'react-router'
import { genRandomString } from '../../../common/tools'
import ReactDom from 'react-dom'
import Top from '../../../components/Top'

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
      intCheckFocus: false,
      passWord: false,
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
        captcha: values.captcha
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
            var msg = err.message.message || err.message
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
            self.changeCaptcha()
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

  checkCaptcha(rule, value, callback) {
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
  },

  changeCaptcha() {
    const { resetFields, getFieldProps } = this.props.form
    const captcha = getFieldProps('captcha').value
    if (captcha) {
      resetFields(['captcha'])
    }
    this.setState({
      random: genRandomString(),
    })
  },

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
    if (current === 'check') {
      let captcha = getFieldProps('captcha').value
      if (captcha === '' || !captcha) {
        this.setState({
          intCheckFocus: false
        })
      }
    }
    return
  },

  intOnFocus(current) {
    if (current === 'name') {
      this.refs.intName.refs.input.focus()
      this.setState({
        intNameFocus: true
      })
    } else if (current === 'pass') {
      this.refs.intPass.refs.input.focus()
      this.setState({
        intPassFocus: true,
        passWord: true,
      })
    } else if (current === 'check') {
      this.refs.intCheck.refs.input.focus()
      this.setState({
        intCheckFocus: true
      })
    }
  },

  componentWillMount() {
    const { resetFields } = this.props.form
    resetFields()
    // ReactDom.findDOMNode(this.refs.intName.refs.input).focus
  },

  componentDidMount() {
    ReactDom.findDOMNode(this.refs.intName.refs.input).focus()
  },
  render() {
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const { random, submitting, loginResult, submitProps } = this.state
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.checkName },
      ],
      getValueProps: () => {}, // Avoid show password in html element
    })
    const passwdProps = getFieldProps('password', {
      rules: [
        { validator: this.checkPass },
      ],
    })
    // const captchaProps = getFieldProps('captcha', {
    //   rules: [
    //     { required: true, message: '请填写验证码' },
    //     { validator: this.checkCaptcha },
    //   ],
    // })
    const formItemLayout = {
      wrapperCol: { span: 24 },
    }
    return (
      <div id="LoginBg">
        <Top/>
        <div className="login">
          <Row style={{ textAlign: 'center' }}>
            <span className='logoLink'>
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

                <Input {...nameProps}
                  autoComplete="off"
                  onBlur={this.intOnBlur.bind(this, 'name')}
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
                <Input {...passwdProps} autoComplete="on" type='password'
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
          </Card>
        </div>
        <div className="footer">
          © 2017 北京云思畅想科技有限公司 &nbsp;|&nbsp; 时速云企业版 v2.0
          </div>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const { redirect } = props.location.query
  return {
    redirect
  }
}

Login = createForm()(Login)

Login = connect(mapStateToProps, {
  verifyCaptcha,
  login,
})(Login)

export default Login
