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

  removeItem = key => {
    const { updateState, dataSource } = this.props
    const finalData = Object.assign({}, dataSource, {
      keys: dataSource.keys.filter(_key => _key !== key),
    })
    updateState(finalData)
  }

  renderHostList = () => {
    const { dataSource, form } = this.props
    const { getFieldProps } = form
    const keys = dataSource.keys
    if (isEmpty(keys)) {
      return
    }
    return keys.map(key => {
      return (
        <Row className="cluster-host-list">
          <Col span={6}>
            <FormItem>
              <Input
                {...getFieldProps(`hostName-${key}`, {
                  initialValue: dataSource[`host-${key}`],
                })}
                placeholder={'主机名'}
              />
            </FormItem>
          </Col>
          <Col span={6} offset={1}>
            <FormItem>
              <div>{dataSource[`host-${key}`]}</div>
            </FormItem>
          </Col>
          <Col span={6} offset={1}>
            <FormItem>
              <Checkbox
                {...getFieldProps(`master-${key}`)}
                className="ant-checkbox-inline"
              >
                master
              </Checkbox>
              <Checkbox
                {...getFieldProps(`worker-${key}`)}
                className="ant-checkbox-inline"
              >
                worker
              </Checkbox>
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <FormItem>
              <Button type="dashed" onClick={() => this.removeItem(key)}><Icon type="delete"/></Button>
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
    const { formItemLayout, updateState, dataSource } = this.props
    return (
      <div className="diy-hosts">
        {
          visible &&
          <ExistingModal
            visible={visible}
            onCancel={this.toggleVisible}
            onChange={updateState}
            sourceData={dataSource}
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
      </div>
    )
  }
}
