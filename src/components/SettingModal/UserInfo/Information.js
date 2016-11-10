/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, {Component} from 'react'
import { Row, Col, Card, Button, Input, Icon, Form } from 'antd'
import './style/Information.less'
import { connect } from 'react-redux'
import { loadUserDetail, loadUserList, updateUser } from '../../../actions/user'

const createForm = Form.create;
const FormItem = Form.Item;

let ResetPassWord = React.createClass({
  getInitialState(){
    return {
      password: 'password',
    }
  },
  handleChange(){
    if(this.state.password === 'text'){
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
    const { userDetail } = this.props
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      console.log(values);
      this.props.updateUser(userDetail.userID,
        {
          password: values.passwd
        },{
          success: {
            func: () => {
              console.log('Submit!!!');
              this.props.form.resetFields()
              this.props.onChange()
            }
          }
        })
    });
  },
  checkPass(rule, value, callback) {
    const { validateFields } = this.props.form;
    if (value) {
      validateFields(['rePasswd'], { force: true });
    }
    callback();
  },
  
  checkPass2(rule, value, callback) {
    const { getFieldValue } = this.props.form;
    if (value && value !== getFieldValue('passwd')) {
      callback('两次输入密码不一致！');
    } else {
      callback();
    }
  },
  
  render: function(){
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
      <div id='ResetPassWord'>
        <Form horizontal form={this.props.form}>
          <Row>
            <Col>
              <FormItem hasFeedback>
                <Input type={password} className="passInt" {...passwdProps} autoComplete="off"/>
                <Icon type="eye"
                      onClick={this.handleChange}
                      className={password === 'text' ? 'passIcon':''}/>
              </FormItem>
            </Col>
            
          </Row>
          <FormItem hasFeedback>
            <Input type={password} className="passInt" {...rePasswdProps}
                   autoComplete="off"
                   placeholder="两次输入密码保持一致"/>
          </FormItem>
          <FormItem>
            <Button type="ghost" onClick={this.handleCancel} style={{backgroundColor: '#efefef'}}>
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
class Information extends Component{
  constructor(props){
    super(props)
    this.handleRevise = this.handleRevise.bind(this)
    this.resetPsw = this.resetPsw.bind(this)
    this.state = {
      revisePass: false,
    }
  }
  handleRevise(){
    this.setState({
      revisePass: true
    })
  }
  resetPsw(){
    this.setState({
      revisePass:false
    })
  }
  componentDidMount() {
    this.props.loadUserDetail("default")
  }

  render(){
    const { revisePass } = this.state
    const { userDetail,updateUser } = this.props
    
    let roleName
    switch (userDetail.role) {
      case 1:
        roleName = "团队管理员"
        break
      case 2:
        roleName = "系统管理员"
        break
      default:
        roleName = "普通用户"
    }
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
                <ResetPassWord updateUser={updateUser} userDetail={userDetail} onChange={this.resetPsw}/>
                :
                <Button type="primary" onClick={this.handleRevise}>修改密码</Button>
            }
          </Col>
        </Row>
        <Row className="Item" style={{border:'none'}}>
          <Col span={4}>余额</Col>
          <Col span={20}>{userDetail.balance}T</Col>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state) {
  let userDetailData = {
    displayName: "",
    role: 0,
    phone: "",
    email: "",
    balance: 0,
    userID: '',
  }
  const {userDetail} = state.user
  if (userDetail.result && userDetail.result.data) {
    userDetailData = userDetail.result.data
  }

  return {
    userDetail: userDetailData
  }
}

export default connect(mapStateToProp, {
  loadUserDetail,
  updateUser,
})(Information)