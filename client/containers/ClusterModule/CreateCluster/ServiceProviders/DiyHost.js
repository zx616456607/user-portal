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
import { Form, Button, Row, Col, Icon, Tooltip, Input, Checkbox } from 'antd'
import isEmpty from 'lodash/isEmpty'
import ExistingModal from './ExistingModal'
import './style/DiyHost.less'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group

export default class DiyHost extends React.PureComponent {

  state = {}

  renderHeader = () => {
    return (
      <Row type="flex" align="middle" className="host-header">
        <Col span={6}>
          自定义主机名称&nbsp;
          <Tooltip title={'非必填，若未自定义，显示实际主机名'}>
            <Icon type="question-circle-o" />
          </Tooltip>
        </Col>
        <Col span={6} offset={1}>主机 IP</Col>
        <Col span={6} offset={1}>主机角色</Col>
        <Col span={3} offset={1}>操作</Col>
      </Row>
    )
  }

  checkHostName = (rules, value, callback, key) => {
    const { form } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('keys')
    const flag = keys.filter(_key => _key !== key)
      .some(_key => {
        const host = getFieldValue(`hostName-${_key}`)
        return host === value
      })
    if (flag) {
      return callback('主机名称重复')
    }
    callback()
  }

  checkHost = (rules, value, callback, key) => {
    const { form } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('keys')
    const flag = keys.filter(_key => _key !== key)
      .some(_key => {
        const host = getFieldValue(`host-${_key}`)
        return host === value
      })
    if (flag) {
      return callback('主机 IP 和端口重复')
    }
    callback()
  }

  checkHostRole = (rules, value, callback, key) => {
    if (!value || isEmpty(value)) {
      return callback('请选择主机角色')
    }
    const { form, updateParentState, isAddHosts, masterCount } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('keys')
    let count = 0
    if (isAddHosts) { // 给已有集群添加主机
      count = masterCount
    }
    keys.filter(_key => _key !== key)
      .forEach(_key => {
        const role = getFieldValue(`hostRole-${_key}`)
        if (role.includes('master')) {
          count++
        }
      })
    if (count === 0) {
      if (!value.includes('master')) {
        updateParentState({
          diyMasterError: true,
        })
        return callback()
      }
      updateParentState({
        diyMasterError: false,
      })
      return callback()
    }
    if (count === 1) {
      if (value.includes('master')) {
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

  renderHostList = () => {
    const { dataSource, form, removeDiyField } = this.props
    const { getFieldProps, getFieldValue } = form
    const keys = getFieldValue('keys')
    if (isEmpty(keys)) {
      return <div className="hintColor cluster-host-list">暂未添加</div>
    }
    return keys.map(key => {
      getFieldProps(`password-${key}`, {
        initialValue: dataSource[`password-${key}`],
      })
      return (
        <Row className="cluster-host-list" key={key}>
          <Col span={6}>
            <FormItem>
              <Input
                {...getFieldProps(`hostName-${key}`, {
                  rules: [{
                    validator: (rules, value, callback) =>
                      this.checkHostName(rules, value, callback, key),
                  }],
                })}
                placeholder={'主机名'}
              />
            </FormItem>
          </Col>
          <Col span={6} offset={1}>
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
          <Col span={6} offset={1}>
            <FormItem>
              <CheckboxGroup
                {...getFieldProps(`hostRole-${key}`, {
                  initialValue: [ 'worker' ],
                  rules: [{
                    validator: (rules, value, callback) =>
                      this.checkHostRole(rules, value, callback, key),
                  }],
                })}
                options={[{
                  label: 'master',
                  value: 'master',
                }, {
                  label: 'worker',
                  value: 'worker',
                }]}
              />
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
    const { formItemLayout, updateState, form, diyMasterError, diyDoubleMaster } = this.props
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
          label={'主机配置'}
          {...formItemLayout}
        >
          <Button type={'primary'} onClick={this.toggleVisible}>添加主机</Button>
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
              {diyDoubleMaster ? ' 不支持添加2个 Master 节点' : ' 请至少选择一个节点作为master节点'}
            </Col>
          </Row>
        }
      </div>
    )
  }
}
