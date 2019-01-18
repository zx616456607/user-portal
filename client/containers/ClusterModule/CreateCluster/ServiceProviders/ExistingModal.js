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
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import PropTypes from 'prop-types'
import isEmpty from 'lodash/isEmpty'
import { Modal, Radio, Form, Row, Col, Input, Icon, Button } from 'antd'
import './style/ExistingModal.less'
import Editor from '../../../../components/EditorModule'
import { formatIpRangeToArray } from './utils'
import { IP_PORT_REGEX } from '../../../../../constants'
import * as ClusterActions from '../../../../../src/actions/cluster'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import NotificationHandler from '../../../../../src/components/Notification'
import intlMsg from '../../../../../src/components/ClusterModule/indexIntl'

let uuid = 0
const FormItem = Form.Item
const RadioGroup = Radio.Group
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
}
const notify = new NotificationHandler()

const mapStateToProps = state => {
  const hostInfo = getDeepValue(state, [ 'cluster', 'checkHostInfo', 'data' ])
  return {
    hostInfo,
  }
}
@connect(mapStateToProps, {
  checkHostInfo: ClusterActions.checkHostInfo,
})
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

  handleConfirm = async () => {
    const { onChange, onCancel, form, checkHostInfo, intl: { formatMessage } } = this.props
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
    validateFields(validateArray, async (errors, values) => {
      if (errors) {
        return
      }
      this.setState({
        loading: true,
      })
      if (values.addType === 'same') {
        delete values.keys
      }
      const hosts = []
      if (values.addType === 'diff') {
        values.newKeys.forEach(key => {
          hosts.push({
            Host: values[`host-${key}`],
            RootPass: values[`password-${key}`],
          })
        })
      } else {
        const hostArray = formatIpRangeToArray(values.editor)
        hostArray.forEach(item => {
          hosts.push({
            Host: item,
            RootPass: values.password,
          })
        })
      }
      const checkRes = await checkHostInfo({ hosts })
      if (checkRes.error) {
        this.setState({
          loading: false,
        })
        return notify.warn(formatMessage(intlMsg.hostCheckError))
      }
      const { hostInfo } = this.props
      const errorHosts = []
      for (const [ key, value ] of Object.entries(hostInfo)) {
        if (!value) {
          errorHosts.push(key)
        }
      }
      this.setState({
        errorHosts,
      })
      if (!isEmpty(errorHosts)) {
        this.setState({
          loading: false,
        })
        return
      }
      if (onChange) {
        onChange(values)
      }
      onCancel()
    })
  }

  renderHeader = () => {
    const { intl: { formatMessage } } = this.props
    return (
      <Row className="host-header">
        <Col span={7}>{formatMessage(intlMsg.hostIpAndPort)}
        </Col>
        <Col span={7}>{formatMessage(intlMsg.hostUsername)}</Col>
        <Col span={7}>{formatMessage(intlMsg.hostPassword)}</Col>
        <Col span={3}>{formatMessage(intlMsg.operation)}</Col>
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
    const { form, intl: { formatMessage } } = this.props
    const { getFieldValue } = form
    const existKeys = getFieldValue('keys')
    const existArray = []
    !isEmpty(existKeys) && existKeys.forEach(key => {
      existArray.push(getFieldValue(`existHost-${key}`).split(':')[0])
    })
    const currentHosts = formatIpRangeToArray(value).map(item => item.split(':')[0])
    const hostArray = currentHosts.concat(existArray)
    const hostSet = new Set(hostArray)
    if (hostArray.length !== hostSet.size) {
      return callback(formatMessage(intlMsg.hostIpExist))
    }
    callback()
  }

  checkHost = (rules, value, callback, key) => {
    const { intl: { formatMessage } } = this.props
    if (!value) {
      return callback(formatMessage(intlMsg.hostIsRequired))
    }
    if (!IP_PORT_REGEX.test(value)) {
      return callback(formatMessage(intlMsg.incorrectFormat))
    }
    const { form } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('newKeys')
    const existKeys = getFieldValue('keys')
    let currentIp = ''
    if (value.includes(':')) {
      currentIp = value.split(':')[0]
    }
    const flag = keys.filter(_key => _key !== key)
      .some(_key => {
        const host = getFieldValue(`host-${_key}`)
        const ip = host.split(':')[0]
        return ip === currentIp
      }) ||
      (existKeys || []).some(_key => {
        const host = getFieldValue(`existHost-${_key}`)
        const ip = host.split(':')[0]
        return ip === currentIp
      })
    if (flag) {
      return callback(formatMessage(intlMsg.hostIpExist))
    }
    callback()
  }

  renderHostList = () => {
    const { form, intl: { formatMessage } } = this.props
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
                  validator: (rules, value, callback) =>
                    this.checkHost(rules, value, callback, key),
                }],
                onChange: e => this.updateState(`host-${key}`, e.target.value),
              })}
              placeholder={formatMessage(intlMsg.hostPld)}
            />
          </FormItem>
        </Col>
        <Col span={7}>
          <FormItem>
            <Input
              disabled
              {...getFieldProps(`username-${key}`, {
                initialValue: this.state[`username-${key}`] || 'root',
                rules: [{
                  required: true,
                  message: formatMessage(intlMsg.usernamePld),
                }],
                onChange: e => this.updateState(`username-${key}`, e.target.value),
              })}
              placeholder={formatMessage(intlMsg.usernamePld)}
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
                  message: formatMessage(intlMsg.passwordPld),
                }],
                onChange: e => this.updateState(`password-${key}`, e.target.value),
              })}
              placeholder={formatMessage(intlMsg.passwordPld)}
            />
          </FormItem>
        </Col>
        <Col span={3}>
          <FormItem>
            <Button type="dashed" disabled={keys.length === 1} onClick={() => this.removeHost(key)}>
              <Icon type="delete"/>
            </Button>
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
      newKeys: keys.filter(_key => _key !== key),
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

  renderConnectError = () => {
    const { intl: { formatMessage } } = this.props
    const { errorHosts } = this.state
    if (isEmpty(errorHosts)) {
      return
    }
    return (
      <div className="failedColor">
        <Row>
          <Col span={1}><Icon type="cross-circle"/></Col>
          <Col span={20}>{formatMessage(intlMsg.connectFailed)}</Col>
        </Row>
        <Row>
          <Col offset={1} span={20}>
            {formatMessage(intlMsg.hostConnectFailed({
              hosts: errorHosts.join(),
            }))}
          </Col>
        </Row>
        <Row>
          <Col offset={1} span={20}>
            {formatMessage(intlMsg.retryTip)}
          </Col>
        </Row>
      </div>
    )
  }

  render() {
    const { keys, loading } = this.state
    const { visible, onCancel, form, intl: { formatMessage } } = this.props
    const { getFieldProps, getFieldValue } = form
    const addType = getFieldValue('addType')
    if (addType !== 'same') {
      getFieldProps('newKeys', {
        initialValue: keys,
      })
    }
    return (
      <Modal
        title={formatMessage(intlMsg.addExistHosts)}
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleConfirm}
        wrapClassName="existing-modal"
        width={560}
        confirmLoading={loading}
        okText={loading ? formatMessage(intlMsg.checking) : formatMessage(intlMsg.confirm)}
      >
        <FormItem
          label={formatMessage(intlMsg.addType)}
          {...formItemLayout}
        >
          <RadioGroup {...getFieldProps('addType', {
            initialValue: 'diff',
          })}>
            <Radio value={'diff'}>{formatMessage(intlMsg.diffAddHosts)}</Radio>
            <Radio value={'same'}>{formatMessage(intlMsg.sameAddHosts)}</Radio>
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
                <Icon type="plus-circle-o" /> {formatMessage(intlMsg.addOneHost)}
              </span>,
            ]
        }
        {
          addType === 'same' &&
            [
              <FormItem key={'editor'}>
                <Editor
                  mode={'text'}
                  title={formatMessage(intlMsg.hostIpAndPort)}
                  style={{ minHeight: 200 }}
                  {...getFieldProps('editor', {
                    initialValue: this.state.editor,
                    rules: [{
                      required: true,
                      message: formatMessage(intlMsg.plsInputIp),
                    }, {
                      validator: this.checkEditor,
                    }],
                    onChange: value => this.updateState('editor', value),
                  })}
                  value={getFieldValue('editor') || this.state.editor || ''}
                />
              </FormItem>,
              <div key={'tip'} className="hintColor" style={{ marginBottom: 20 }}>
                <div>{formatMessage(intlMsg.sameTipOne)}</div>
                <div>{formatMessage(intlMsg.sameTipTwo)}</div>
                <div>{formatMessage(intlMsg.sameTipThree)}</div>
              </div>,
              <FormItem
                key={'username'}
                label={formatMessage(intlMsg.sameUsername)}
                {...formItemLayout}
              >
                <Input
                  disabled
                  {...getFieldProps('username', {
                    initialValue: this.state.username || 'root',
                    rules: [{
                      required: true,
                      message: formatMessage(intlMsg.sameUsernamePld),
                    }],
                    onChange: e => this.updateState('username', e.target.value),
                  })}
                  placeholder={formatMessage(intlMsg.sameUsernamePld)}
                />
              </FormItem>,
              <FormItem
                key={'password'}
                label={formatMessage(intlMsg.samePassword)}
                {...formItemLayout}
              >
                <Input
                  {...getFieldProps('password', {
                    initialValue: this.state.password,
                    rules: [{
                      required: true,
                      message: formatMessage(intlMsg.samePasswordPld),
                    }],
                    onChange: e => this.updateState('password', e.target.value),
                  })}
                  placeholder={formatMessage(intlMsg.samePasswordPld)}
                />
              </FormItem>,
            ]
        }
        {this.renderConnectError()}
      </Modal>
    )
  }
}

export default injectIntl(ExistingModal, {
  withRef: true,
})
