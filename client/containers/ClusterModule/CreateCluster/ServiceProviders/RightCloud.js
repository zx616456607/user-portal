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
import { Form, Button, Row, Col, Icon, Tooltip, Input, Radio } from 'antd'
import isEmpty from 'lodash/isEmpty'
import RightCloudModal from './RightCloudModal'
import './style/RightCloud.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group

export default class RightCloud extends React.PureComponent {

  state = {}

  checkHostRole = (rules, value, callback, key) => {
    if (!value || isEmpty(value)) {
      return callback('请选择主机角色')
    }
    const { form, updateParentState, isAddHosts, masterCount } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('rcKeys')
    let count = 0
    if (isAddHosts) { // 给已有集群啊添加主机
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
    updateParentState({
      rcMasterError: false,
      rcDoubleMaster: false,
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

  hostRoleChange = (value, key) => {
    const { dataSource, updateParentState } = this.props
    updateParentState({
      diyData: {
        ...dataSource,
        [`hostRole-${key}`]: value,
      },
    })
  }

  renderHostList = () => {
    const { dataSource, form, removeRcField } = this.props
    const { getFieldProps, getFieldValue } = form
    const keys = getFieldValue('rcKeys')
    if (isEmpty(keys)) {
      return <div className="hintColor cluster-host-list">暂未添加</div>
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
              <RadioGroup
                {...getFieldProps(`hostRole-${key}`, {
                  initialValue: dataSource[`hostRole-${key}`] || 'worker',
                  rules: [{
                    validator: (rules, value, callback) =>
                      this.checkHostRole(rules, value, callback, key),
                  }],
                  onChange: value => this.hostRoleChange(value, key),
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
          rcMasterError &&
          <Row className="master-error">
            <Col offset={4} className="failedColor">
              <Icon type="exclamation-circle-o" />
              {rcDoubleMaster ?
                ` 不支持添加2个 Master 节点${isAddHosts ? '（集群中已存在1个）' : ''}`
                : ' 请至少选择一个节点作为master节点'}
            </Col>
          </Row>
        }
      </div>
    )
  }
}
