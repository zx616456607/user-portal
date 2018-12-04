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

export default class DiyHost extends React.PureComponent {

  state = {}

  renderHeader = () => {
    return (
      <Row type="flex" align="middle" className="host-header">
        <Col span={6}>
          自定义主机名称&nbsp;
          <Tooltip title={'若未自定义，显示实际主机名'}>
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

  checkMaster = (rules, value, callback, key) => {
    const { form } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('keys')
    let checkedCount = 0
    keys.filter(_key => _key !== key)
      .forEach(_key => {
        const checked = getFieldValue(`master-${_key}`)
        if (checked) {
          checkedCount++
        }
      })
    if (checkedCount === 0) {
      if (!value) {
        this.setState({
          masterError: true,
        })
        return callback()
      }
      this.setState({
        masterError: false,
      })
      return callback()
    }
    if (checkedCount === 1) {
      if (value) {
        this.setState({
          masterError: true,
          doubleMaster: true,
        })
        return callback()
      }
      this.setState({
        masterError: false,
        doubleMaster: false,
      })
      return callback()
    }
    this.setState({
      masterError: false,
      doubleMaster: false,
    })
    callback()
  }

  renderHostList = () => {
    const { dataSource, form, removeDiyField } = this.props
    const { getFieldProps, getFieldValue } = form
    const keys = getFieldValue('keys')
    if (isEmpty(keys)) {
      return
    }
    return keys.map(key => {
      return (
        <Row className="cluster-host-list" key={key}>
          <Col span={6}>
            <FormItem>
              <Input
                {...getFieldProps(`hostName-${key}`, {
                  initialValue: dataSource[`host-${key}`],
                  rules: [{
                    required: true,
                    message: '请输入主机名',
                  }, {
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
              <Checkbox
                {...getFieldProps(`master-${key}`, {
                  rules: [{
                    validator: (rules, value, callback) =>
                      this.checkMaster(rules, value, callback, key),
                  }],
                })}
                className="ant-checkbox-inline"
              >
                master
              </Checkbox>
              <Checkbox
                {...getFieldProps(`worker-${key}`, {
                  initialValue: true,
                  valuePropName: 'checked',
                })}
                className="ant-checkbox-inline"
              >
                worker
              </Checkbox>
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
    const { visible, masterError, doubleMaster } = this.state
    const { formItemLayout, updateState, form } = this.props
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
          <Col offset={3} span={20}>
            {this.renderHeader()}
          </Col>
        </Row>
        <Row>
          <Col offset={3} span={20}>
            {this.renderHostList()}
          </Col>
        </Row>
        {
          masterError &&
          <Row className="master-error">
            <Col offset={3} className="failedColor">
              <Icon type="exclamation-circle-o" />
              {doubleMaster ? ' 不支持添加2个 Master 节点（集群中已存在1个）' : ' 请至少选择一个节点作为master节点'}
            </Col>
          </Row>
        }
      </div>
    )
  }
}
