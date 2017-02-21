/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, Button, Input, Icon, Form } from 'antd'
import './style/Information.less'
import { connect } from 'react-redux'
import { updateUser } from '../../../actions/user'
import { parseAmount } from '../../../common/tools'
import NotificationHandler from '../../../common/notification_handler'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../constants' 

const createForm = Form.create;
const FormItem = Form.Item;

let ResetPassWord = React.createClass({
  getInitialState() {
    return {
      password: 'password',
    }
  },
  handleChange() {
    if (this.state.password === 'text') {
      this.setState({
        password: 'password'
      })
    } else {
      this.setState({
        password: 'text'
      })
    }
  },
  handleCancel(e) {
    e.preventDefault();
    this.props.form.resetFields()
    this.props.onChange()
  },

  handleSubmit(e) {
    const { userID, userDetail } = this.props
    e.preventDefault();
    const noti = new NotificationHandler()
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      noti.spin('修改密码中')
      this.props.updateUser(userID,
        {
          password: values.passwd
        }, {
          success: {
            func: () => {
              noti.close()
              noti.success('密码修改成功')
              this.props.form.resetFields()
              this.props.onChange()
            }
          }
        })
    });
  },
  checkPass(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写密码')])
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
    return callback()
  },
  checkPass2(rule, value, callback) {
    const { getFieldValue } = this.props.form;
    if (value && value !== getFieldValue('passwd')) {
      callback('两次输入密码不一致！');
      return
    }
    return callback()
  },
  componentDidMount(){
    this.refs.intPass.refs.input.focus()
  },
  render: function () {
    const { password } = this.state
    const { getFieldProps } = this.props.form;
    const passwdProps = getFieldProps('passwd', {
      rules: [
        { required: true, whitespace: true, message: '请填写密码' },
        { validator: this.checkPass },
      ],
    });
    const rePasswdProps = getFieldProps('rePasswd', {
      rules: [{
        required: true,
        whitespace: true,
        message: '请再次输入密码',
      }, {
        validator: this.checkPass2,
      }],
    });
    return (
      <div id='UserInfReset'>
        <Form horizontal form={this.props.form}>
          <Row>
            <Col>
              <FormItem hasFeedback>
                <Input type={password} className="passInt" {...passwdProps} placeholder="输入新密码" autoComplete="off" ref='intPass' />
                <Icon type="eye"
                  onClick={this.handleChange} 
                  className={password === 'text' ? 'passIcon' : ''} />
              </FormItem>
            </Col>
          </Row>
          <FormItem hasFeedback>
            <Input type={password} className="passInt" {...rePasswdProps}
              autoComplete="off"
              placeholder="两次输入密码保持一致" />
          </FormItem>
          <FormItem>
            <Button type="ghost" onClick={this.handleCancel} style={{ backgroundColor: '#efefef' }}>
              取消
            </Button>
            &nbsp;&nbsp;&nbsp;
            <Button type="primary" onClick={this.handleSubmit}>确定</Button>
          </FormItem>
        </Form>
      </div>
    )
  }
})
ResetPassWord = createForm()(ResetPassWord);
class Information extends Component {
  constructor(props) {
    super(props)
    this.handleRevise = this.handleRevise.bind(this)
    this.resetPsw = this.resetPsw.bind(this)
    this.state = {
      revisePass: false,
    }
  }
  handleRevise() {
    this.setState({
      revisePass: true
    })
  }
  resetPsw() {
    this.setState({
      revisePass: false
    })
  }
  componentWillMount(){
    const { editPass } = this.props
    this.setState({
      revisePass: editPass
    })
  }
  render() {
    const { revisePass } = this.state
    const { userID, userDetail, updateUser } = this.props

    let roleName
    switch (userDetail.role) {
      case ROLE_TEAM_ADMIN:
        roleName = "团队管理员"
        break
      case ROLE_SYS_ADMIN:
        roleName = "系统管理员"
        break
      default:
        roleName = "普通用户"
    }
    let balance = parseAmount(userDetail.balance || 0).amount
    return (
      <div id='Information'>
        <Row className="Item">
          <Col span={4}>名称</Col>
          <Col span={20}>{userDetail.displayName}</Col>
        </Row>
        <Row className="Item">
          <Col span={4}>类型</Col>
          <Col span={20}>{roleName}</Col>
        </Row>
        <Row className="Item">
          <Col span={4}>手机</Col>
          <Col span={20}>{userDetail.phone}</Col>
        </Row>
        <Row className="Item">
          <Col span={4}>邮箱</Col>
          <Col span={20}>{userDetail.email}</Col>
        </Row>
        <Row className="Item">
          <Col span={4}>修改密码</Col>
          <Col span={20}>
            {
              revisePass ?
                <ResetPassWord updateUser={updateUser} userID={userID} userDetail={userDetail} onChange={this.resetPsw} />
                :
                <Button type="primary" onClick={this.handleRevise}>修改密码</Button>
            }
          </Col>
        </Row>
        <Row className="Item" style={{ border: 'none' }}>
          <Col span={4}>余额</Col>
          <Col span={20}>{balance}T</Col>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state, props) {

  return {

  }
}

export default connect(mapStateToProp, {
  updateUser,
})(Information)
