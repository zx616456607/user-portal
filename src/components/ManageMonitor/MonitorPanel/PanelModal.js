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
import { connect } from 'react-redux'
import { Modal, Button, Form, Input } from 'antd'
import { createPanel, updatePanel, deletePanel, checkPanelName } from '../../../actions/manage_monitor'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import NotificationHandler from '../../../components/Notification'

const FormItem = Form.Item;

class PanelModal extends React.Component {
  constructor(props) {
    super(props)
    this.cancelModal = this.cancelModal.bind(this)
    this.confirmModal = this.confirmModal.bind(this)
    this.deletePanel = this.deletePanel.bind(this)
    this.checkName = this.checkName.bind(this)
  }
  
  componentWillUnmount() {
    clearTimeout(this.nameTimeout)
  }
  
  checkName(rule, value, callback) {
    const { checkPanelName, clusterID } = this.props
    if (!value) {
      return callback('请输入面板名称')
    }
    if (value.length > 24) {
      return callback('面板名称不能超过24个字符')
    }
    clearTimeout(this.nameTimeout)
    this.nameTimeout = setTimeout(() => {
      checkPanelName(clusterID, encodeURIComponent(value), {
        success: {
          func: res => {
            if (res.data.exist) {
              callback('该名称已经存在')
            } else {
              callback()
            }
          }
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  
  deletePanel() {
    const { currentPanel, deletePanel, clusterID, getPanes } = this.props
    let notify = new NotificationHandler()
    const body = {
      ids: [currentPanel.iD]
    }
    notify.spin('删除中')
    deletePanel(clusterID, body, {
      success: {
        func: () => {
          notify.close()
          notify.success('删除成功')
          getPanes()
          this.cancelModal()
        },
        isAsync: true
      },
      failed: {
        func: res => {
          notify.close()
          if (res.statusCode < 500) {
            notify.warn('删除失败', res.message)
          } else {
            notify.error('删除失败', res.message)
          }
          this.cancelModal()
        }
      }
    })
  }
  
  cancelModal() {
    const { closeModal, form } = this.props
    closeModal()
    form.resetFields()
  }
  
  confirmModal() {
    const { 
      form, currentPanel, getPanes,
      createPanel, updatePanel, clusterID 
    } = this.props
    const { validateFields } = form
    let notify = new NotificationHandler()
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { name } = values
      const body = {
        name
      }
      notify.spin('操作中')
      if (currentPanel) {
        const panelID = currentPanel.iD
        updatePanel(clusterID, panelID, body, {
          success: {
            func: () => {
              notify.close()
              notify.success('修改成功')
              getPanes()
              this.cancelModal()
            },
            isAsync: true
          },
          failed: {
            func: res => {
              notify.close()
              if (res.statusCode < 500) {
                notify.warn('修改失败', res.message)
              } else {
                notify.error('请求失败', res.message)
              }
              this.cancelModal()
            }
          }
        })
        return
      }
      createPanel(clusterID, body, {
        success: {
          func: () => {
            notify.close()
            notify.success('创建成功')
            getPanes()
            this.cancelModal()
          },
          isAsync: true
        },
        failed: {
          func: res => {
            notify.close()
            if (res.statusCode < 500) {
              notify.warn('创建失败', res.message)
            } else {
              notify.error('创建失败', res.message)
            }
            this.cancelModal()
          }
        }
      })
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
        <Button type="primary" key="confirm" size="large" onClick={this.confirmModal}>{currentPanel ? '确定' : '立即创建'}</Button>
      ]
    )
  }
  
  render() {
    const { form, visible, currentPanel } = this.props
    const { getFieldProps, isFieldValidating, getFieldError } = form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }
    const panelNameProps = getFieldProps('name', {
      rules: [
        {
          validator: this.checkName
        }
      ],
      initialValue: currentPanel ? currentPanel.name : ''
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
            hasFeedback
            help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
          >
            <Input {...panelNameProps}/>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

PanelModal = Form.create()(PanelModal)

function mapStateToProps(state) {
  return {
    
  }
}
export default connect(mapStateToProps, {
  createPanel, 
  updatePanel,
  deletePanel,
  checkPanelName
})(PanelModal) 