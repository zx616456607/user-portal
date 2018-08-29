/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * 实例数量 固定IP
 *
 * v0.1 - 2018-08-21
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import { Form, Input, Icon, Row, Col, Button, Tooltip } from 'antd'
import './style/ReplicasRestrictIP.less'
import * as podAction from '../../../../../src/actions/app_manage'
import Notification from '../../../../../src/components/Notification'

const notification = new Notification()
const FormItem = Form.Item

class ReplicasRestrictIP extends React.Component {

  state={
    uuid: 0,
    NetSegment: undefined, // 校验网段使用
  }

  componentDidMount() {
    const { cluster, getPodNetworkSegment, form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const num = getFieldValue('replicas')
    let ipKeys = []
    for (let i = 0; i < num; i++) {
      ipKeys = ipKeys.concat(i)
    }
    setFieldsValue({
      ipKeys,
    })
    getPodNetworkSegment(cluster, {
      success: {
        func: res => {
          this.setState({
            uuid: num,
            NetSegment: res.data, // 校验网段使用
          })
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          notification.warn('获取 Pod 网段数据失败')
          this.setState({
            uuid: num,
          })
        },
      },
    })
    this.props.Events.on('changeReplics', v => {
      const ipNum = getFieldValue('ipKeys').length
      if (v > ipNum) {
        let oldKey = getFieldValue('ipKeys')
        let uuNum = this.state.uuid
        for (let i = ipNum; i < v; i++) {
          oldKey = oldKey.concat(uuNum)
          uuNum = ++uuNum
        }
        setFieldsValue({
          ipKeys: oldKey,
        })
        this.setState({ uuid: uuNum })
      }
    })
  }

  componentWillUnmount() {
    const { form } = this.props
    const ipKeys = form.getFieldValue('ipKeys')
    ipKeys.forEach(i => {
      form.setFieldsValue({
        [`replicasIP${i}`]: undefined,
      })
    })
    form.setFieldsValue({
      ipKeys: [],
    })
  }

  remove = k => {
    const { form } = this.props
    let ipKeys = form.getFieldValue('ipKeys')
    ipKeys = ipKeys.filter(key => {
      return key !== k
    })
    form.setFieldsValue({
      ipKeys,
    })
  }

  add = () => {
    const { uuid } = this.state
    const { form } = this.props
    let ipKeys = form.getFieldValue('ipKeys')
    ipKeys = ipKeys.concat(uuid)
    form.setFieldsValue({
      ipKeys,
    })
    this.setState({
      uuid: uuid + 1,
    })
  }

  render() {
    const { NetSegment } = this.state
    const { getFieldProps, getFieldValue } = this.props.form
    getFieldProps('ipKeys', {
      initialValue: [ ],
    })
    const isdelete = getFieldValue('replicas')
      && getFieldValue('replicas') >= getFieldValue('ipKeys').length
      || false
    const formItems = getFieldValue('ipKeys').map(k => {
      return (
        <FormItem key={k} wrapperCol={{ span: 16, offset: 4 }}>
          <Input {...getFieldProps(`replicasIP${k}`, {
            rules: [{
              required: true,
              whitespace: true,
              message: `请填写实例 IP（需属于 ${NetSegment}）`,
            }],
          })}
          style={{ width: 300, marginRight: 15 }}
          placeholder= {`请填写实例 IP（需属于 ${NetSegment}）`}
          />
          <Button
            className="delBtn"
            disabled={isdelete}
            onClick={() => this.remove(k)}
          >
            <Icon type="delete" />
          </Button>
        </FormItem>
      )
    })
    const text = '可添加超出实例数量的固定实例 IP，可以确保水平扩展，自动弹性伸缩等功能可用（否则无法伸缩实例）'
    return <div className="restrictsIP">
      {formItems}
      <Row className="addInstance">
        <Col span={4}></Col>
        <Col>
          <span onClick={this.add} className="add">
            <Icon type="plus-circle-o" style={{ marginRight: 8 }}/>
            添加实例 IP
          </span>
          <span className="add">
            <Tooltip placement="top" title={text}>
              <Icon type="question-circle" style={{ marginLeft: 8 }} />
            </Tooltip>
          </span>
        </Col>
      </Row>
    </div>
  }
}

const mapStateToProps = ({
  entities: { current },
}) => {
  return {
    cluster: current.cluster.clusterID,
  }
}

export default connect(mapStateToProps, {
  getPodNetworkSegment: podAction.getPodNetworkSegment,
})(ReplicasRestrictIP)
