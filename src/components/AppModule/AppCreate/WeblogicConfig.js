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
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../containers/Application/intl'

class Weblogic extends React.Component {
  constructor() {
    super()
    this.state ={
      readOnly: true
    }
  }
  componentDidMount() {
    this.props.form.setFieldsValue({
      DB_checked: true,
    })
  }
  formCheckecd = () => {
    const { form } = this.props
    let callback= null
    form.validateFields((errors,values)=> {
      if(errors) return false
      if (!!values.DB_checked) {
        values.SERVICE_NAME = values.isRAC
      } else {
        values.SID = values.isRAC
      }
      callback = values
    })
    delete callback.DB_checked
    delete callback.isRAC
    return callback
  }
  checkUrl = (rule,value,callback) => {
    const { intl } = this.props
    if (!value) {
      return callback(intl.formatMessage(IntlMessage.enterAddress))
    }
    if(!IP_REGEX.test(value)) {
      return callback(intl.formatMessage(IntlMessage.enterCorrectAddress))
    }
    return callback()
  }
  checkUser = (rule, value,callback) => {
    const { intl } = this.props
    let message = null
    switch(rule.field) {
      case 'isRAC': {
        message = intl.formatMessage(IntlMessage.thisItem)
        break
      }
      default: message = intl.formatMessage(IntlMessage.username)

    }
    if (!value) {
      return callback(`${intl.formatMessage(IntlMessage.pleaseEnter, { item: message })}`)
    }
    if (value.length > 64) {
      return callback(intl.formatMessage(IntlMessage.maxLength))
    }
    if (!/^[A-Za-z0-9_.-]+$/.test(value)) {
      return callback(intl.formatMessage(IntlMessage.usernameReg))
    }
    return callback()
  }
  checkPort = (rule,value, callback) => {
    const { intl } = this.props
    if (!value) {
      return callback(intl.formatMessage(IntlMessage.pleaseEnter, { item: intl.formatMessage(IntlMessage.port) }))
    }
    if (!/^[\d]+$/.test(value)) {
      return callback(intl.formatMessage(IntlMessage.pleaseEnter, { item: intl.formatMessage(IntlMessage.number) }))
    }
    if (value[0] <1 || value > 65535) {
      return callback(intl.formatMessage(IntlMessage.portRange))
    }
    return callback()
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 2},
      wrapperCol: { span:10 },
    }
    const { form, intl } = this.props
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
      rules: [{
        required: true,
        message: intl.formatMessage(IntlMessage.pleaseEnter, { item: intl.formatMessage(IntlMessage.password) })
      }]
    })
    const racProps = form.getFieldProps('isRAC',{
      rules: [{ validator: this.checkUser }]
    })
    const instanes = form.getFieldProps('JNDI_NAME',{
      rules: [{ required: true, max:128, message:intl.formatMessage(IntlMessage.enterJndiName)}]
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
        <Form.Item {...formItemLayout} label={intl.formatMessage(IntlMessage.databaseType)}>
          <Checkbox {...checkedProps} /> RAC
          <Input type="hidden" {...typeProps}/>
        </Form.Item>
        <Form.Item {...formItemLayout} label={intl.formatMessage(IntlMessage.address)}>
          <Input size="large" {...urlProps} placeholder={intl.formatMessage(IntlMessage.dbAddressPlaceholder)} />
        </Form.Item>
        <Form.Item {...formItemLayout} style={{position:'absolute',left:'60%',top:'55px',width:'300px'}}>
          <Input
            size="large" {...portProps}
            placeholder={intl.formatMessage(IntlMessage.pleaseEnter, { item: intl.formatMessage(IntlMessage.port) })}
          />
        </Form.Item>
        <Form.Item {...formItemLayout} label={intl.formatMessage(IntlMessage.username)}>
          <Input
            size="large" {...userNameProps} autoComplete="off"
            placeholder={intl.formatMessage(IntlMessage.pleaseEnter, { item: intl.formatMessage(IntlMessage.username) })}
          />
        </Form.Item>
        <Form.Item {...formItemLayout} label={intl.formatMessage(IntlMessage.password)}>
          <Input size="large"
            autoComplete="off"
            readOnly={this.state.readOnly}
            onFocus={() => this.setState({ readOnly: false })}
            onBlur={() => this.setState({ readOnly: true })}
            type="password"
            {...psdProps}
            placeholder={intl.formatMessage(IntlMessage.pleaseEnter, { item: intl.formatMessage(IntlMessage.password) })}
          />
        </Form.Item>
        <Form.Item {...formItemLayout} label={isRac ? intl.formatMessage(IntlMessage.serviceName):'SID'}>
          <Input
            size="large" {...racProps}
            placeholder={`${intl.formatMessage(IntlMessage.pleaseEnter, { item: isRac ? intl.formatMessage(IntlMessage.serviceName):'SID'})}`} />
        </Form.Item>
        <Form.Item {...formItemLayout} label={intl.formatMessage(IntlMessage.jndiName)}>
          <Input size="large" {...instanes} placeholder={intl.formatMessage(IntlMessage.jndiPlaceholder)} />
        </Form.Item>
      </Form>
    )
  }
}
export default injectIntl(Weblogic, {
  withRef: true,
})
