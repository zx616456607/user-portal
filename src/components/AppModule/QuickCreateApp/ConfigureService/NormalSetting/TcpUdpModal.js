/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Tcp udp ingress modal
 *
 * @author zhangxuan
 * @date 2018-08-03
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, InputNumber, Select, Input } from 'antd'
import { sleep } from "../../../../../common/tools";
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../../containers/Application/ServiceConfigIntl'

const FormItem = Form.Item
const Option = Select.Option

class TcpUdpModal extends React.PureComponent{
  static propTypes = {
    type: PropTypes.oneOf([ 'TCP', 'UDP' ]).isRequired,
    visible: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    currentIngress: PropTypes.object,
    callback: PropTypes.func,
  }

  state = {}

  handleConfirm = () => {
    const { closeModal, form, callback } = this.props
    form.validateFields(async (errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        confirmLoading: true,
      })
      await sleep(500)
      if (callback) {
        callback(values)
      }
      this.setState({
        confirmLoading: false,
      })
      closeModal()
    })
  }

  containerPortCheck = (rules, value, callback) => {
    const { intl } = this.props
    if (value.length > 1) {
      return callback(intl.formatMessage(IntlMessage.containerPortSingleSlt))
    }
    callback()
  }

  render() {
    const { form ,type, visible, currentIngress, closeModal, intl } = this.props
    const { getFieldProps } = form
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 }
    }
    const monitorPortProps = getFieldProps('monitorPort', {
      rules: [{
        required: true,
        message: '监听端口不能为空',
      }],
      initialValue: currentIngress ? currentIngress.monitorPort : '',
    })
    const containerPortProps = getFieldProps('containerPort', {
      rules: [{
        required: true,
        message: '容器端口不能为空',
      }, {
        validator: this.containerPortCheck,
      }],
      initialValue: currentIngress ? [currentIngress.containerPort] : [],
    })
    return (
      <Modal
        title={intl.formatMessage(IntlMessage.configMonitor, {
          item: type,
        })}
        visible={visible}
        onCancel={closeModal}
        onOk={this.handleConfirm}
      >
        <FormItem
          label={intl.formatMessage(IntlMessage.containerPort)}
          {...formItemLayout}
        >
          <Select
            tags
            style={{ width: '100%' }}
            placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
              item: intl.formatMessage(IntlMessage.containerPort),
              end: '',
            })}
            {...containerPortProps}
          >
            <Option key="80">80</Option>
            <Option key="90">90</Option>
          </Select>
        </FormItem>
        <FormItem
          label={intl.formatMessage(IntlMessage.listeningPort)}
          {...formItemLayout}
        >
          <InputNumber style={{ width: '100%' }} min={1} max={65535} placeholder="1-65535" {...monitorPortProps}/>
        </FormItem>
      </Modal>
    )
  }
}

export default Form.create()(injectIntl(TcpUdpModal, {
  withRef: true,
}))
