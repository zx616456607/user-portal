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
    if (!this.props.imageInfo.dockerfileMarkdown) {
      return(
        <Card className="dockerfile">
          <h2>not dockerfile</h2>
        </Card>
      )
    }
    const {dockerfileMarkdown} = this.props.imageInfo
    if (isFetching) {
      return (
        <Card className="dockerfile">
          <div className="loadingBox">
          <Spin size="large" />
          </div>
        </Card>
      )
    }
    if (dockerfileMarkdown == '') {
      return (
        <Card className="dockerfile">
        <h2>not dockerfile</h2>
        </Card>
      )
    }
    return (
      <Card className="dockerfile">
        <div dangerouslySetInnerHTML={{__html:dockerfileMarkdown}}></div>
      </Card>
    )
  }
}
