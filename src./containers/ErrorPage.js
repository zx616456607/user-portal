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
      <div id='NotFoundErrorPageBox'>
        <iframe className='NotFoundErrorPage' src='/ErrorPage/index.html'>
        </iframe>
      </div>
    )
  }
}