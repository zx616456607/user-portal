/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Monitor panel modal
 *
 * v0.1 - 2017-12-19
 * @author zhangxuan
 */

import React from 'react'
import { Modal, Button, Form, Input } from 'antd'

const FormItem = Form.Item;

class PanelModal extends React.Component {
  constructor(props) {
    super(props)
    this.cancelModal = this.cancelModal.bind(this)
    this.confirmModal = this.confirmModal.bind(this)
    this.deletePanel = this.deletePanel.bind(this)
  }
  
  deletePanel() {
    const { callbackFunc, currentPanel } = this.props
    const { removePanel } = callbackFunc
    removePanel(currentPanel.key)
    this.cancelModal()
  }
  
  cancelModal() {
    const { callbackFunc, form } = this.props
    const { closeModal } = callbackFunc
    closeModal()
    form.resetFields()
  }
  
  confirmModal() {
    const { callbackFunc, form, currentPanel } = this.props
    const { addPanel, editPanel } = callbackFunc
    const { validateFields } = form
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { panelName } = values
      if (currentPanel) {
        editPanel(panelName, currentPanel.key)
      } else {
        addPanel(panelName)
      }
      this.cancelModal()
    })
  }
  
  renderFooter() {
    const { currentPanel } = this.props
    return (
      [
        <Button onClick={this.cancelModal} size="large" key="cancel">取消</Button>,
        currentPanel && 
        <Button 
          style={{ borderColor: 'red', color: 'red' }} 
          onClick={this.deletePanel} size="large" type="ghost" key="delete">删除</Button>,
        <Button type="primary" key="confirm" size="large" onClick={this.confirmModal}>立即创建</Button>
      ]
    )
  }
  
  render() {
    const { form, visible, currentPanel } = this.props
    const { getFieldProps } = form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }
    const panelNameProps = getFieldProps('panelName', {
      rules: [
        {
          required: true,
          message: '请输入面板名称'
        }
      ],
      initialValue: currentPanel ? currentPanel.title : ''
    })
    return (
      <Modal
        title={currentPanel ? "编辑监控面板" : "创建监控面板"}
        visible={visible}
        onCancel={this.cancelModal}
        onOk={this.confirmModal}
        footer={this.renderFooter()}
      >
        <Form
          form={form}
        >
          <FormItem
            label="监控面板"
            {...formItemLayout}
          >
            <Input {...panelNameProps}/>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

PanelModal = Form.create()(PanelModal)

export default PanelModal 