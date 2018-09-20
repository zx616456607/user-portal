/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * config group: create modal
 *
 * v0.1 - 2018-01-30
 * @author Zhangpc
 */

import React from 'react'
import { Button, Form, Input, Row, Col, Modal, Select } from 'antd'
import { validateK8sResource } from '../../../common/naming_validation'
import { injectIntl } from 'react-intl'
import indexIntl from '../intl/indexIntl.js'

const createForm = Form.create
const FormItem = Form.Item

class CreateServiceGroupModal extends React.Component {
  validateGroupName = (rule, value, callback) => {
    const { formatMessage } = this.props.intl
    if (!value) {
      callback([new Error(formatMessage(indexIntl.checkNameErrorMsg01))])
      return
    }
    if(value.length < 3 || value.length > 63) {
      callback(formatMessage(indexIntl.checkNameErrorMsg02))
      return
    }
    if(!/^[a-z]/.test(value)){
      callback(formatMessage(indexIntl.checkNameErrorMsg03))
      return
    }
    if (!/[a-z0-9]$/.test(value)) {
      callback(formatMessage(indexIntl.checkNameErrorMsg04))
      return
    }
    if (!validateK8sResource(value)) {
      callback(formatMessage(indexIntl.checkNameErrorMsg05))
      return
    }
    callback()
  }

  handleSubmit = () => {
    const { form, onOk } = this.props
    const { validateFields } = form
    validateFields((errors, values) => {
      if (errors) {
        return
      }
      onOk(values)
    })
  }

  render() {
    const { visible, form, onCancel, confirmLoading, intl } = this.props
    const { formatMessage } = intl
    const { getFieldProps } = form
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    }
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.validateGroupName },
      ],
    })
    return (
      <Modal
        visible={visible}
        title={formatMessage(indexIntl.createGroup)}
        wrapClassName="server-create-modal"
        maskClosable={false}
        onOk={this.handleSubmit}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
      >
        {
          visible &&
          <Form horizontal>
            <Row style={{ paddingTop: '10px' }}>
              <Col span="19">
                <FormItem
                  {...formItemLayout}
                  label={formatMessage(indexIntl.configGroupName)}
                  >
                  <Input
                    {...nameProps}
                    onPressEnter={this.handleSubmit}
                  />
                </FormItem>
              </Col>
            </Row>
          </Form>
        }
      </Modal>
    )
  }
}
CreateServiceGroupModal = injectIntl(CreateServiceGroupModal, {
  withRef: true,
})
export default createForm()(CreateServiceGroupModal)
