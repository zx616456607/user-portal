/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * notice group component
 *
 * v0.1 - 2018-10-16
 * @author BaiYu
 */

import React from 'react'
import { Row, Col } from 'antd'

export default class BindRule extends React.Component {

  render() {
    return (
      <div className="bindRule">
        <div>
          <span className="titleName">告警策略</span>
          <Row className="row">
            <Col span={5}>mixins</Col>
            <Col span={5}>sfsdf</Col>
            <Col span={5}>sfsf</Col>
            <Col span={5}>wwwf</Col>
            <Col span={4}>test</Col>
          </Row>
        </div>
        <div className="titleName">自动伸缩策略</div>
        <Row className="row">
          <Col span={5}>mixins</Col>
          <Col span={5}>sfsdf</Col>
          <Col span={5}>sfsf</Col>
          <Col span={5}>wwwf</Col>
          <Col span={4}>test</Col>
        </Row>
        <div className="br"></div>
      </div>
    )
  }
}