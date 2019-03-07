/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * OpenStack modal
 *
 * v0.1 - 2019-01-17
 * @author zhangxuan
 */
import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import { Form, Modal, Select } from 'antd'
import intlMsg from '../../../../../src/components/ClusterModule/indexIntl'

const FormItem = Form.Item
const Option = Select.Option
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
}

class OpenStackModal extends React.PureComponent {

  static PropTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
  }

  handleConfirm = () => {
    const { form, onChange, onCancel } = this.props
    const { validateFields } = form
    const validateArray = [
      'domain',
      'network',
      'securityGroup',
      'image',
      'configSpecify',
    ]
    validateFields(validateArray, (errors, values) => {
      if (errors) {
        return
      }
      if (onChange) {
        onChange(values)
      }
      onCancel()
    })
  }

  render() {
    const { intl: { formatMessage }, visible, onCancel, form, currentKey } = this.props
    const { getFieldProps, getFieldValue } = form
    return (
      <Modal
        title={formatMessage(intlMsg.openStackTitle)}
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleConfirm}
        closable={false}
      >
        <FormItem
          label={formatMessage(intlMsg.availableDomain)}
          {...formItemLayout}
        >
          <Select
            style={{ width: '100%' }}
            placeholder={formatMessage(intlMsg.domainPld)}
            {...getFieldProps('domain', {
              initialValue: currentKey ? getFieldValue(`domain-${currentKey}`) : '',
              rules: [{
                required: true,
                message: formatMessage(intlMsg.domainPld),
              }],
            })}
          >
            <Option key={'domain-1'}>domain-1</Option>
            <Option key={'domain-2'}>domain-2</Option>
          </Select>
        </FormItem>
        <FormItem
          label={formatMessage(intlMsg.network)}
          {...formItemLayout}
        >
          <Select
            style={{ width: '100%' }}
            placeholder={formatMessage(intlMsg.networkPld)}
            {...getFieldProps('network', {
              initialValue: currentKey ? getFieldValue(`network-${currentKey}`) : '',
              rules: [{
                required: true,
                message: formatMessage(intlMsg.networkPld),
              }],
            })}
          >
            <Option key={'network-1'}>network-1</Option>
            <Option key={'network-2'}>network-2</Option>
          </Select>
        </FormItem>
        <FormItem
          label={formatMessage(intlMsg.securityGroup)}
          {...formItemLayout}
        >
          <Select
            style={{ width: '100%' }}
            placeholder={formatMessage(intlMsg.securityGroupPld)}
            {...getFieldProps('securityGroup', {
              initialValue: currentKey ? getFieldValue(`securityGroup-${currentKey}`) : '',
              rules: [{
                required: true,
                message: formatMessage(intlMsg.securityGroupPld),
              }],
            })}
          >
            <Option key={'securityGroup-1'}>securityGroup-1</Option>
            <Option key={'securityGroup-2'}>securityGroup-2</Option>
          </Select>
        </FormItem>
        <FormItem
          label={formatMessage(intlMsg.image)}
          {...formItemLayout}
        >
          <Select
            style={{ width: '100%' }}
            placeholder={formatMessage(intlMsg.imagePld)}
            {...getFieldProps('image', {
              initialValue: currentKey ? getFieldValue(`image-${currentKey}`) : '',
              rules: [{
                required: true,
                message: formatMessage(intlMsg.imagePld),
              }],
            })}
          >
            <Option key={'image-1'}>image-1</Option>
            <Option key={'image-2'}>image-2</Option>
          </Select>
        </FormItem>
        <FormItem
          label={formatMessage(intlMsg.configSpecify)}
          {...formItemLayout}
        >
          <Select
            style={{ width: '100%' }}
            placeholder={formatMessage(intlMsg.configSpecifyPld)}
            {...getFieldProps('configSpecify', {
              initialValue: currentKey ? getFieldValue(`configSpecify-${currentKey}`) : '',
              rules: [{
                required: true,
                message: formatMessage(intlMsg.configSpecifyPld),
              }],
            })}
          >
            <Option key={'configSpecify-1'}>configSpecify-1</Option>
            <Option key={'configSpecify-2'}>configSpecify-2</Option>
          </Select>
        </FormItem>
      </Modal>
    )
  }
}

export default injectIntl(OpenStackModal, {
  withRef: true,
})
