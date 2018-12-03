/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/* ReadOnly Mode for ImageRepo
 *
 * v0.1 - 2018-11-26
 * @author lvjunfeng
 */

import React from 'react'
import './style/index.less'
import { Icon } from 'antd'
import TenxIcon from '@tenx-ui/icon/es/_old'
import itemIntl from '../../../../src/components/AppCenter/intl/itemIntl'

const ReadOnlyPrompt = ({ toggleVisible, visible, intl }) => {
  const { formatMessage } = intl
  return <div className="readOnlyPrompt">
    {
      visible ?
        <div className="readOnlyCont">
          <TenxIcon
            type="warning"
            size="14"
            color="#ffc001"
            style={{ marginRight: 6 }}
          />
          {formatMessage(itemIntl.readOnlyPrompt)}
          <div
            className="candlePrompt"
            onClick={() => toggleVisible(false)}
          >
            <Icon type="cross" />
          </div>
        </div>
        : null
    }
  </div>
}

export default ReadOnlyPrompt
