/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Monitor chart template
 *
 * v0.1 - 2017-12-20
 * @author zhangxuan
 */

import React from 'react'
import { Card, Button, Icon } from 'antd'

export default class MonitorChartTemp extends React.Component {
  cardExtra() {
    return [
      <Icon key="salt" type="arrow-salt" />,
      <Icon key="setting" type="setting" />
    ]
  }
  render() {
    const { title } = this.props
    return (
      <Card title={title} className="chartBody" extra={this.cardExtra()}>
        
      </Card>
    )
  }
}