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
import {Button, Modal, Form, Input} from 'antd'
const FormItem = Form.Item
const createForm = Form.create
let CreateVMListModal = React.createClass({

  handleAdd(){
    const {form, onSubmit, scope} = this.props
    debugger
    form.validateFields((errors, values) =>{
      if(!errors)return
      let List = {
        host: values.host,
        name: values.account,
        password: values.password
      }
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
    form.resetFields()
  },

  render(){
    const formItemLayout ={
      labelCol: { span: 5 },
      wrapperCol: { span: 17 }
    }
    const {form} = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const hostProps = getFieldProps('host', {
      rules: [
        { validator: this.teamExists },
      ],
    })
    const nameProps = getFieldProps('account', {
      rules: [
        { validator: this.teamExists },
      ],
    })
    const passwordProps = getFieldProps('password', {
      rules: [
        { validator: this.teamExists },
      ],
    })
    let style = {
      fontSize:2
    }
    return(
      <Modal
        title= { this.props.modalTitle ? "添加传统环境" : "编辑传统环境"}
        visible={this.props.visible}
        onCancel={this.handleClose}
        footer={[
          <Button
            key="back"
            type="ghost"
            size="large"
            onClick={this.handleClose}>
            取 消
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            onClick={this.handleAdd}>
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
            <Input key="IP" {...hostProps} placeholder="请输入已开通 SSH 登录的传递环境 IP"  id="host"/>
            <span style={style}>@传统环境一般指非容器环境（Linux的虚拟机、物理机等）</span>
          </FormItem>
          <FormItem
            hasFeedback
            label="环境登录账号"
            {...formItemLayout}
          >
            <Input key="userName"{...nameProps} placeholder="请输入传统环境登录账号" id="account" />
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
