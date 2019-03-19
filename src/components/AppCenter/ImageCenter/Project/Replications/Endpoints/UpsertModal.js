/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Upsert endpoint component of replications
 *
 * v0.1 - 2017-11-27
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import { Modal, Form, Input, Alert, Button, Row, Col, Icon, Checkbox, Tooltip } from 'antd'
import NotificationHandler from '../../../../../Notification'
import './style/UpsertModal.less'
import { DEFAULT_REGISTRY } from '../../../../../../constants'
import isUrl from '@tenx-ui/utils/lib/IP/isUrl'

const FormItem = Form.Item

const UpsertModal = React.createClass({
  propTypes: {
    mode: PropTypes.oneOf([ 'create', 'edit' ]),
    currentRow: PropTypes.object,
    disabled: PropTypes.bool,
    func: PropTypes.object,
  },

  getInitialState() {
    return {
      readOnly: true,
      pingBtnLoading: false,
      isPingSuccess: null,
    }
  },

  componentWillMount() {
    const { mode, currentRow, form } = this.props
    if (mode === 'edit') {
      const { name, endpoint, username, password, insecure } = currentRow
      form.setFieldsValue({ name, endpoint, username, password, insecure: !insecure })
    }
  },

  onSubmit() {
    const { form, onOk, currentRow, mode } = this.props
    const notification = new NotificationHandler()
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }
      values.type = 0
      values.insecure = !values.insecure
      if (mode === 'edit') {
        const { isChanged, changedValues } = this.getChangedValues(values)
        if (!isChanged) {
          notification.info('您没有做任何改动')
          return
        }
        values = changedValues
      }
      onOk && onOk(values)
    })
  },

  getChangedValues(values) {
    const { currentRow } = this.props
    let isChanged = false
    const changedValues = {}
    Object.keys(values).forEach(key => {
      if (values[key] !== currentRow[key]) {
        isChanged = true
        changedValues[key] = values[key]
      }
    })
    return { isChanged, changedValues }
  },

  ping() {
    const { form, onOk, currentRow, func, mode, harbor } = this.props
    this.setState({
      isPingSuccess: null,
    })
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }
      this.setState({
        pingBtnLoading: true,
      })
      const callback = {
        success: {
          func: () => {
            this.setState({
              isPingSuccess: true,
            })
          },
        },
        failed: {
          func: () => {
            this.setState({
              isPingSuccess: false,
            })
          },
        },
        finally: {
          func: () => this.setState({ pingBtnLoading: false })
        },
      }
      if (mode === 'edit') {
        const { isChanged } = this.getChangedValues(values)
        if (!isChanged) {
          func.validationOldTargetStore(harbor, DEFAULT_REGISTRY, currentRow.id, callback)
          return
        }
      }
      func.validationNewTargetStore(harbor, DEFAULT_REGISTRY, values, callback)
    })
  },
  checkUrl(rule, value, callback) {
    if (!value) return callback()
    if (!isUrl(value, { hasProtocol: true })) {
      return callback('请输入正确的 URL 地址')
    }
    callback()
  },

  render() {
    const { mode, form, disabled, ...otherProps } = this.props
    const { getFieldProps } = this.props.form
    const { readOnly, pingBtnLoading, isPingSuccess } = this.state
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    }
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, message: '请输入目标名' },
      ]
    })
    const endpointProps = getFieldProps('endpoint', {
      rules: [
        { required: true, message: '请输入目标 URL' },
        { validator: this.checkUrl },
      ]
    })
    const usernameProps = getFieldProps('username', {
      rules: [{ required: true, message: '请输入用户名' }]
    })
    const passwordProps = getFieldProps('password', {
      rules: [{ required: true, message: '请输入密码' }]
    })
    const text = "确定镜像复制是否要验证远程Harbor实例的 ssl 证书。如果远程实例使用的是自签或者非信任证书，不要勾选此项。"
    return (
      <Modal
        title={mode === 'create' ? '添加目标' : '编辑目标'}
        wrapClassName="replications-upsert-modal"
        {...otherProps}
        onOk={this.onSubmit}
        footer={<Row>
          <Col className="footer-left" span={12}>
            <Button
              type="primary"
              size="large"
              onClick={this.ping}
              loading={pingBtnLoading}
            >
            测试连接
            </Button>
            {
              isPingSuccess === false &&
              <span className="failedColor"><Icon type="cross-circle-o" /> 测试连接失败</span>
            }
            {
              isPingSuccess === true &&
              <span className="successColor"><Icon type="check-circle-o" /> 测试连接成功</span>
            }
          </Col>
          <Col className="footer-right" span={12}>
            <Button type="ghost" size="large" onClick={this.props.onCancel}>
            取 消
            </Button>
            <Button
              type="primary"
              size="large"
              loading={this.props.confirmLoading} onClick={this.onSubmit}
              disabled={disabled}
            >
            确定
            </Button>
          </Col>
        </Row>
        }
      >
        {
          disabled && <Alert message="当同步规则启用时目标无法修改。" type="warning" showIcon />
        }
        <Form horizontal>
          <FormItem
            {...formItemLayout}
            label="目标名"
          >
            <Input {...nameProps} placeholder="请输入目标名" disabled={disabled} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="目标 URL"
          >
            <Input {...endpointProps} placeholder="请输入目标 URL，如： http(s)://192.168.1.232" disabled={disabled} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="用户名"
          >
            <Input {...usernameProps} placeholder="请输入用户名" autoComplete="off" disabled={disabled} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="密码"
          >
            <Input
              {...passwordProps}
              placeholder="请输入密码"
              type="password"
              autoComplete="new-password"
              readOnly={readOnly}
              onFocus={() => this.setState({ readOnly: false })}
              onBlur={() => this.setState({ readOnly: true })}
              disabled={disabled}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="验证远程证书"
          >
            <Checkbox
              {...getFieldProps('insecure', {
                valuePropName: 'checked',
              })}
            >
              <Tooltip placement="top" title={text}>
                <Icon type="info-circle-o" />
              </Tooltip>
            </Checkbox>
          </FormItem>
        </Form>
      </Modal>
    )
  }
})

export default Form.create()(UpsertModal)
