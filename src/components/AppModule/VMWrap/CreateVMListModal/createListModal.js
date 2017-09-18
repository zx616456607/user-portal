/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: vm list
 *
 * v0.1 - 2017-07-21
 * @author ZhaoYanbei
 */

import React from 'react'
import {Button, Modal, Form, Input, Icon} from 'antd'
const FormItem = Form.Item
const createForm = Form.create
let CreateVMListModal = React.createClass({

  getInitialState: function() {
    return {
      Prompt: false,
      isShow: false
    };
  },
  handleSub(){
    const { form, scope } = this.props
    let info = form.getFieldsValue()
    this.setState({
      isShow: true
    })
    let infos = {
      host: info.host,
      account: info.account,
      password: info.password
    }
    scope.props.checkVMUser(infos,{
      success: {
        func: res => {
          if(res.code === 200){
            this.setState({
              Prompt: true,
              isShow: false
            })
          }
        }
      },
      failed: {
        func: err => {
          this.setState({
            Prompt: false,
            isShow: false
          })
        }
      }
    })
  },
  handleAdd(){
    const {form, onSubmit, scope} = this.props
    form.validateFields((errors, values) =>{
      if(errors !== null)return
      let List = {
        host: values.host,
        account: values.account,
        password: values.password
      }
      this.handleSub()
      onSubmit(List)
      scope.setState({
        visible: false
      })
      form.resetFields()
    })
  },
  handleClose(){
    const { scope, form} = this.props
    scope.setState({
      visible: false
    })
    this.setState({
      isShow: false
    })
    form.resetFields()
  },
  userExists(rule, value, callback) {
    const _this = this
    if (!value) {
      callback([new Error('请输入用户名')])
      return
    }
    if (value.length < 5 || value.length > 40) {
      callback([new Error('长度为5~40个字符')])
      return
    }
    /*if (!USERNAME_REG_EXP_NEW.test(value)) {
      callback([new Error('以小写字母开头，允许[0~9]、[-]，且以小写英文和数字结尾')])
      return
    }*/
    callback()
  },
  checkPass(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    if (value.length < 2 || value.length > 16) {
      callback([new Error('长度为2~16个字符')])
      return
    }
    if (/^[^0-9]+&&[^a-zA-Z]+$/.test(value) /*|| /^[^a-zA-Z]+$/.test(value)*/) {
      callback([new Error('密码必须包含数字和字母,长度为6~16个字符')])
      return
    }
    callback()
  },
  checkIP(rule, value, callback){
    let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    if(!value){
      callback([new Error('请填写IP')])
      return
    }
    if(reg.test(value) !==true ){
      callback([new Error('请输入正确IP地址')])
      return
    }
    callback()
  },
  render(){
    const formItemLayout ={
      labelCol: { span: 5 },
      wrapperCol: { span: 17 }
    }
    const {form, Rows, isAdd} = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const hostProps = getFieldProps('host', {
      rules: [
        { validator: this.checkIP },
      ],
      initialValue: isAdd ? undefined : Rows.host
    })
    const nameProps = getFieldProps('account', {
      rules: [
        { validator: this.userExists },
      ],
      initialValue: isAdd ? undefined : Rows.user
    })
    const passwordProps = getFieldProps('password', {
      rules: [
        { validator: this.checkPas },
      ],
      initialValue: isAdd ? undefined : Rows.password
    })
    let style = {
      fontSize:2
    }
    let btnStyle = {
      position: 'absolute',
      left: 10,
      marginBottom: 9
    }
    let testStyle = {
      color: '#31ba6a',
      size: 20
    }
    let fallStyle = {
      color: '#FF0000',
      size: 20
    }
    let promptStyle = {
      marginRight: 120
    }
    return(
      <Modal
        title= { this.props.modalTitle ? "添加传统环境" : "编辑传统环境"}
        visible={this.props.visible}
        onCancel={()=>this.handleClose()}
        footer={[
          <span style={promptStyle}>
            {
              this.state.isShow ?
                this.state.Prompt ?
                <span style={testStyle}><Icon type="check-circle-o" /> 测试连接成功</span> : <span style={fallStyle}><Icon type="cross-circle-o" /> 测试连接失败</span>
                : ''
            }
          </span>,
          <Button
            type="primary"
            size="large"
            onClick={()=>this.handleSub()}
            style={btnStyle}
          >
            测试连接
          </Button>,
          <Button
            key="back"
            type="ghost"
            size="large"
            onClick={()=>this.handleClose()}>
            取 消
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            onClick={()=>this.handleAdd()}>
            保 存
          </Button>,
        ]}
      >
        <Form>
          <FormItem
            label="传统环境 IP"
            hasFeedback
            {...formItemLayout}
          >
            <Input key="IP"{...hostProps} placeholder="请输入已开通 SSH 登录的传递环境 IP" id="host"/>
            <span style={style}><Icon size={15} type="question-circle-o" />传统环境一般指非容器环境（Linux的虚拟机、物理机等）</span>
          </FormItem>
          <FormItem
            hasFeedback
            label="环境登录账号"
            {...formItemLayout}
          >
            <Input key="userName"{...nameProps} placeholder="请输入传统环境登录账号" id="account"/>
          </FormItem>
          <FormItem
            hasFeedback
            label="环境登录密码"
            {...formItemLayout}
          >
            <Input key="passWord"{...passwordProps} placeholder="请输入传统环境登录密码" id="password"/>
          </FormItem>
        </Form>
      </Modal>
    )
  }
})

CreateVMListModal = createForm()(CreateVMListModal)

export default CreateVMListModal
