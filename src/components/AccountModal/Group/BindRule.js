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
    const { strategies, autoStrategies } = this.props

    return (
      <div className="bindRule">
        <div>
          <span className="titleName">告警策略</span>
          <Row className="row">
            {
              strategies.map((item,index) => <Col span={(index+1)%5 === 0 ? '4':'5'}>{item.name}</Col>)
            }
            {
              !strategies.length && <div className="text-center" style={{color: '#999'}}>暂无绑定策略</div>
            }
          </Row>
        </div>
        <div className="titleName">自动伸缩策略</div>
        <Row className="row">
          {
              autoStrategies.map((item,index) => <Col span={(index+1)%5 === 0 ? '4':'5'}>{item.name}</Col>)
          }
          {
              !autoStrategies.length && <div className="text-center" style={{color: '#999'}}>暂无绑定策略</div>
            }
        </Row>
        <div className="br"></div>
      </div>
    )
  }
}