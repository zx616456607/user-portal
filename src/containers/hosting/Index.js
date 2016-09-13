import React, { Component, PropTypes } from 'react'
import { Breadcrumb } from 'antd'

export default class ErrorPage extends Component {
  render() {
    return (
      <div>
        <div className="tenx-layout-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item>控制台</Breadcrumb.Item>
            <Breadcrumb.Item>主机管理</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="tenx-layout-container">
          <h1>主机管理</h1>
        </div>
      </div>
    )
  }
}