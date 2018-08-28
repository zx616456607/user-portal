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
import { injectIntl } from 'react-intl'
import attributeIntl from './intl/attributeIntl'
import { formatDate, isValidateDate } from '../../../../common/tools'

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
    const { formatMessage } = this.props.intl
    return (
      <Card className="attr">
        <ul id="attribute">
          <li className="leftKey"><Icon type="clock-circle-o" />
            &nbsp;&nbsp;
            {formatMessage(attributeIntl.creationTime)}： &nbsp;
            {formatDate(detailInfo.creationTime)}
          </li>
          <li className="leftKey"><Icon type="clock-circle-o" />
            &nbsp;&nbsp;
            {formatMessage(attributeIntl.updateTime)}： &nbsp;
            {
              isValidateDate(detailInfo.updateTime)
              ? formatDate(detailInfo.updateTime)
              : formatDate(detailInfo.creationTime)
            }
          </li>
        </ul>
      </Card>
    )
  }
}

export default (injectIntl(Attribute, {
  withRef: true,
}));
