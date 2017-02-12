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
import { Button, Form, Input, Card, message, Alert, Col, Row } from 'antd'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import Top from '../../components/Top'
import '../Login/Enterprise/style/Login.less'
import { addLicense } from '../../actions/license'
import NotificationHandler from '../../common/notification_handler'

const createForm = Form.create
const FormItem = Form.Item

let Activation = React.createClass({
  getInitialState() {
    return {
      submitting: false,
      loginResult: {},
      intNameFocus: false,
      intPassFocus: false,
      intCheckFocus: false,
      passWord: false,
    }
  },

  handleSubmit(e) {
    e.preventDefault()
    const _this = this
    this.props.form.validateFields((error, value) => {
      if (!!error) {
        return
      }
      _this.props.addLicense({rawlicense: value}, {
        success: {
          func: () => {
            new NotificationHandler().success('激活成功')
            browserHistory.push('/login')
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            new NotificationHandler().error('激活失败', res.message.message)
          }
        }
      })
    })
  },
  checkName(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写激活码')])
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
  render() {
    const { getFieldProps } = this.props.form
    const { submitting, loginResult, submitProps } = this.state
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.checkName },
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
            <Form onSubmit={(e)=> this.handleSubmit(e)}>
              <FormItem
                hasFeedback
                >
                <Input {...nameProps}
                  ref="intName"
                  type="textarea" placeholder="请输入激活码：如XXX-XXX-XXX-XXXX"
                  style={{ maxHeight: 200 , height:200}} />
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

Activation = createForm()(Activation)

Activation = connect(mapStateToProps, {
  addLicense
})(Activation)

export default Activation
