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
// import QueueAnim from 'rc-queue-anim'
import { Form, Input, Icon, Row, Col, Button, Tooltip } from 'antd'
import './style/ReplicasRestrictIP.less'
// import DetailHeader from './DetailHeader'
// import IsolatedObj from './IsolatedObj'
// import WhiteList from './WhiteList'
// import * as securityActions from '../../../actions/securityGroup'
// import Notification from '../../../../src/components/Notification'

// const notification = new Notification()
const FormItem = Form.Item

class ReplicasRestrictIP extends React.Component {

  state={
    uuid: 0,
  }

  componentDidMount() {
    const { getFieldValue, setFieldsValue } = this.props.form
    const num = getFieldValue('replicas')
    for (let i = 0; i < num; i++) {
      let keys = getFieldValue('keys')
      keys = keys.concat(i)
      setFieldsValue({
        keys,
      })
    }
    this.setState({
      uuid: num,
    })
  }

  remove = k => {
    const { form } = this.props
    let keys = form.getFieldValue('keys')
    keys = keys.filter(key => {
      return key !== k
    })
    form.setFieldsValue({
      keys,
    })
  }

  add = () => {
    const { uuid } = this.state
    const { form } = this.props
    let keys = form.getFieldValue('keys')
    keys = keys.concat(uuid)
    form.setFieldsValue({
      keys,
    })
    this.setState({
      uuid: uuid + 1,
    })
  }

  // setform = () => {
  //   let num = this.state.uuid
  //   const { getFieldValue, setFieldsValue } = this.props.form
  //   const ln = getFieldValue('replicas')
  //   const keyLn = getFieldValue('keys').length
  //   for (let i = keyLn; i < ln; i++) {
  //     let keys = getFieldValue('keys')
  //     keys = keys.concat(num)
  //     setFieldsValue({
  //       keys,
  //     })
  //     num++
  //   }
  //   this.setState({ uuid: num })
  // }

  render() {
    // const { } = this.state
    const { getFieldProps, getFieldValue } = this.props.form
    getFieldProps('keys', {
      initialValue: [ ],
    })
    // if (getFieldValue('replicas') > getFieldValue('keys').length) {
    //   console.log( 'set' )
    //   this.setform()
    // }
    const isdelete = getFieldValue('replicas')
      && getFieldValue('replicas') >= getFieldValue('keys').length
      || false
    const formItems = getFieldValue('keys').map(k => {
      return (
        <FormItem key={k} wrapperCol={{ span: 16, offset: 4 }}>
          <Input {...getFieldProps(`replicasIP${k}`, {
            rules: [{
              required: true,
              whitespace: true,
              message: '请填写实例 IP（需属于 172.168.0.0/16）',
            }],
          })}
          style={{ width: 300, marginRight: 15 }}
          placeholder="请填写实例 IP（需属于 172.168.0.0/16）"
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
  // getfSecurityGroupDetail: securityActions.getfSecurityGroupDetail,
})(ReplicasRestrictIP)
