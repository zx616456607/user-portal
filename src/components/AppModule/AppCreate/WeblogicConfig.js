/**
* Licensed Materials - Property of tenxcloud.com
* (C) Copyright 2016 TenxCloud. All Rights Reserved.
*
* weblogic config component
*
* v0.1 - 2017-11-9
* @author Baiyu
*/
import React from 'react'
import { Input,Form, Checkbox } from 'antd'
import { IP_REGEX } from '../../../../constants/index'
import { calcuDate } from '../../../common/tools';

class Weblogic extends React.Component {
  constructor() {
    super()
    this.state ={
    }
  }
  componentDidMount() {
    this.props.form.setFieldsValue({
      DB_checked: true,
    })
  }
  formCheckecd() {
    const { form } = this.props
    let callback= null
    form.validateFields((errors,values)=> {
      if(errors) return false
      callback = values
    })
    return callback
  }
  checkUrl(rule,value,callback) {
    if (!value) {
      return callback('请输入地址')
    }
    if(!IP_REGEX.test(value)) {
      return callback('请输入正确的地址')
    }
    return callback()
  }
  checkUser(rule, value,callback) {
    let message = null
    switch(rule.field) {
      case 'isRAC': {
        message = '此项'
        break
      }
      default: message = '用户名'

    }
    if (!value) {
      return callback(`请输入${message}`)
    }
    if (value.length > 64) {
      return '输入过长'
    }
    if (!/^[A-Za-z0-9_.-]+$/.test(value)) {
      return callback('请输入英文字母、数字、下划线')
    }
    return callback()
  }
  checkPort(rule,value, callback) {
    if (!value) {
      return callback('请输入端口')
    }
    if (!/^[\d]+$/.test(value)) {
      return callback('请输入数字')
    }
    if (value[0] <1 || value > 65535) {
      return callback('端口范围1 ~ 65535')
    }
    return callback()
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 2},
      wrapperCol: { span:10 },
    }
    const { form } = this.props
    const urlProps = form.getFieldProps('DB_HOST',{
      rules: [{ validator: this.checkUrl }]
    })
    const portProps = form.getFieldProps('DB_PORT',{
      rules: [{ validator: this.checkPort }]
    })
    const userNameProps = form.getFieldProps('DB_USER',{
      rules: [{ validator: this.checkUser}]
    })
    const psdProps = form.getFieldProps('DB_PASSWORD',{
      rules: [{required: true ,message:'请输入密码'}]
    })
    const racProps = form.getFieldProps('isRAC',{
      rules: [{ validator: this.checkUser }]
    })
    const instanes = form.getFieldProps('JNDI_NAME',{
      rules: [{ required: true, max:128, message:'请输入JNDI名，最多可输入128位字符'}]
    })
    const checkedProps = form.getFieldProps('DB_checked',{
      valuePropName: 'checked',
    })
    const isRac = form.getFieldValue('DB_checked') || false
    const typeProps = form.getFieldProps('DB_TYPE',{
      initialValue: isRac ? 'RAC':'None-RAC'
    })
    // [DB_TYPE,DB_HOST,DB_PORT,DB_USER,DB_PASSWORD,isRAC,JNDI_NAME]
    return (
      <Form form={form} style={{position:'relative'}}>
        <Form.Item {...formItemLayout} label="数据库类型">
          <Checkbox {...checkedProps} /> RAC
          <Input type="hidden" {...typeProps}/>
        </Form.Item>
        <Form.Item {...formItemLayout} label="地址">
          <Input size="large" {...urlProps} placeholder="请输入数据库地址 (所在主机IP)" />
        </Form.Item>
        <Form.Item {...formItemLayout} style={{position:'absolute',left:'60%',top:'55px',width:'300px'}}>
          <Input size="large" {...portProps} placeholder="请输入端口" />
        </Form.Item>
        <Form.Item {...formItemLayout} label="用户名">
          <Input size="large" {...userNameProps} placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item {...formItemLayout} label="密码">
          <Input size="large" type="password" {...psdProps} placeholder="请输入密码" />
        </Form.Item>
        <Form.Item {...formItemLayout} label={isRac ? '服务名称':'SID'}>
          <Input size="large" {...racProps} placeholder={`请输入${isRac ? '服务名称':'SID'}`} />
        </Form.Item>
        <Form.Item {...formItemLayout} label="JNDI名">
          <Input size="large" {...instanes} placeholder="请输入连接的实例名" />
        </Form.Item>
      </Form>
    )
  }
}
export default Weblogic