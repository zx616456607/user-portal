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
import { Form, Button, Row, Col, Icon, Tooltip, Input, Checkbox } from 'antd'
import isEmpty from 'lodash/isEmpty'
import RightCloudModal from './RightCloudModal'
import './style/RightCloud.less'

const FormItem = Form.Item

export default class RightCloud extends React.PureComponent {

  state = {}

  checkMaster = (rules, value, callback, key) => {
    const { form } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('rcKeys')
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

  renderHeader = () => {
    return (
      <Row type="flex" align="middle" className="host-header">
        <Col span={4}>
          自定义主机名称&nbsp;
          <Tooltip title={'非必填，若未自定义，显示实际主机名'}>
            <Icon type="question-circle-o"/>
          </Tooltip>
        </Col>
        <Col span={4} offset={1}>主机 IP</Col>
        <Col span={4} offset={1}>云环境</Col>
        <Col span={4} offset={1}>主机角色</Col>
        <Col span={2} offset={1}>操作</Col>
      </Row>
    )
  }

  renderHostList = () => {
    const { dataSource, form, removeRcField } = this.props
    const { getFieldProps, getFieldValue } = form
    const keys = getFieldValue('rcKeys')
    if (isEmpty(keys)) {
      return
    }
    return keys.map(key => {
      return (
        <Row className="cluster-host-list" key={key}>
          <Col span={4}>
            <FormItem>
              <Input
                {...getFieldProps(`hostName-${key}`, {
                  initialValue: dataSource[`instanceName-${key}`],
                  rules: [{
                    required: true,
                    message: '请输入主机名',
                  }],
                })}
                placeholder={'默认显示云星上名字'}
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
    const { visible, masterError, doubleMaster } = this.state
    const { form, formItemLayout, updateState, dataSource } = this.props
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
