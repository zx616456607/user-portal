/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 *
 *
 * @author Songsz
 * @date 2019-02-28
 *
*/

import React from 'react'
import { Tooltip } from 'antd'
import { Dingding as DingIcon, Phone as PhoneIcon, Mail as MailIcon } from '@tenx-ui/icon'
import classnames from 'classnames'

const getColor = sml => {
  if (sml === 0) return 'disabledColor'
  if (sml === 1) return 'successColor'
  return 'failedColor'
}

const getLabel = sml => {
  if (sml === 0) return '未发送通知'
  if (sml === 1) return '发送成功'
  return '发送失败'
}

const getIconType = type => {
  if (type === 'ding') return DingIcon
  if (type === 'phone') return PhoneIcon
  return MailIcon
}

const getNotiData = res => res.map(r => ({
  icon: getIconType(r.type),
  tooltip: getLabel(r.status),
  color: getColor(r.status),
}))

const NotificationStatus = ({ data }) => <span>
  {
    getNotiData(data || []).map(n => {
      const Icon = n.icon
      return (
        <Tooltip title={n.tooltip}>
          <Icon
            style={{ fontSize: 15, margin: '0 4px', cursor: 'pointer' }}
            className={classnames(n.color)}
          />
        </Tooltip>
      )
    })
  }
</span>

export default NotificationStatus
