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

const createForm = Form.create
const FormItem = Form.Item

class CreateServiceGroupModal extends React.Component {
  validateGroupName = (rule, value, callback) => {
    if (!value) {
      callback([new Error('请输入配置组名称')])
      return
    }
    if(value.length < 3 || value.length > 63) {
      callback('名称长度为 3-63 个字符')
      return
    }
    if(!/^[a-z]/.test(value)){
      callback('名称须以小写字母开头')
      return
    }
    if (!/[a-z0-9]$/.test(value)) {
      callback('名称须以小写字母或数字结尾')
      return
    }
    if (!validateK8sResource(value)) {
      callback('由小写字母、数字和连字符（-）组成')
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
    const { visible, form, onCancel, confirmLoading } = this.props
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
        title="创建配置组"
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
                  label="配置组名称"
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

export default createForm()(CreateServiceGroupModal)
