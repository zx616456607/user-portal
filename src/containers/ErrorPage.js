/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Error page
 * 
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { Breadcrumb } from 'antd'

export default class ErrorPage extends Component {
  render() {
    return (
      <div>
        <div className="tenx-layout-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item>控制台</Breadcrumb.Item>
            <Breadcrumb.Item>404</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="tenx-layout-container">
          <h1>404 not found</h1>
        </div>
      </div>
    )
  }
}