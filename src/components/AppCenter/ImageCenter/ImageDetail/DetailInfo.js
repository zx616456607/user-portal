/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * DetailInfo component
 *
 * v0.1 - 2016-10-09
 * @author BaiYu
 */
import React, { Component } from 'react'
import { Card } from 'antd'
import './style/DetailInfo.less'

export default class DetailInfo extends Component {
  constructor(props) {
    super(props);
    // codeBox
  }
  render() {
    let detailMarkdown  = this.props.detailInfo
    if (detailMarkdown == '' || !detailMarkdown) {
      detailMarkdown = '还没有添加详细信息'
    }
    return (
      <Card className="imageDetailInfo markdown">
        <div dangerouslySetInnerHTML={{__html:detailMarkdown}}></div>
      </Card>
    )
  }
}

DetailInfo.propTypes = {
  //
}
