/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Health check modal
 *
 * v0.1 - 2018-01-17
 * @author zhangxuan
 */

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Modal, Form, Switch, Input, Slider, InputNumber, Checkbox } from 'antd'
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../containers/Application/ServiceConfigIntl'

const FormItem = Form.Item

class HealthCheckModal extends React.Component {
  state = {

  }

  componentWillMount() {
    const { healthOptions, form } = this.props
    if (healthOptions) {
      const { interval, fall, rise, httpSend, expectAlive } = healthOptions
      if (interval && fall && rise) {
        form.setFieldsValue({
          'isCheck': true
        })
      }
      form.setFieldsValue({
        interval,
        fall,
        rise,
        httpSend
      })
      if (expectAlive && expectAlive.length) {
        expectAlive.forEach(item => {
          form.setFieldsValue({
            [item]: true
          })
        })
      }
    }
  }
  cancelModal = () => {
    const { closeModal, form } = this.props
    closeModal()
    form.resetFields()
  }

  confirmModal = () => {
    const { closeModal, form, callback } = this.props
    this.setState({
      confirmLoading: true
    })
    callback && callback(form.getFieldsValue())
    setTimeout(() => {
      this.setState({
        confirmLoading: false
      })
      closeModal()
      form.resetFields()
    }, 500)
  }

  switchChange = checked => {
    const { form } = this.props
    if (!checked) {
      form.resetFields()
    }
  }

  render() {
    const { confirmLoading } = this.state
    const { form, visible, intl } = this.props
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue, setFieldsValue } = form
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    }

    const switchProps = getFieldProps('isCheck', {
      valuePropName: 'checked',
      onChange: this.switchChange
    })
    const directoryProps = getFieldProps('httpSend')
    const intervalProps = getFieldProps('interval', {
      initialValue: switchProps.checked ? 10 : 0
    })
    const errorProps = getFieldProps('fall', {
      initialValue: switchProps.checked ? 3 : 0
    })
    const healthProps = getFieldProps('rise', {
      initialValue: switchProps.checked ? 3 : 0
    })
    return (
      <Modal
        title={intl.formatMessage(IntlMessage.healthCheck)}
        visible={visible}
        onCancel={this.cancelModal}
        onOk={this.confirmModal}
        confirmLoading={confirmLoading}
      >
        <Form form={form}>
          <FormItem
            label={intl.formatMessage(IntlMessage.healthCheck)}
            {...formItemLayout}
          >
            <Switch
              {...switchProps}
              checkedChildren={intl.formatMessage(IntlMessage.open)}
              unCheckedChildren={intl.formatMessage(IntlMessage.close)}
            />
          </FormItem>
          <FormItem
            label={intl.formatMessage(IntlMessage.checkDirectory)}
            {...formItemLayout}
          >
            <Input
              placeholder={intl.formatMessage(IntlMessage.ingressDirPlaceholder)}
              {...directoryProps}
            />
          </FormItem>
          <Row>
            <Col span={18}>
              <FormItem
                label={intl.formatMessage(IntlMessage.checkInterval)}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Slider {...intervalProps} max={300}/>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem>
                <InputNumber max={300} value={getFieldValue('interval')} onChange={value => setFieldsValue({interval: value})}/> s
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={18}>
              <FormItem
                label={intl.formatMessage(IntlMessage.unhealthyThreshold)}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Slider {...errorProps} max={10}/>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem>
                <InputNumber
                  max={10}
                  value={getFieldValue('fall')}
                  onChange={value => setFieldsValue({fall: value})}
                /> {intl.formatMessage(IntlMessage.times)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={18}>
              <FormItem
                label={intl.formatMessage(IntlMessage.healthyThreshold)}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Slider {...healthProps} max={10}/>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem>
                <InputNumber
                  max={10}
                  value={getFieldValue('rise')}
                  onChange={value => setFieldsValue({rise: value})}
                /> {intl.formatMessage(IntlMessage.times)}
              </FormItem>
            </Col>
          </Row>
          <FormItem
            label={intl.formatMessage(IntlMessage.httpStatueCodeCheck)}
            {...formItemLayout}
          >
            {/* <Checkbox style={{ marginLeft: 8 }} {...getFieldProps('http_1xx', {valuePropName: 'checked'})}>http_1xx</Checkbox> */}
            <Checkbox style={{ marginLeft: 8 }} {...getFieldProps('http_2xx', {valuePropName: 'checked', initialValue: true})}>http_2xx</Checkbox>
            <Checkbox {...getFieldProps('http_3xx', {valuePropName: 'checked', initialValue: true})}>http_3xx</Checkbox>
            <Checkbox {...getFieldProps('http_4xx', {valuePropName: 'checked'})}>http_4xx</Checkbox>
            <Checkbox {...getFieldProps('http_5xx', {valuePropName: 'checked'})}>http_5xx</Checkbox>
            <p className="ant-form-text hintColor" style={{ paddingLeft: 8 }}>
              {intl.formatMessage(IntlMessage.ingressHttpTip)}</p>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

HealthCheckModal = Form.create()(HealthCheckModal)

HealthCheckModal.PropTypes = {
  visible: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  callback: PropTypes.func,
  healthOptions: PropTypes.object
}

export default injectIntl(HealthCheckModal, {
  withRef: true,
})
