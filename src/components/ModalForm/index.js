/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/4
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Form } from 'antd'
import ''

export default class ModalForm extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    return (
      <div id='ModalForm'>
        <Form horizontal form={this.props.form}>
          <Modal title="添加新成员" visible={visible}
                 onOk={this.handleOk} onCancel={this.handleCancel}
                 wrapClassName="NewMemberForm"
                 width="463px"
          >
            <FormItem
              {...formItemLayout}
              label="名称"
              hasFeedback
              help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
            >
              <Input {
                       ...getFieldProps('name', {
                         rules: [
                           { required: true, min: 5, message: '用户名至少为 5 个字符' },
                           { validator: this.userExists },
                         ],
                       })
                     } placeholder="新成员名称" />
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="类型"
              hasFeedback
            >
              <div>
                普通成员
                <Tooltip placement="right" title={text}>
                  <Icon type="question-circle-o" style={{marginLeft: 10}}/>
                </Tooltip>
              </div>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="密码"
              hasFeedback
            >
              <Input {...passwdProps} type="password" autoComplete="off"
                     placeholder="新成员名称登录密码"
              />
            </FormItem>
      
            <FormItem
              {...formItemLayout}
              label="确认密码"
              hasFeedback
            >
              <Input {...rePasswdProps} type="password" autoComplete="off" placeholder="请再次输入密码确认"/>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="手机"
              hasFeedback
            >
              <Input {...telProps} type="text" placeholder="新成员手机" />
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="邮箱"
              hasFeedback
            >
              <Input {...emailProps} type="email" placeholder="新成员邮箱账号" />
            </FormItem>
            <FormItem
              {...formItemLayout}
              label=""
            >
              <Checkbox className="ant-checkbox-vertical" {...checkProps}>
                创建完成后, 密码账户名发送至该邮箱
              </Checkbox>
            </FormItem>
          </Modal>
        </Form>
      </div>
    )
  }
}