/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Create Alarm component
 *
 * v0.1 - 2017-3-20
 * @author BaiYu
 */

import React from 'react'
import { Input, Form, Icon, Button, Modal } from 'antd'

// create alarm group from
let mid = 0
let CreateAlarmGroup = React.createClass({
  getInitialState() {
    return {
      isAddEmail: 1
    }
  },
  removeEmail(k) {
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      keys,
    });
    this.setState({isAddEmail: 1})
  },
  addEmail() {
    const { form } = this.props
    console.log(this.state)
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      console.log('vaelue', values)

    })
    if (!this.state.isAddEmail) return
    mid++;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    keys = keys.concat(mid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys,
    });
    this.setState({isAddEmail: false})
  },
  addRuleEmail(rule, value, callback) {
    let isAddEmail= true
    if(!Boolean(value)) {
      callback(new Error('请输入邮箱地址'))
      isAddEmail = false
    }
    callback()
    this.setState({isAddEmail})
  },
  ruleEmail() {
    // send rule email
  },
  emailName(rule, value, callback) {
    // top email rule name
    if (!Boolean(value)) {
      callback(new Error('请输入名称'))
      return
    }
    if (value.length < 3 || value.length > 21) {
      callback(new Error('请输入3~21个字符'))
      return
    }
    callback()
  },
  submitAddEmail() {
    // submit add email modal
    // console.log('getFielsv',this.props.form.getFieldsValue());
    const { form } = this.props
    form.validateFields((error, values) => {
      if (!!error) {
        console.log('error is')
        return
      }
      console.log('submitVaelue', values)

    })
  },
  handCancel() {
    const {funcs,form } = this.props
     funcs.scope.setState({ createGroup: false, alarmModal: true})
     form.resetFields()
  },
  okModal() {
    const { form } = this.props
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      console.log('vaelue----', values)

    })
  },
  render() {
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    const { getFieldProps, getFieldValue } = this.props.form;
    const { funcs } = this.props
    getFieldProps('keys', {
      initialValue: [],
    });
    const formItems = getFieldValue('keys').map((k) => {
      return (
        <div key={k} style={{clear:'both'}}>
        <Form.Item style={{float:'left'}}>
          <Input {...getFieldProps(`email${k}`, {
            rules: [{
              whitespace: true,
            },
            {validator: this.addRuleEmail}
            ],
          }) } style={{ width: '150px', marginRight: 8 }}
          />
        </Form.Item>
          <Input placeholder="备注"size="large" style={{ width: 100,  marginRight: 8 }} />
          <Button type="primary" size="large" onClick={()=> this.ruleEmail()}>验证邮箱</Button>
          <Button size="large" style={{ marginLeft: 8}} onClick={()=> this.removeEmail(k)}>取消</Button>
        </div>
      );
    });
    return (
      <Form className="alarmAction" form={this.props.form}>
        <Form.Item label="名称" {...formItemLayout} >
          <Input {...getFieldProps(`emailName`, {
          rules: [{ whitespace: true },
            { validator: this.emailName}
          ]}) }
        />
        </Form.Item>
        <Form.Item label="描述" {...formItemLayout} >
          <Input type="textarea" {...getFieldProps(`emailDesc`, {
          rules: [{ whitespace: true },
          ]}) }/>
        </Form.Item>
        <div className="lables">
          <div className="keys">
            邮箱
          </div>
          <div className="emaillItem" >

            {formItems}
            <div style={{clear:'both'}}><a onClick={() => this.addEmail()}><Icon type="plus-circle-o" /> 添加邮箱</a></div>
          </div>
        </div>
        <div className="ant-modal-footer" style={{margin:'0 -30px'}}>
          <Button type="ghost" size="large" onClick={()=> this.handCancel()}>取消</Button>
          <Button type="primary" size="large" onClick={()=> this.okModal()}>保存</Button>
        </div>
      </Form>
    )
  }
})

CreateAlarmGroup = Form.create()(CreateAlarmGroup)


export default CreateAlarmGroup