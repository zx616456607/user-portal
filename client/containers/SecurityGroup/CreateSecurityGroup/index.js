/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Create SecurityGroup
 *
 * v0.1 - 2018-07-23
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Form, Row, Col, Button } from 'antd'
import Title from '../../../../src/components/Title'
import './style/index.less'
// import * as dnsRecordActions from '../../actions/dnsRecord'
import CreateNameAndTarget from './components/NameAndTarget'
import IngressAndEgressWhiteList from './components/IngressAndEgressWhiteList'
import { browserHistory } from 'react-router'
// import Notification from '../../../../src/components/Notification'

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
  colon: false,
}
// const tailFormItemLayout = {
//   wrapperCol: {
//     xs: {
//       span: 10,
//       offset: 4,
//     },
//     sm: {
//       span: 14,
//       offset: 3,
//     },
//   },
// }

class CreateSecurityGroup extends React.Component {

  state={
    isEdit: false,
  }

  submit = () => {
    const { form } = this.props
    form.validateFields(errors => {
      // console.log( '////', values )
      if (errors) {
        return
      }
    })
  }
  render() {
    const { form } = this.props
    return <QueueAnim className="createSecurityGroup">
      <div className="createSecurityPage" key="security">
        <Title title="安全组" />
        <div className="securityGroudHeader">
          <span className="returnBtn">
            <span className="btnLeft"></span>
            <span className="btnRight" onClick={() => browserHistory.goBack()}>返回</span>
          </span>
          <span className="headerTitle">
            <span className="headerLeft"></span>
            <span>创建安全组</span>
          </span>
        </div>
        <div className="securityGroudContent">
          <CreateNameAndTarget form={form} formItemLayout={formItemLayout} />
          <p className="whiteList">隔离对象的访问白名单</p>
          <IngressAndEgressWhiteList form={form} />
          <Row className="submitBtn">
            <Col span={4}></Col>
            <Col span={20}>
              <Button onClick={() => browserHistory.goBack()} style={{ marginRight: 8 }}>取消</Button>
              <Button type="primary" onClick={this.submit}>确定</Button>
            </Col>
          </Row>
        </div>
      </div>
    </QueueAnim>
  }
}
export default connect()(Form.create()(CreateSecurityGroup))
