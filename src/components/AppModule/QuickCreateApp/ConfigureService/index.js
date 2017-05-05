/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: configure service
 *
 * v0.1 - 2017-05-04
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import { Form, Input, Row, Col } from 'antd'
import { connect } from 'react-redux'
import { setFormFields } from '../../../../actions/quick_create_app'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'

const FormItem = Form.Item

let ConfigureService = React.createClass({
  propTypes: {
    callbackForm: PropTypes.func.isRequired,
  },
  componentWillMount() {
    const { callbackForm, form } = this.props
    callbackForm(form)
  },
  render() {
    const { form } = this.props
    const { getFieldProps } = form
    const appNameProps = getFieldProps('appName', {
      rules: [
        { required: true }
      ],
    })
    const serviceNameProps = getFieldProps('serviceName', {
      rules: [
        { required: true }
      ],
    })
    const imageUrlProps = getFieldProps('imageUrl', {
      rules: [
        { required: true }
      ],
    })
    const imageTagProps = getFieldProps('imageTag', {
      rules: [
        { required: true }
      ],
    })
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 20 },
    }
    return (
      <QueueAnim id="quickCreateImageConfigureService" type="right">
        <Form
          horizontal
        >
          <FormItem
            {...formItemLayout}
            wrapperCol={{ span: 6 }}
            label="应用名称"
            hasFeedback
          >
            <Input
              size="large"
              placeholder="请输入应用名称"
              autoComplete="off"
              {...appNameProps}
              ref={ref => this.appNameInput = ref}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            wrapperCol={{ span: 6 }}
            label="服务名称"
            hasFeedback
          >
            <Input
              size="large"
              placeholder="请输入服务名称"
              autoComplete="off"
              {...serviceNameProps}
              ref={ref => this.serviceNameInput = ref}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            wrapperCol={{ span: 9 }}
            label="镜像地址"
            hasFeedback
          >
            <Input
              size="large"
              placeholder="请输入镜像地址"
              autoComplete="off"
              {...imageUrlProps}
              ref={ref => this.appNameInput = ref}
            />
          </FormItem>
        </Form>
      </QueueAnim>
    )
  }
})

const createFormOpts = {
  mapPropsToFields(props) {
    console.log('mapPropsToFields', props)
    return props.fields
  },
  onFieldsChange(props, fields) {
    console.log('onFieldsChange', fields)
    const { id, setFormFields } = props
    setFormFields(id, fields)
  }
}

ConfigureService = Form.create(createFormOpts)(ConfigureService)

function mapStateToProps(state, props) {
  const { quickCreateApp } = state
  return {
    fields: quickCreateApp.fields[props.id],
  }
}
ConfigureService = connect(mapStateToProps, {
  setFormFields,
})(ConfigureService)

export default ConfigureService
