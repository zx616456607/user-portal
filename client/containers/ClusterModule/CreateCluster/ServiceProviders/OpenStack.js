/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * OpenStack hosts
 *
 * v0.1 - 2019-01-14
 * @author zhangxuan
 */
import React from 'react'
import { injectIntl } from 'react-intl'
import { Form, Button, Row, Col, Select, Input, InputNumber, Radio, Icon, Tooltip } from 'antd'
import './style/OpenStack.less'
import isEmpty from 'lodash/isEmpty'
import intlMsg from '../../../../../src/components/ClusterModule/indexIntl'
import OpenStackModal from './OpenStackModal'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option

class OpenStack extends React.PureComponent {
  state = {}

  addItem = () => {
    const { form, updateState } = this.props
    const { validateFields, getFieldValue } = form
    const osKeys = getFieldValue('osKeys')
    const validateArray = [ 'osKeys' ]
    if (!isEmpty(osKeys)) {
      osKeys.forEach(key => {
        validateArray.push(
          `hostName-${key}`,
          `hostCount-${key}`,
          `network-${key}`,
          `image-${key}`,
          `config-${key}`,
          `hostRole-${key}`
        )
      })
    }
    validateFields(validateArray, (errors, values) => {
      if (errors) {
        return
      }
      updateState(values)
    })
  }

  checkHostName = (rules, value, callback, key) => {
    const { intl: { formatMessage } } = this.props
    if (!value) {
      return callback(formatMessage(intlMsg.hostnamePld))
    }
    const { form } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('osKeys')
    if (isEmpty(keys)) {
      return callback()
    }
    const flag = keys.filter(_key => _key !== key)
      .some(_key => {
        const host = getFieldValue(`hostName-${_key}`)
        return host === value
      })
    if (flag) {
      return callback(formatMessage(intlMsg.hostNameExist))
    }
    callback()
  }

  checkHostRole = (rules, value, callback, key) => {
    const { intl: { formatMessage } } = this.props
    if (!value || isEmpty(value)) {
      return callback(formatMessage(intlMsg.plsSelectHostRole))
    }
    const { form, updateParentState, isAddHosts, masterCount } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('osKeys')
    if (isEmpty(keys)) {
      return callback()
    }
    let count = 0
    if (isAddHosts) { // 给已有集群添加主机
      count = masterCount
    }
    keys.filter(_key => _key !== key)
      .forEach(_key => {
        const role = getFieldValue(`hostRole-${_key}`)
        if (role === 'master') {
          count++
        }
      })
    if (count === 0) {
      if (value !== 'master') {
        updateParentState({
          osMasterError: true,
        })
        return callback()
      }
      updateParentState({
        osMasterError: false,
      })
      return callback()
    }
    if (count === 1) {
      if (value === 'master') {
        updateParentState({
          osMasterError: true,
          osDoubleMaster: true,
        })
        return callback()
      }
      updateParentState({
        osMasterError: false,
        osDoubleMaster: false,
      })
      return callback()
    }
    if (count === 2) {
      if (value === 'worker') {
        updateParentState({
          osMasterError: true,
          osDoubleMaster: true,
        })
        return callback()
      }
      updateParentState({
        osMasterError: false,
        osDoubleMaster: false,
      })
      return callback()
    }
    updateParentState({
      osMasterError: false,
      osDoubleMaster: false,
    })
    callback()
  }

  updateParentState = (key, value) => {
    const { dataSource, updateParentState } = this.props
    updateParentState({
      openStackData: {
        ...dataSource,
        [key]: value,
      },
    })
  }


  renderHeader = () => {
    const { intl: { formatMessage } } = this.props
    return (
      <Row type="flex" align="middle" className="host-header">
        <Col span={4}>
          {formatMessage(intlMsg.hostnamePrefix)}
        </Col>
        <Col span={2} offset={1}>{formatMessage(intlMsg.hostIp)}</Col>
        <Col span={2} offset={1}>{formatMessage(intlMsg.hostCount)}</Col>
        <Col span={3} offset={1}>{formatMessage(intlMsg.hostPoolConfig)}</Col>
        <Col span={4} offset={1}>{formatMessage(intlMsg.hostRole)}</Col>
        <Col span={4} offset={1}>{formatMessage(intlMsg.operation)}</Col>
      </Row>
    )
  }

  renderPoolConfig = key => {
    const { form, intl: { formatMessage } } = this.props
    const { getFieldValue } = form
    const domain = getFieldValue(`domain-${key}`)
    const network = getFieldValue(`network-${key}`)
    const securityGroup = getFieldValue(`securityGroup-${key}`)
    const image = getFieldValue(`image-${key}`)
    const configSpecify = getFieldValue(`configSpecify-${key}`)
    return <Tooltip
      title={<div>{domain}/{network}/{securityGroup}/{image}/{configSpecify}</div>}
    >
      <div>
        {formatMessage(intlMsg.availableDomain)}/
        {formatMessage(intlMsg.network)}/
        {formatMessage(intlMsg.securityGroup)}/
        {formatMessage(intlMsg.image)}/
        {formatMessage(intlMsg.configuration)}
      </div>
    </Tooltip>
  }

  renderHostList = () => {
    const { dataSource, form, removeOsField, intl: { formatMessage } } = this.props
    const { getFieldProps, getFieldValue } = form
    getFieldProps('osKeys', {
      initialValue: dataSource.osKeys || [],
    })
    const keys = getFieldValue('osKeys')
    if (isEmpty(keys)) {
      return <div className="hintColor cluster-host-list">{formatMessage(intlMsg.noneHosts)}</div>
    }
    return keys.map(key => {
      getFieldProps(`domain-${key}`, {
        initialValue: dataSource[`domain-${key}`],
      })
      getFieldProps(`network-${key}`, {
        initialValue: dataSource[`network-${key}`],
      })
      getFieldProps(`securityGroup-${key}`, {
        initialValue: dataSource[`securityGroup-${key}`],
      })
      getFieldProps(`image-${key}`, {
        initialValue: dataSource[`image-${key}`],
      })
      getFieldProps(`configSpecify-${key}`, {
        initialValue: dataSource[`configSpecify-${key}`],
      })
      return (
        <Row className="cluster-host-list" key={key}>
          <Col span={4}>
            <FormItem>
              <Input
                placeholder={formatMessage(intlMsg.hostName)}
                {...getFieldProps(`hostName-${key}`, {
                  initialValue: dataSource[`hostName-${key}`],
                  rules: [{
                    validator: (rules, value, callback) =>
                      this.checkHostName(rules, value, callback, key),
                  }],
                  onChange: e => this.updateParentState(`hostName-${key}`, e.target.value),
                })}
              />
            </FormItem>
          </Col>
          <Col span={2} offset={1}>
            <FormItem>
              <span>{formatMessage(intlMsg.systemRandom)}</span>
            </FormItem>
          </Col>
          <Col span={2} offset={1}>
            <FormItem>
              <InputNumber
                {...getFieldProps(`hostCount-${key}`, {
                  trigger: [ 'onChange' ],
                  initialValue: dataSource[`hostCount-${key}`],
                  rules: [{
                    required: true,
                    message: formatMessage(intlMsg.hostIsRequired),
                  }],
                  onChange: value => this.updateParentState(`hostCount-${key}`, value),
                })}
              />
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <FormItem>
              {this.renderPoolConfig(key)}
            </FormItem>
          </Col>
          <Col span={4} offset={1}>
            <FormItem>
              <RadioGroup
                {...getFieldProps(`hostRole-${key}`, {
                  initialValue: dataSource[`hostRole-${key}`] || 'worker',
                  rules: [{
                    validator: (rules, value, callback) =>
                      this.checkHostRole(rules, value, callback, key),
                  }],
                  onChange: e => this.updateParentState(`hostRole-${key}`, e.target.value),
                })}
              >
                <Radio value={'master'}>master(worker)</Radio>
                <Radio value={'worker'}>worker</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
          <Col span={4} offset={1} className="operate-btns">
            <FormItem>
              <Button type="dashed" onClick={() => this.toggleVisible(key)}><Icon type="edit"/></Button>
              <Button type="dashed" onClick={() => removeOsField(key)}><Icon type="delete"/></Button>
            </FormItem>
          </Col>
        </Row>
      )
    })
  }

  toggleVisible = key => {
    this.setState(({ visible }) => ({
      visible: !visible,
      currentKey: key ? key : '',
    }))
  }

  render() {
    const { visible, currentKey } = this.state
    const {
      formItemLayout, osMasterError, osDoubleMaster, isAddHosts,
      intl: { formatMessage }, form, dataSource, updateState,
    } = this.props
    const { getFieldProps } = form
    return (
      <div className="openstack-hosts">
        {
          visible &&
          <OpenStackModal
            visible={visible}
            onCancel={this.toggleVisible}
            form={form}
            onChange={updateState}
            currentKey={currentKey}
          />
        }
        <FormItem
          label={formatMessage(intlMsg.sltResourcePool)}
          {...formItemLayout}
          className="openstack-pool"
        >
          <Select
            style={{ width: 300 }}
            {...formItemLayout}
            placeholder={formatMessage(intlMsg.resourcePoolPld)}
            {...getFieldProps('resourcePool', {
              initialValue: dataSource.resourcePool,
              rules: [{
                required: true,
                message: formatMessage(intlMsg.resourcePoolPld),
              }],
              onChange: value => this.updateParentState('resourcePool', value),
            })}
          >
            <Option key={'pool-1'}>pool-1</Option>
            <Option key={'pool-2'}>pool-2</Option>
          </Select>
        </FormItem>
        <FormItem
          label={formatMessage(intlMsg.hostConfig)}
          {...formItemLayout}
        >
          <Button type={'primary'} onClick={this.toggleVisible}>{formatMessage(intlMsg.addResourcePool)}</Button>
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
          osMasterError &&
          <Row className="master-error">
            <Col offset={4} className="failedColor">
              <Icon type="exclamation-circle-o" />
              {osDoubleMaster ?
                `${formatMessage(intlMsg.twoMasterNotSupport)}${isAddHosts ? `（${formatMessage(intlMsg.masterExistsInCluster)}）` : ''}`
                : ` ${formatMessage(intlMsg.oneMaster)}`}
            </Col>
          </Row>
        }
      </div>
    )
  }
}

export default injectIntl(OpenStack, {
  withRef: true,
})
