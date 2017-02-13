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
import { setAdminPassword } from '../../actions/license'
import { browserHistory } from 'react-router'
import NotificationHandler from '../../common/notification_handler'

const createForm = Form.create
const FormItem = Form.Item

let Admin = React.createClass({
  getInitialState() {
    return {
      submitting: false,
      loginResult: {},
      submitProps: {},
      intNameFocus: false,
      intPassFocus: false,
      intCheckFocus: false,
      passWord: false,
    }
  },


  checkName(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    callback()
  },

  componentWillMount() {
    const { resetFields } = this.props.form
    resetFields()
  },

  componentDidMount() {
    this.refs.intName.refs.input.focus()
  },
  handleSubmit(e) {
    e.preventDefault()
    const _this = this
    this.props.form.validateFields((error, value) => {
      if (!!error) {
        return
      }
      _this.props.setAdminPassword(value, {
        success: {
          func: () => {
            new NotificationHandler().success('设置成功')
            browserHistory.push('/')
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            new NotificationHandler().error('设置失败', res.message.message)
          }
        }
      })
    })
  },
  render() {
    const { getFieldProps } = this.props.form
    const { submitting, loginResult, submitProps } = this.state
    const nameProps = getFieldProps('password', {
      rules: [
        { validator: this.checkName },
      ],
    })

    return (
      <div id="LoginBg">
        <Top/>
        <div className="login" style={{width:350}}>
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
                <Input {...nameProps}
                  ref="intName" placeholder="首次登录，请设置密码" />
              </FormItem>

              <FormItem wrapperCol={{ span: 24, }}>
                <Button
                  htmlType="submit"
                  type="primary"
                  onClick={this.handleSubmit}
                  loading={submitting}
                  {...submitProps}
                  className="subBtn">
                  {submitting ? '正在执行...' : '登录'}
                </Button>
              </FormItem>
            </Form>
          </Card>
        </div>
        </div>
        <div className="footer">
          © 2017 北京云思畅想科技有限公司 &nbsp;|&nbsp; 时速云企业版 v2.0
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
  setAdminPassword
})(Admin)

export default Admin
