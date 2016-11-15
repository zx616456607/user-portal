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
import { Card , Spin ,Icon} from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'

const menusText = defineMessages({
  contributor: {
    id: 'AppCenter.ImageCenter.ImageDetail.contributor',
    defaultMessage: '贡献者',
  },
  favouriteNumber: {
    id: 'AppCenter.ImageCenter.ImageDetail.favouriteNumber',
    defaultMessage: '收藏数',
  },
  creationTime: {
    id: 'AppCenter.ImageCenter.ImageDetail.creationTime',
    defaultMessage: '创建时间',
  }
})
class Attribute extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const detailInfo = this.props.detailInfo
    if (detailInfo == '') {
      return (
        <Card className="detailInfo">
        <h2>not attribute</h2>
        </Card>
      )
    }
    return (
      <Card className="attr">
        <ul id="attribute">
          <li className="leftKey"><Icon type="user" /><FormattedMessage{...menusText.contributor} />： &nbsp;{detailInfo.contributor}</li>
          <li className="leftKey"><Icon type="star-o" /><FormattedMessage{...menusText.favouriteNumber} />： &nbsp;{detailInfo.favouriteNumber} 个人收藏了该镜像</li>
          <li className="leftKey"><Icon type="clock-circle-o" /><FormattedMessage{...menusText.creationTime} />： &nbsp;{detailInfo.creationTime}</li>
        </ul>
      </Card>
    )
  }
}

export default (injectIntl(Attribute, {
  withRef: true,
}));
