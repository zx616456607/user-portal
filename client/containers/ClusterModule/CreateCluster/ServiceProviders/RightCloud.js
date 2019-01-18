/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Right cloud hosts
 *
 * @author zhangxuan
 * @date 2018-11-29
 */
import React from 'react'
import { injectIntl } from 'react-intl'
import { Form, Button, Row, Col, Icon, Tooltip, Input, Radio } from 'antd'
import isEmpty from 'lodash/isEmpty'
import RightCloudModal from './RightCloudModal'
import './style/RightCloud.less'
import intlMsg from '../../../../../src/components/ClusterModule/indexIntl'

const FormItem = Form.Item
const RadioGroup = Radio.Group

class RightCloud extends React.PureComponent {

  state = {}

  checkHostRole = (rules, value, callback, key) => {
    const { intl: { formatMessage } } = this.props
    if (!value || isEmpty(value)) {
      return callback(formatMessage(intlMsg.plsSelectHostRole))
    }
    const { form, updateParentState, isAddHosts, masterCount } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('rcKeys')
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
          rcMasterError: true,
        })
        return callback()
      }
      updateParentState({
        rcMasterError: false,
      })
      return callback()
    }
    if (count === 1) {
      if (value === 'master') {
        updateParentState({
          rcMasterError: true,
          rcDoubleMaster: true,
        })
        return callback()
      }
      updateParentState({
        rcMasterError: false,
        rcDoubleMaster: false,
      })
      return callback()
    }
    if (count === 2) {
      if (value === 'worker') {
        updateParentState({
          rcMasterError: true,
          rcDoubleMaster: true,
        })
        return callback()
      }
      updateParentState({
        rcMasterError: false,
        rcDoubleMaster: false,
      })
      return callback()
    }
    updateParentState({
      rcMasterError: false,
      rcDoubleMaster: false,
    })
    callback()
  }

  renderHeader = () => {
    const { intl: { formatMessage } } = this.props
    return (
      <Row type="flex" align="middle" className="host-header">
        <Col span={4}>
          {formatMessage(intlMsg.diyHostName)}&nbsp;
          <Tooltip title={formatMessage(intlMsg.diyHostNameTip)}>
            <Icon type="question-circle-o"/>
          </Tooltip>
        </Col>
        <Col span={4} offset={1}>{formatMessage(intlMsg.hostIp)}</Col>
        <Col span={4} offset={1}>{formatMessage(intlMsg.cloudEnv)}</Col>
        <Col span={4} offset={1}>{formatMessage(intlMsg.hostRole)}</Col>
        <Col span={2} offset={1}>{formatMessage(intlMsg.operation)}</Col>
      </Row>
    )
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
    const { dataSource, form, removeRcField, intl: { formatMessage } } = this.props
    const { getFieldProps, getFieldValue } = form
    const keys = getFieldValue('rcKeys')
    if (isEmpty(keys)) {
      return <div className="hintColor cluster-host-list">{formatMessage(intlMsg.noneHosts)}</div>
    }
    return keys.map(key => {
      getFieldProps(`password-${key}`, {
        initialValue: dataSource[`password-${key}`],
      })
      getFieldProps(`existHost-${key}`, {
        initialValue: dataSource[`host-${key}`],
      })
      return (
        <Row className="cluster-host-list" key={key}>
          <Col span={4}>
            <FormItem>
              <Input
                {...getFieldProps(`hostName-${key}`, {
                  initialValue: dataSource[`hostName-${key}`],
                  onChange: e => this.hostNameChange(e, key),
                })}
                placeholder={formatMessage(intlMsg.rcHostnamePld)}
              />
            </FormItem>
          </Col>
          <Col span={4} offset={1}>
            <FormItem>
              <span>{dataSource[`host-${key}`]}</span>
            </FormItem>
          </Col>
          <Col span={4} offset={1}>
            <FormItem>
              <span>{dataSource[`cloudEnvName-${key}`]}</span>
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
              <Button type="dashed" onClick={() => removeRcField(key)}><Icon type="delete"/></Button>
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
      form, formItemLayout, updateState, dataSource,
      rcMasterError, rcDoubleMaster, isAddHosts,
      intl: { formatMessage },
    } = this.props
    form.getFieldProps('rcKeys', {
      initialValue: dataSource.rcKeys || [],
    })
    return (
      <div className="right-cloud-hosts">
        {
          visible &&
          <RightCloudModal
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
          rcMasterError &&
          <Row className="master-error">
            <Col offset={4} className="failedColor">
              <Icon type="exclamation-circle-o" />
              {rcDoubleMaster ?
                ` ${formatMessage(intlMsg.twoMasterNotSupport)}${isAddHosts ? `（${formatMessage(intlMsg.masterExistsInCluster)}）` : ''}`
                : ` ${formatMessage(intlMsg.oneMaster)}`}
            </Col>
          </Row>
        }
      </div>
    )
  }
}

export default injectIntl(RightCloud, {
  withRef: true,
})
