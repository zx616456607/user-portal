/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: advanced setting for service
 *
 * v0.1 - 2017-05-18
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import {
  Form, Collapse, Row, Col,
} from 'antd'
import './style/AdvancedSetting.less'

const Panel = Collapse.Panel

const AdvancedSetting = React.createClass({
  render() {
    const header = (
      <div className="headerBox">
        <Row className="header" key="header">
          <Col span={3} className="left" key="left">
            <div className="line"></div>
            <span className="title">高级设置</span>
          </Col>
          <Col span={21} key="right">
            <div className="desc">在高级设置里，您可以修改环境变量配置</div>
          </Col>
        </Row>
      </div>
    )
    return (
      <div id="advancedConfigureService">
        <Collapse>
          <Panel header={header}>
            <div>test</div>
          </Panel>
        </Collapse>
      </div>
    )
  }
})

export default AdvancedSetting