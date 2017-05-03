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
import { Button, Form, Input, Card, message, Alert, Col, Row, Icon } from 'antd'
import { connect } from 'react-redux'
import { USERNAME_REG_EXP_NEW, EMAIL_REG_EXP } from '../../constants'
import Top from '../../components/Top'
import '../Login/Enterprise/style/Login.less'
import { setAdminPassword } from '../../actions/admin'
import { login } from '../../actions/entities'
import { browserHistory } from 'react-router'
import NotificationHandler from '../../common/notification_handler'

const createForm = Form.create
const FormItem = Form.Item

let Admin = React.createClass({
  getInitialState() {
    return {
      submitting: false,
      loginResult: {},
      intNameFocus: false,
      intPassFocus: false,
      intCheckFocus: false,
    }
  },


  checkPass(rule, value, callback) {
    const { validateFields } = this.props.form;
    if (!value) {
      callback()
      return
    }
    if (value.length < 6 || value.length > 16) {
      callback([new Error('长度为6~16个字符')])
      return
    }
    if (/^[^0-9]+$/.test(value) || /^[^a-zA-Z]+$/.test(value)) {
      callback([new Error('密码必须包含数字和字母,长度为6~16个字符')])
      return
    }
    if (value) {
      validateFields(['rePassword'], { force: true });
    }
    callback()
  },
  checkPass2(rule, value, callback) {
    const { getFieldValue } = this.props.form;
    if (value && value !== getFieldValue('password')) {
      callback('两次填写密码不一致！');
    } else {
      callback();
    }
  },
  componentWillMount() {
    const { resetFields } = this.props.form
    resetFields()
  },

  componentDidMount() {
    const _this = this
    setTimeout(function(){
      document.getElementById('password').focus()
    }, 300)
  },
  handleSubmit(e) {
    e.preventDefault()
    const _this = this
    this.props.form.validateFields((error, value) => {
      if (!!error) {
        return
      }
      _this.setState({submitting: true})
      _this.props.setAdminPassword({password: value.password}, {
        success: {
          func: () => {
            const body = {
              password: value.password,
              username: 'admin'
            }
            _this.props.login(body, {
              success: {
                func: () => {
                  new NotificationHandler().success('用户admin设置并登录成功')
                  browserHistory.push('/')
                },
                isAsync: true
              },
              failed: {
                func: (err) => {
                  let msg = err.message.message || err.message
                  new NotificationHandler().error('登录失败', msg)
                  }
              }
            })
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            _this.setState({
              submitting: false,
              loginResult: {
                error: res.message || res.message.message
              }
            })
            new NotificationHandler().error('设置失败', res.message.message)
          }
        }
      })
    })
  },
  render() {
    const { getFieldProps } = this.props.form
    const { submitting, loginResult } = this.state
    const nameProps = getFieldProps('password', {
      rules: [
        { required: true, whitespace: true, message: '请填写密码' },
        { validator: this.checkPass },
      ],
    })
    const againProps = getFieldProps('rePassword', {
      rules: [
        {required: true, whitespace: true, message: '请再次填写密码'},
        { validator: this.checkPass2 },
      ],
    })

    return (
      <div id="LoginBg">
        <Top/>
        <div className="login">
          <div className="loginContent">
          <Row style={{ textAlign: 'center' }}>
            <span className='logoLink'>
              <div className='logTitle'>时速云</div>
              <div className=''>技术领先的容器云计算服务商</div>
            </span>
          </Row>
          <Card className="loginForm" bordered={false}>
            <div>
              {
                loginResult.error && <Alert message={loginResult.error} type="error" showIcon />
              }
            </div>
            <Form onSubmit={this.handleSubmit}>
              <FormItem>
                <Input value="admin" disabled/>
              </FormItem>
              <FormItem>
                <Input {...nameProps} type="password"
                  placeholder="首次登录，请设置密码" />
              </FormItem>
              <FormItem>
                <Input {...againProps} type="password" placeholder="确认密码" />
              </FormItem>
              <FormItem wrapperCol={{ span: 24, }}>
                <Button
                  htmlType="submit"
                  type="primary"
                  onClick={this.handleSubmit}
                  loading={submitting}
                  className="subBtn">
                  {submitting ? '正在执行...' : '设置并登录'}
                </Button>
              </FormItem>
            </Form>
          </Card>
        </div>
        </div>
        <div className="footer">
          © 2017 北京云思畅想科技有限公司 &nbsp;|&nbsp; 时速云企业版 v2.1.0
          </div>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  return {
   
  }
}

Admin = createForm()(Admin)

Admin = connect(mapStateToProps, {
  login,
  setAdminPassword
})(Admin)

export default Admin
