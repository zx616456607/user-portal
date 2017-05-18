/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: config map setting for service
 *
 * v0.1 - 2017-05-18
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import {
  Form, Collapse, Row, Col,
} from 'antd'
import './style/ConfigMapSetting.less'

const Panel = Collapse.Panel

const ConfigMapSetting = React.createClass({
  render() {
    const header = (
      <div className="headerBox">
        <Row className="header" key="header">
          <Col span={3} className="left" key="left">
            <div className="line"></div>
            <span className="title">配置管理</span>
          </Col>
          <Col span={21} key="right">
            <div className="desc">满足您统一管理某些服务配置文件的需求，即：不用停止服务，即可变更多个容器内的配置文件</div>
          </Col>
        </Row>
      </div>
    )
    return (
      <div id="configMapConfigureService">
        <Collapse>
          <Panel header={header}>
            <div>test</div>
          </Panel>
        </Collapse>
      </div>
    )
  }
})

export default ConfigMapSetting