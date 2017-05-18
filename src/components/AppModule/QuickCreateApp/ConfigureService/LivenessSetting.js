/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: liveness setting for service
 *
 * v0.1 - 2017-05-18
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import {
  Form, Collapse, Row, Col,
} from 'antd'
import './style/LivenessSetting.less'

const Panel = Collapse.Panel

const LivenessSetting = React.createClass({
  render() {
    const header = (
      <div className="headerBox">
        <Row className="header" key="header">
          <Col span={3} className="left" key="left">
            <div className="line"></div>
            <span className="title">高可用</span>
          </Col>
          <Col span={21} key="right">
            <div className="desc">设置重启检查项目，如遇到检查项不满足，为自动保证服务高可用，将自动重启该服务</div>
          </Col>
        </Row>
      </div>
    )
    return (
      <div id="livenessConfigureService">
        <Collapse>
          <Panel header={header}>
            <div>test</div>
          </Panel>
        </Collapse>
      </div>
    )
  }
})

export default LivenessSetting