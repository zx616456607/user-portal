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
import { formatIpRangeToArray } from './utils'
import { IP_PORT_REGEX } from '../../../../../constants'

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

  componentWillUnmount() {
    const { form } = this.props
    uuid = 0
    form.resetFields([ 'newKeys' ])
  }

  handleConfirm = () => {
    const { onChange, onCancel, form } = this.props
    const { validateFields, getFieldValue } = form
    const type = getFieldValue('addType')
    const validateArray = []
    if (type === 'diff') {
      const keys = getFieldValue('newKeys')
      keys.forEach(key => {
        validateArray.push(`host-${key}`, `username-${key}`, `password-${key}`)
      })
      validateArray.push('newKeys')
    } else {
      validateArray.push('editor', 'username', 'password')
    }
    validateArray.push('addType')
    validateFields(validateArray, (errors, values) => {
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

  checkEditor = (rules, value, callback) => {
    if (!value) {
      return callback()
    }
    const { form } = this.props
    const { getFieldValue } = form
    const existKeys = getFieldValue('keys')
    const existArray = []
    !isEmpty(existKeys) && existKeys.forEach(key => {
      existArray.push(getFieldValue(`existHost-${key}`))
    })
    const hostArray = formatIpRangeToArray(value).concat(existArray)
    const hostSet = new Set(hostArray)
    if (hostArray.length !== hostSet.size) {
      return callback('主机 IP 和端口重复')
    }
    callback()
  }

  checkHost = (rules, value, callback, key) => {
    const { form } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('newKeys')
    const existKeys = getFieldValue('keys')
    const flag = keys.filter(_key => _key !== key)
      .some(_key => {
        const host = getFieldValue(`host-${_key}`)
        return host === value
      }) ||
      (existKeys || []).some(_key => {
        const host = getFieldValue(`existHost-${_key}`)
        return host === value
      })
    if (flag) {
      return callback('主机 IP 和端口重复')
    }
    callback()
  }

  renderHostList = () => {
    const { form } = this.props
    const { getFieldProps, getFieldValue } = form
    const keys = getFieldValue('newKeys')
    if (isEmpty(keys)) {
      return
    }
    return keys.map(key =>
      <Row className="host-row" key={key}>
        <Col span={7}>
          <FormItem>
            <Input
              {...getFieldProps(`host-${key}`, {
                initialValue: this.state[`host-${key}`],
                rules: [{
                  required: true,
                  message: '请输入值',
                }, {
                  pattern: IP_PORT_REGEX,
                  message: '格式不正确',
                }, {
                  validator: (rules, value, callback) =>
                    this.checkHost(rules, value, callback, key),
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
    const keys = getFieldValue('newKeys')
    setFieldsValue({
      keys: keys.filter(_key => _key !== key),
    })
    this.setState({
      keys: keys.filter(_key => _key !== key),
    })
  }

  addHosts = () => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue, validateFields } = form
    const keys = getFieldValue('newKeys')
    const validateArray = []
    keys.forEach(key => {
      validateArray.push(`host-${key}`, `username-${key}`, `password-${key}`)
    })
    validateFields(validateArray, errors => {
      if (errors) {
        return
      }
      uuid++
      setFieldsValue({
        newKeys: keys.concat(uuid),
      })
      this.setState({
        keys: keys.concat(uuid),
      })
    })
  }

  render() {
    const { keys } = this.state
    const { visible, onCancel, form } = this.props
    const { getFieldProps, getFieldValue } = form
    const addType = getFieldValue('addType')
    if (addType !== 'same') {
      getFieldProps('newKeys', {
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
                    }, {
                      validator: this.checkEditor,
                    }],
                    onChange: value => this.updateState('editor', value),
                  })}
                  value={getFieldValue('editor') || this.state.editor || ''}
                />
              </FormItem>,
              <div key={'tip'} className="hintColor" style={{ marginBottom: 20 }}>
                <div>1、可以添加某个具体 IP 地址\端口，如: 192.168.1.1:22</div>
                <div>2、也可以设置 IP 地址段, 如192.168.1.[1-10]:22</div>
                <div>3、每行记录一条 IP 地址，换行分隔</div>
              </div>,
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

export default ExistingModal
