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
    const { dockerfileMarkdown } = this.props.imageInfo
    const isFetching = this.props.isFetching
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
        <h2>not attribute</h2>
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
