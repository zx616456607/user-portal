/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * iaas 409 notify modal info
 *
 * v0.1 - 2018-12-12
 * @author rensiwei
 */

import React from 'react'
import { notification, Button } from 'antd'
export default function modal409(type) {
  const key = `open${Date.now()}`
  const btnClick = () => {
    notification.close(key)
  }
  const btn = (
    <Button type="primary" onClick={btnClick}>
      知道了
    </Button>
  )
  notification.open({
    description: <div>
      <i style={{ top: '33%' }} className="ant-notification-notice-icon ant-notification-notice-icon-warning anticon anticon-exclamation-circle-o"></i>
      <div style={{ fontSize: 14, color: '#666', paddingLeft: 50 }}>该资源池已被集群伸缩策略使用，不支持{type}。</div>
      <div style={{ paddingLeft: 50 }}>请在「集群伸缩策略」页面删除相应的策略后，方可{type}该资源池</div>
    </div>,
    btn,
    key,
    duration: null,
  })
}
