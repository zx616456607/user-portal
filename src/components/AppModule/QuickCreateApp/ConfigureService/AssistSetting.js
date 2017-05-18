/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: assist setting for service
 *
 * v0.1 - 2017-05-18
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import {
  Form, Collapse, Row, Col,
} from 'antd'
import './style/AssistSetting.less'

const Panel = Collapse.Panel

const AssistSetting = React.createClass({
  render() {
    const header = (
      <div className="headerBox">
        <Row className="header" key="header">
          <Col span={3} className="left" key="left">
            <div className="line"></div>
            <span className="title">辅助设置</span>
          </Col>
          <Col span={21} key="right">
            <div className="desc">一些常用的辅助设置：①容器进入点，②启动执行命令，③重新部署所用镜像，④容器时区设置</div>
          </Col>
        </Row>
      </div>
    )
    return (
      <div id="assistConfigureService">
        <Collapse>
          <Panel header={header}>
            <div>test</div>
          </Panel>
        </Collapse>
      </div>
    )
  }
})

export default AssistSetting