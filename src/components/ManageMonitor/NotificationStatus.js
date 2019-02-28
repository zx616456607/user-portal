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

const no = Symbol('no-note')
const success = Symbol('success-note')
const fail = Symbol('fail-note')

const getColor = sml => {
  if (sml === no) return 'disabledColor'
  if (sml === success) return 'successColor'
  return 'failedColor'
}

const getLabel = sml => {
  if (sml === no) return '未发送通知'
  if (sml === success) return '发送成功'
  return '发送失败'
}

const getIconType = type => {
  if (type === 'ding') return DingIcon
  if (type === 'phone') return PhoneIcon
  return MailIcon
}

const getNotiData = (s, res) => {
  const obj = { ding: no, phone: no, email: no }
  if (s === 0 || !res || !res.length) return obj
  if (s === 1) {
    res.map(r => obj[r.type] = success)
    return obj
  }
  res.map(r => obj[r.type] = r.errMsg ? fail : success )
  return obj
}

const NotificationStatus = ({ data }) => {
  const { status, results } = data || {}
  const noteStatus = getNotiData(status, results)
  return (
    <span>
      {
        Object.keys(noteStatus).map(n => {
          const Icon = getIconType(n)
          return (
            <Tooltip title={getLabel(noteStatus[n])}>
              <Icon
                style={{ fontSize: 15, margin: '0 4px', cursor: 'pointer' }}
                className={classnames(getColor(noteStatus[n]))}
                type={'plus'}
              />
            </Tooltip>
          )
        })
      }
    </span>
  )
}

export default NotificationStatus
