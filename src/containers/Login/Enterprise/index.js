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
import { Button, Form, Input, Card, message, Alert, Col, Row, Icon } from 'antd'
import './style/Login.less'
import { verifyCaptcha, login } from '../../../actions/entities'
import { connect } from 'react-redux'
import { USERNAME_REG_EXP_NEW, EMAIL_REG_EXP } from '../../../constants'
import { NO_CLUSTER_FLAG, CLUSTER_PAGE, INTL_COOKIE_NAME } from '../../../../constants'
import { loadMergedLicense } from '../../../actions/license'
import { isAdminPasswordSet } from '../../../actions/admin'
import { browserHistory } from 'react-router'
import { genRandomString, clearSessionStorage, setCookie } from '../../../common/tools'
import Top from '../../../components/Top'
import { camelize } from 'humps'
import { getPersonalized } from '../../../actions/personalized'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessages from './Intl'
import LoginBgV3 from './LoginBgV3'

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
    if (this.state.outdated) {
      browserHistory.push('activation')
      return
    }
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        submitting: true,
        loginResult: {},
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
      const { intl } = this.props
      login(body, {
        success: {
          func: (result) => {
            self.setState({
              submitting: false,
              submitProps: {},
            })
            // If no cluster found, redirect to CLUSTER_PAGE
            if (result.user[camelize(NO_CLUSTER_FLAG)] === true) {
              message.warning(intl.formatMessage(IntlMessages.tipsFailedInit), 10)
              browserHistory.push(CLUSTER_PAGE)
              return
            }
            message.success(intl.formatMessage(IntlMessages.tipsSuccess, { username: values.name }))
            browserHistory.push(redirect || '/')
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            let msg = err.message.message || err.message
            let outdated = false
            if (err.statusCode == 406) {
              message.warn(intl.formatMessage(IntlMessages.tipsFailedChangePwd))
              const { email, verifyCode } = err.message.data
              browserHistory.push(`/rpw?email=${email}&code=${verifyCode}&from=login`)
              return
            }
            if (err.statusCode == 401) {
              msg = intl.formatMessage(IntlMessages.tipsFailed)
            }
            if (err.statusCode == 403
              && err.message
              && err.message.message === 'user was not activated'
            ) {
              msg = intl.formatMessage(IntlMessages.tipsFailedBlock)
            }
            if (err.statusCode == 451) {
              msg = null,
              outdated = true //show error and not allow login
            }
            self.setState({
              submitting: false,
              outdated,
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
    const { intl } = this.props
    if (!value) {
      callback([new Error(intl.formatMessage(IntlMessages.inputTipsUser))])
      return
    }
    if (value.indexOf('@') > -1) {
      if (!EMAIL_REG_EXP.test(value)) {
        callback([new Error(intl.formatMessage(IntlMessages.inputTipsEmail))])
        return
      }
      callback()
      return
    }
    callback()
  },

  checkPass(rule, value, callback) {
    const { intl } = this.props
    if (!value) {
      callback([new Error(intl.formatMessage(IntlMessages.inputTipsPassword))])
      return
    }
    callback()
  },

  /* checkCaptcha(rule, value, callback) {
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
  }, */

  /* changeCaptcha() {
    const { resetFields, getFieldProps } = this.props.form
    const captcha = getFieldProps('captcha').value
    if (captcha) {
      resetFields(['captcha'])
    }
    this.setState({
      random: genRandomString(),
    })
  }, */

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
    // Clear sessionStorage when login
    clearSessionStorage()
    this.props.getPersonalized()
    const { resetFields } = this.props.form
    resetFields()
    const _this = this
    this.props.isAdminPasswordSet({
      success: {
        func: (res) => {
          if (!res.isAdminPasswordSet) {
            browserHistory.push('/password')
            return
          }
          _this.props.loadMergedLicense({
            success: {
              func: (res) => {
                let outdated = false
                if (!res.data) {
                  outdated = true //show error and not allow login
                } else {
                  const { licenseStatus, leftTrialDays } = res.data
                  if (licenseStatus == 'EXPIRED') {
                    outdated = true
                  }
                  if (licenseStatus == 'NO_LICENSE' && Math.floor(leftTrialDays *10) /10 <= 0) {
                    outdated = true //show error and not allow login
                  }
                  if (licenseStatus == 'VALID' && Math.floor(res.data.leftLicenseDays *10) /10 <= 0) {
                    outdated = true //show error and not allow login
                  }
                }
                _this.setState({
                  outdated
                })
              }
            }
          })
          setTimeout(function(){
            const intName = _this.refs.intName.refs.input
            intName.focus()
            if (intName.value) {
              _this.setState({
                intNameFocus: true,
                intPassFocus: true
              })
            }
          },500)
        },
        isAsync: true
      },
      failed: {
        func: () => {
          const { intl } = this.props
          message.warning(intl.formatMessage(IntlMessages.serviceUnavailable), 10)
          setTimeout(function(){
            const intName = _this.refs.intName.refs.input
            intName.focus()
            if (intName.value) {
              _this.setState({
                intNameFocus: true,
                intPassFocus: true
              })
            }
          },500)
        }
      }
    })
  },

  componentDidMount(){
    setTimeout(() => {
      document.getElementById('name')? document.getElementById('name').focus():''
    }, 1000)
  },

  handleNameInputEnter(e){
    e.preventDefault();
    const { form } = this.props
    const { getFieldValue } = form
    let userName = getFieldValue('name')
    if(!userName){
      document.getElementById('name').focus()
      return
    }
    if(userName){
      document.getElementById('password').focus()
    }
  },
  copyright(info) {
    if (info.company) {
      if (info.company.visible) {
        return info.company.name
      }
    }
    return
  },
  changeLang(lang) {
    setCookie(INTL_COOKIE_NAME, lang)
    location.reload()
  },
  render() {
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const { random, submitting, loginResult, submitProps } = this.state
    const { info } = this.props
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
    // this.state.outdated = true
    return (
      <LoginBgV3>
          {this.state.outdated ?
            <div className="LoginerrorText">
              <FormattedMessage {...IntlMessages.licenseExpired} />
              <span className="goActive" onClick={()=> browserHistory.push("/activation")}>
                <FormattedMessage {...IntlMessages.licenseInputRequired} />
              </span>
              <FormattedMessage {...IntlMessages.licenseExplore} />
            </div>
          : null
          }
        <div className="login" >
          <div className="loginContent">
          <Row style={{ textAlign: 'center' }}>
            {/* <span className='logoLink'>
              <div className='logTitle'>
                <FormattedMessage {...IntlMessages.login} />
              </div>
            </span> */}
            <Top loginLogo={info.loginLogo} />
          </Row>
          <Card className="loginForm" bordered={false}>
            <div>
              {
                !submitting && loginResult.error && <Alert message={loginResult.error} type="error" showIcon />
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
                {/* <div
                  className={this.state.intNameFocus ? "intName intOnFocus" : "intName"}
                  onClick={this.intOnFocus.bind(this, 'name')}
                >
                  <FormattedMessage {...IntlMessages.usernameOrEmail} />
                </div> */}

                <Input {...nameProps}
                  autoComplete="on"
                  onBlur={this.intOnBlur.bind(this, 'name')}
                  onFocus={this.intOnFocus.bind(this, 'name')}
                  ref="intName"
                  onPressEnter={this.handleNameInputEnter}
                  style={{ height: 35 }}
                  placeholder="用户名 / 邮箱"
                  />
              </FormItem>

              <FormItem
                {...formItemLayout}
                hasFeedback
                className="formItemName"
                >
                {/* <div
                  className={this.state.intPassFocus ? "intName intOnFocus" : "intName"}
                  onClick={this.intOnFocus.bind(this, 'pass')}
                >
                  <FormattedMessage {...IntlMessages.password} />
                </div> */}
                <Input {...passwdProps} autoComplete="on" type='password'
                  onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                  onBlur={this.intOnBlur.bind(this, 'pass')}
                  onFocus={this.intOnFocus.bind(this, 'pass')}
                  ref="intPass"
                  style={{ height: 35 }}
                  placeholder="密码"
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
                {this.state.outdated ?
                  <Button
                    type="primary"
                    onClick={()=> browserHistory.push('activation')}
                    {...submitProps}
                    className="subBtn"
                  >
                    <FormattedMessage {...IntlMessages.licenseGoaActivate} />
                  </Button>
                :
                <Button
                  htmlType="submit"
                  type="primary"
                  onClick={this.handleSubmit}
                  loading={submitting}
                  {...submitProps}
                  className="subBtn"
                >
                  <FormattedMessage {...IntlMessages.login} />
                </Button>
                }
              </FormItem>
            </Form>
          </Card>
        </div>
        </div>
        <Row className="footer">
          <span className="copyright" span={12}>
            {this.copyright(info)}
          </span>
          <span className="langSwitch" span={12}>
            <span className="lang" onClick={() => this.changeLang('zh')}>
            简体中文
            </span>
            <span>∙</span>
            <span className="lang" onClick={() => this.changeLang('en')}>
            English
            </span>
          </span>
        </Row>
      </LoginBgV3>
    )
  }
})

function mapStateToProps(state, props) {
  const { redirect } = props.location.query
  const { personalized } = state
  const { info } = personalized || {}
  return {
    info: info.result || {},
    redirect
  }
}

Login = createForm()(Login)

Login = connect(mapStateToProps, {
  verifyCaptcha,
  login,
  loadMergedLicense,
  isAdminPasswordSet, // check whether the 'admin' user's password was set
  getPersonalized
})(Login)

export default injectIntl(Login, {
  withRef: true,
})
