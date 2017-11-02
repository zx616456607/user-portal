/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: create service
 *
 * v0.1 - 2017-07-18
 * @author ZhangXuan
 */

import React,{ Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Card, Row, Col, Form, Input, Button, Checkbox, Collapse, Icon  } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/traditionEnv.less'
const FormItem = Form.Item;
const ButtonGroup = Button.Group;
import { checkVMUser } from '../../../../actions/vm_wrap'

class TraditionEnv extends Component{
  constructor(props) {
    super(props)
    this.state = {
      Prompt: undefined,
      isShow: false,
      loading: false
    }
  }
  checkHost(rules,value,callback) {
    const { scope } = this.props;
    let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    if (!value) {
      callback([new Error('请填写IP')])
      return
    }
    if (reg.test(value) !== true) {
      callback([new Error('请输入正确IP地址')])
      return
    }
    scope.setState({
      host:value
    })
    return callback()
  }
  checkName(rules,value,callback) {
    const { scope } = this.props;
    if (!value) {
      return callback('请填写账号')
    }
    scope.setState({
      account:value
    })
    return callback()
  }
  checkPass(rules,value,callback) {
    const { scope } = this.props;
    if (!value) {
      return callback('请填写密码')
    }
    scope.setState({
      password:value
    })
    return callback()
  }
  checkUser(){
    const { form,checkVMUser } = this.props
    const { validateFields, getFieldsValue } = form
    validateFields(['envIP','userName','password'],(errors,values)=>{
      if (!!errors) {
        return
      }
      let info = getFieldsValue()
      this.setState({
        isShow: true,
        loading: true
      })
      let infos = {
        host: info.envIP,
        account: info.userName,
        password: info.password
      }
      checkVMUser(infos,{
        success: {
          func: res => {
            console.log(res)
            if(res.statusCode === 200){
              this.setState({
                Prompt: true,
                loading: false
              },()=>{
                this.successTime = setTimeout(()=>{
                  this.setState({
                    isShow: false,
                    Prompt: undefined
                  })
                },3000)
              })
            }
          },
          isAsync: true
        },
        failed: {
          func: err => {
            this.setState({
              Prompt: false,
              loading: false
            },()=>{
              this.failedTime = setTimeout(()=>{
                this.setState({
                  isShow: false,
                  Prompt: undefined
                })
              },3000)
            })
          },
          isAsync:true
        }
      })
    })
    
  }
  render() {
    const { getFieldProps } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 9 },
    };
    const formBtnLayout = {
      wrapperCol: { span: 9, offset: 3 },
    }
    const formTextLayout = {
      wrapperCol: { span: 9, offset: 3 },
    };
    const envIP = getFieldProps('envIP', {
      rules: [
        { required: true, message: "请输入传统环境IP" },
        { validator: this.checkHost.bind(this)}
      ],
    });
    const userName = getFieldProps('userName', {
      rules: [
        { required: true, message: "请输入环境登录账号" },
        { validator: this.checkName.bind(this)}
      ],
    });
    const password = getFieldProps('password', {
      rules: [
        { required: true, message: "请输入环境登录密码" },
        { validator: this.checkPass.bind(this)}
      ],
    });
    let testStyle = {
      color: '#31ba6a',
      marginLeft: '20px',
      size: 20
    }
    let fallStyle = {
      color: '#FF0000',
      marginLeft: '20px',
      size: 20
    }
    return (
      <div className="traditionEnv">
        <Form>
          {/*<Row>*/}
            {/*<Col offset={3}>*/}
              {/*<ButtonGroup size="large">*/}
                {/*<Button type="ghost">新环境</Button>*/}
                {/*<Button type="ghost">已导入环境</Button>*/}
              {/*</ButtonGroup>*/}
            {/*</Col>*/}
          {/*</Row>*/}
          <FormItem
            label="传统环境IP"
            {...formItemLayout}
          >
            <Input placeholder="请输入已开通SSH登录的传统环境IP" size="large" {...envIP}/>
          </FormItem>
          <FormItem
            {...formTextLayout}
          >
            <div><Icon type="question-circle-o" /> 传统环境一般指非容器环境（Linux的虚拟机、物理机等）</div>
          </FormItem>

          <FormItem
            label="环境登录账号"
            {...formItemLayout}
          >
            <Input placeholder="请输入传统环境登录账号" size="large" {...userName}/>
          </FormItem>
          <FormItem
            label="环境登录密码"
            {...formItemLayout}
          >
            <Input placeholder="请输入传统环境登录密码" size="large" {...password}/>
          </FormItem>
          <FormItem
            {...formBtnLayout}
          >
            <Button type="primary" size="large" loading={this.state.loading} onClick={this.checkUser.bind(this)}>测试连接</Button>
            {
              this.state.isShow ?
                <span>
                  {
                    this.state.Prompt === true ? <span style={testStyle}><Icon type="check-circle-o" /> 测试连接成功</span> : ''
                  }
                  {
                    this.state.Prompt === false ? <span style={fallStyle}><Icon type="cross-circle-o" /> 测试连接失败</span> : ''
                  }
                </span> : ''
            }
          </FormItem>
        </Form>
      </div>
    )
  }
}

function mapStateToProps(state, props) {

  return {

  }
}
export default connect(mapStateToProps, {
  checkVMUser
})(TraditionEnv)