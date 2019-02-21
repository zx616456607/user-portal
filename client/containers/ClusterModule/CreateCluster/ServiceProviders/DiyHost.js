/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Diy hosts
 *
 * @author zhangxuan
 * @date 2018-11-28
 */
import React from 'react'
import { injectIntl } from 'react-intl'
import { Form, Button, Row, Col, Icon, Tooltip, Input, Radio } from 'antd'
import isEmpty from 'lodash/isEmpty'
import ExistingModal from './ExistingModal'
import './style/DiyHost.less'
import intlMsg from '../../../../../src/components/ClusterModule/indexIntl'
import TenxIcon from '@tenx-ui/icon/es/_old'

const FormItem = Form.Item
const RadioGroup = Radio.Group

class DiyHost extends React.PureComponent {

  state = {}

  renderHeader = () => {
    const { intl: { formatMessage } } = this.props
    return (
      <Row type="flex" align="middle" className="host-header">
        <Col span={4}>
          {formatMessage(intlMsg.diyHostName)}&nbsp;
          <Tooltip title={formatMessage(intlMsg.diyHostNameTip)}>
            <Icon type="question-circle-o" />
          </Tooltip>
        </Col>
        <Col span={4} offset={1}>{formatMessage(intlMsg.hostIp)}</Col>
        <Col span={3} offset={1}>
          {formatMessage(intlMsg.hostConnectivity)}&nbsp;
          <Tooltip title={formatMessage(intlMsg.hostConnectivityTip)}>
            <Icon type="question-circle-o" />
          </Tooltip>
        </Col>
        <Col span={6} offset={1}>{formatMessage(intlMsg.hostRole)}</Col>
        <Col span={3} offset={1}>{formatMessage(intlMsg.operation)}</Col>
      </Row>
    )
  }

  checkHostName = (rules, value, callback, key) => {
    const { form, intl: { formatMessage } } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('keys')
    const flag = keys.filter(_key => _key !== key)
      .some(_key => {
        const host = getFieldValue(`hostName-${_key}`)
        return host && value && host === value
      })
    if (flag) {
      return callback(formatMessage(intlMsg.hostNameExist))
    }
    callback()
  }

  checkHost = (rules, value, callback, key) => {
    const { form, intl: { formatMessage } } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('keys')
    let currentIp = ''
    if (value.includes(':')) {
      currentIp = value.split(':')[0]
    }
    const flag = keys.filter(_key => _key !== key)
      .some(_key => {
        const host = getFieldValue(`existHost-${_key}`)
        const ip = host.split(':')[0]
        return ip === currentIp
      })
    if (flag) {
      return callback(formatMessage(intlMsg.hostIpAndPortExist))
    }
    callback()
  }

  checkHostRole = (rules, value, callback, key) => {
    const { intl: { formatMessage }, dataSource } = this.props
    if (!value || isEmpty(value)) {
      return callback(formatMessage(intlMsg.plsSelectHostRole))
    }
    const { form, updateParentState, isAddHosts, masterCount } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('keys')
    let count = 0
    let connectCount = 0 // 可连接的master节点数量
    if (isAddHosts) { // 给已有集群添加主机
      count = masterCount
    }
    keys.filter(_key => _key !== key)
      .forEach(_key => {
        const role = getFieldValue(`hostRole-${_key}`)
        const host = getFieldValue(`existHost-${_key}`)
        if (role === 'master') {
          count++
          if ((isEmpty(dataSource.errorHosts) ||
            (!isEmpty(dataSource.errorHosts) && !dataSource.errorHosts.includes(host)))) {
            connectCount++
          }
        }
      })
    const currentHost = getFieldValue(`existHost-${key}`)
    const isConnect = isEmpty(dataSource.errorHosts) ||
      (!isEmpty(dataSource.errorHosts) && !dataSource.errorHosts.includes(currentHost))
    if (count === 0) {
      if (!isConnect || (isConnect && value !== 'master')) {
        updateParentState({
          diyMasterError: true,
          diyDoubleMaster: false,
        })
        return callback()
      }
      updateParentState({
        diyMasterError: false,
      })
      return callback()
    }
    if (count === 1) {
      if (!isAddHosts && connectCount === 0) {
        if (!isConnect || (isConnect && value !== 'master')) {
          updateParentState({
            diyMasterError: true,
            diyDoubleMaster: false,
          })
          return callback()
        }
        updateParentState({
          diyMasterError: true,
          diyDoubleMaster: true,
        })
        return callback()
      }
      if (value === 'master') {
        updateParentState({
          diyMasterError: true,
          diyDoubleMaster: true,
        })
        return callback()
      }
      updateParentState({
        diyMasterError: false,
        diyDoubleMaster: false,
      })
      return callback()
    }
    if (count === 2) {
      if (!isAddHosts && connectCount === 0) {
        if (!isConnect || (isConnect && value !== 'master')) {
          updateParentState({
            diyMasterError: true,
            diyDoubleMaster: false,
          })
          return callback()
        }
        updateParentState({
          diyMasterError: false,
        })
        return callback()
      }
      if (value === 'worker') {
        updateParentState({
          diyMasterError: true,
          diyDoubleMaster: true,
        })
        return callback()
      }
      updateParentState({
        diyMasterError: false,
        diyDoubleMaster: false,
      })
      return callback()
    }
    updateParentState({
      diyMasterError: false,
      diyDoubleMaster: false,
    })
    callback()
  }

  hostNameChange = (e, key) => {
    const { value } = e.target
    const { dataSource, updateParentState } = this.props
    updateParentState({
      diyData: {
        ...dataSource,
        [`hostName-${key}`]: value,
      },
    })
  }

  hostRoleChange = (e, key) => {
    const { dataSource, updateParentState } = this.props
    updateParentState({
      diyData: {
        ...dataSource,
        [`hostRole-${key}`]: e.target.value,
      },
    })
  }

  renderHostList = () => {
    const { dataSource, form, removeDiyField, intl: { formatMessage } } = this.props
    const { getFieldProps, getFieldValue } = form
    const keys = getFieldValue('keys')
    if (isEmpty(keys)) {
      return <div className="hintColor cluster-host-list">{formatMessage(intlMsg.noneHosts)}</div>
    }
    return keys.map(key => {
      getFieldProps(`password-${key}`, {
        initialValue: dataSource[`password-${key}`],
      })
      return (
        <Row className="cluster-host-list" key={key}>
          <Col span={4}>
            <FormItem>
              <Input
                {...getFieldProps(`hostName-${key}`, {
                  initialValue: dataSource[`hostName-${key}`],
                  rules: [{
                    validator: (rules, value, callback) =>
                      this.checkHostName(rules, value, callback, key),
                  }],
                  onChange: e => this.hostNameChange(e, key),
                })}
                placeholder={formatMessage(intlMsg.hostName)}
              />
            </FormItem>
          </Col>
          <Col span={4} offset={1}>
            <FormItem>
              <Input
                disabled
                {...getFieldProps(`existHost-${key}`, {
                  initialValue: dataSource[`host-${key}`],
                  rules: [{
                    validator: (rules, value, callback) =>
                      this.checkHost(rules, value, callback, key),
                  }],
                })}
              />
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <FormItem className="host-connectivity">
              {
                dataSource.errorHosts && dataSource.errorHosts.includes(dataSource[`host-${key}`])
                  ? <span>
                    <Tooltip title={formatMessage(intlMsg.unconnected)}>
                      <TenxIcon className="unconnected" type="unconnected"/>
                    </Tooltip>
                    {formatMessage(intlMsg.unconnected)}
                  </span>
                  : <span>
                    <Tooltip title={formatMessage(intlMsg.connectable)}>
                      <TenxIcon className="connectable" type="connectable"/>
                    </Tooltip>
                    {formatMessage(intlMsg.connectable)}
                  </span>
              }
            </FormItem>
          </Col>
          <Col span={6} offset={1}>
            <FormItem>
              <RadioGroup
                {...getFieldProps(`hostRole-${key}`, {
                  initialValue: dataSource[`hostRole-${key}`] || 'worker',
                  rules: [{
                    validator: (rules, value, callback) =>
                      this.checkHostRole(rules, value, callback, key),
                  }],
                  onChange: e => this.hostRoleChange(e, key),
                })}
              >
                <Radio value={'master'}>master(worker)</Radio>
                <Radio value={'worker'}>worker</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <FormItem>
              <Button type="dashed" onClick={() => removeDiyField(key)}><Icon type="delete"/></Button>
            </FormItem>
          </Col>
        </Row>
      )
    })
  }

  toggleVisible = () => {
    this.setState(({ visible }) => ({
      visible: !visible,
    }))
  }

  render() {
    const { visible } = this.state
    const {
      formItemLayout, updateState, form, diyMasterError, diyDoubleMaster, isAddHosts,
      intl: { formatMessage },
    } = this.props
    form.getFieldProps('keys', {
      initialValue: [],
    })
    return (
      <div className="diy-hosts">
        {
          visible &&
          <ExistingModal
            visible={visible}
            onCancel={this.toggleVisible}
            onChange={updateState}
            form={form}
          />
        }
        <FormItem
          label={formatMessage(intlMsg.hostConfig)}
          {...formItemLayout}
        >
          <Button type={'primary'} onClick={this.toggleVisible}>{formatMessage(intlMsg.addHosts)}</Button>
        </FormItem>
        <Row>
          <Col offset={4} span={20}>
            {this.renderHeader()}
          </Col>
        </Row>
        <Row>
          <Col offset={4} span={20}>
            {this.renderHostList()}
          </Col>
        </Row>
        {
          diyMasterError &&
          <Row className="master-error">
            <Col offset={4} className="failedColor">
              <Icon type="exclamation-circle-o" />
              {diyDoubleMaster ?
                `${formatMessage(intlMsg.twoMasterNotSupport)}${isAddHosts ? `（${formatMessage(intlMsg.masterExistsInCluster)}）` : ''}`
                : ` ${formatMessage(intlMsg.oneMaster)}`}
            </Col>
          </Row>
        }
      </div>
    )
  }
}

export default injectIntl(DiyHost, {
  withRef: true,
})
