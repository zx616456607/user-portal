/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * DetailInfo component
 *
 * v0.1 - 2016-10-19
 * @author BaiYu
 */

import React, { Component } from 'react'
import { Card , Spin} from 'antd'

export default class Dockerfile extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const isFetching = this.props.isFetching
    const dockerfile = this.props.dockerfile
    if (isFetching) {
      return (
        <Card className="dockerfile">
          <div className="loadingBox">
          <Spin size="large" />
          </div>
        </Card>
      )
    }
    if (dockerfile == '' || !dockerfile) {
      return (
        <Card className="dockerfile">
          还没有添加 Dockerfile
        </Card>
      )
    }
    return (
      <Card className="dockerfile">
        <pre>{dockerfile}</pre>
      </Card>
    )
  }
}
