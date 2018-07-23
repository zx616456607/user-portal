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
import { Form } from 'antd'
import Title from '../../../../src/components/Title'
import './style/index.less'
// import * as dnsRecordActions from '../../actions/dnsRecord'
import CreateNameAndTarget from './components/NameAndTarget'
import IngressWhiteList from './components/IngressWhiteList'
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


// const notification = new Notification()

class CreateSecurityGroup extends React.Component {

  state={
    isEdit: false,
  }
  render() {
    const { form } = this.props
    return <QueueAnim className="createSecurityGroup">
      <div className="createSecurityPage" key="security">
        <Title title="安全组" />
        <div className="securityGroudHeader">
          <span className="returnBtn">
            <span className="btnLeft"></span>
            <span className="btnRight">返回</span>
          </span>
          <span className="headerTitle">
            创建安全组
          </span>
        </div>
        <div className="securityGroudContent">
          <CreateNameAndTarget form={form} formItemLayout={formItemLayout} />
          <h3>隔离对象的访问白名单</h3>
          <IngressWhiteList form={form} />
        </div>
      </div>
    </QueueAnim>
  }
}
export default connect()(Form.create()(CreateSecurityGroup))
