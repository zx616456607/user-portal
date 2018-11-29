/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Existing host modal
 *
 * @author zhangxuan
 * @date 2018-11-28
 */
import React from 'react'
import PropTypes from 'prop-types'
import isEmpty from 'lodash/isEmpty'
import { Modal, Radio, Form, Row, Col, Input, Icon, Button } from 'antd'
import './style/ExistingModal.less'
import Editor from '../../../../components/EditorModule'

let uuid = 0
const FormItem = Form.Item
const RadioGroup = Radio.Group
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
}

class ExistingModal extends React.PureComponent {
  static PropTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func,
  }

  state = {
    keys: [ 0 ],
  }

  componentDidMount() {
    const { sourceData } = this.props
    if (isEmpty(sourceData)) {
      return
    }
    if (sourceData.keys) {
      this.setState({
        ...sourceData,
      })
      uuid = sourceData.keys[sourceData.keys.length - 1]
    }
  }

  componentWillUnmount() {
    uuid = 0
  }

  handleConfirm = () => {
    const { onChange, onCancel, form } = this.props
    const { validateFields } = form
    validateFields((errors, values) => {
      if (errors) {
        return
      }
      if (values.addType === 'same') {
        delete values.keys
      }
      if (onChange) {
        onChange(values)
      }
      onCancel()
    })
  }

  renderHeader = () => {
    return (
      <Row className="host-header">
        <Col span={7}>主机 IP ：SSH 端口
        </Col>
        <Col span={7}>主机用户名</Col>
        <Col span={7}>主机密码</Col>
        <Col span={3}>操作</Col>
      </Row>
    )
  }

  updateState = (key, value) => {
    this.setState({
      [key]: value,
    })
  }

  renderHostList = () => {
    const { form } = this.props
    const { getFieldProps, getFieldValue } = form
    const keys = getFieldValue('keys')
    if (isEmpty(keys)) {
      return
    }
    return keys.map(key =>
      <Row className="host-row">
        <Col span={7}>
          <FormItem>
            <Input
              {...getFieldProps(`host-${key}`, {
                initialValue: this.state[`host-${key}`],
                rules: [{
                  required: true,
                  message: '不能为空',
                }],
                onChange: e => this.updateState(`host-${key}`, e.target.value),
              })}
              placeholder={'如：192.168.1.1:22'}
            />
          </FormItem>
        </Col>
        <Col span={7}>
          <FormItem>
            <Input
              {...getFieldProps(`username-${key}`, {
                initialValue: this.state[`username-${key}`],
                rules: [{
                  required: true,
                  message: '请输入用户名',
                }],
                onChange: e => this.updateState(`username-${key}`, e.target.value),
              })}
              placeholder={'请输入用户名'}
            />
          </FormItem>
        </Col>
        <Col span={7}>
          <FormItem>
            <Input
              {...getFieldProps(`password-${key}`, {
                initialValue: this.state[`password-${key}`],
                rules: [{
                  required: true,
                  message: '请输入密码',
                }],
                onChange: e => this.updateState(`password-${key}`, e.target.value),
              })}
              placeholder={'请输入密码'}
            />
          </FormItem>
        </Col>
        <Col span={3}>
          <FormItem>
            <Button type="dashed" onClick={() => this.removeHost(key)}><Icon type="delete"/></Button>
          </FormItem>
        </Col>
      </Row>
    )
  }

  removeHost = key => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const keys = getFieldValue('keys')
    setFieldsValue({
      keys: keys.filter(_key => _key !== key),
    })
    this.setState({
      keys: keys.filter(_key => _key !== key),
    })
  }

  addHosts = () => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const keys = getFieldValue('keys')
    uuid++
    setFieldsValue({
      keys: keys.concat(uuid),
    })
    this.setState({
      keys: keys.concat(uuid),
    })
  }

  render() {
    const { keys } = this.state
    const { visible, onCancel, form } = this.props
    const { getFieldProps, getFieldValue } = form
    const addType = getFieldValue('addType')
    if (addType !== 'same') {
      getFieldProps('keys', {
        initialValue: keys,
      })
    }
    return (
      <Modal
        title={'添加已有主机'}
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleConfirm}
        wrapClassName="existing-modal"
        width={560}
      >
        <FormItem
          label={'添加方式'}
          {...formItemLayout}
        >
          <RadioGroup {...getFieldProps('addType', {
            initialValue: 'diff',
          })}>
            <Radio value={'diff'}>不同用户名密码添加主机</Radio>
            <Radio value={'same'}>相同用户名密码批量添加主机</Radio>
          </RadioGroup>
        </FormItem>
        {addType !== 'same' && this.renderHeader()}
        {
          addType !== 'same' &&
            [
              <div className="host-list-box" key={'body'}>
                {this.renderHostList()}
              </div>,
              <span key={'btn'} className="add-host-box pointer" onClick={this.addHosts}>
                <Icon type="plus-circle-o" /> 添加一个主机
              </span>,
            ]
        }
        {
          addType === 'same' &&
            [
              <FormItem key={'editor'}>
                <Editor
                  mode={'text'}
                  style={{ minHeight: 100 }}
                  {...getFieldProps('editor', {
                    initialValue: this.state.editor,
                    rules: [{
                      required: true,
                      message: '请输入 IP 地址',
                    }],
                    onChange: value => this.updateState('editor', value),
                  })}
                  value={getFieldValue('editor') || this.state.editor || ''}
                />
              </FormItem>,
              <FormItem
                key={'username'}
                label={'相同用户名'}
                {...formItemLayout}
              >
                <Input
                  {...getFieldProps('username', {
                    initialValue: this.state.username,
                    rules: [{
                      required: true,
                      message: '请输入相同用户名',
                    }],
                    onChange: e => this.updateState('username', e.target.value),
                  })}
                  placeholder={'请输入相同用户名'}
                />
              </FormItem>,
              <FormItem
                key={'password'}
                label={'相同密码'}
                {...formItemLayout}
              >
                <Input
                  {...getFieldProps('password', {
                    initialValue: this.state.password,
                    rules: [{
                      required: true,
                      message: '请输入相同密码',
                    }],
                    onChange: e => this.updateState('password', e.target.value),
                  })}
                  placeholder={'请输入相同密码'}
                />
              </FormItem>,
            ]
        }
      </Modal>
    )
  }
}

export default Form.create()(ExistingModal)
