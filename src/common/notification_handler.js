/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Utility for different notification handler
 * v0.1 - 2016-12-09
 * @author Lei
 */

import React from 'react'
import { Spin, notification } from 'antd'
import { genRandomString } from './tools'

class NotificationHandler {
  // timeout is optional, and used for loading interval
  constructor(timeout) {
    // generate a key, only required for loading notification
    this.key = genRandomString(10)
    this.timeout = timeout
  }

  // Open loading notification
  spin(message) {
    let key = this.key
    notification.open({
      key,
      message: (
        <div>
          <Spin /> {message}
        </div>
      ),
      // Should close it manually
      duration: 0,
    })
    return () => {
      this.close(key)
    }
  }
  // Close loading notification
  close(key) {
    let _key = key || this.key
    let timeout = this.timeout || 500
    setTimeout(function () {
      notification.close(_key)
    }, timeout)
  }
  // Show success notification
  success(message) {
    notification.success({
      message: (
        <div style={{ fontSize: '13px', paddingRight: '20px', color: '#666'}}>
          {message}
        </div>
      )
    })
  }
  // Show info notification
  info(message) {
    notification.info({
      message: (
        <div style={{ fontSize: '13px', paddingRight: '20px', color: '#666'}}>
          {message}
        </div>
      )
    })
  }
  // Show warn notification
  warn(message) {
    notification.info({
      message: (
        <div style={{ fontSize: '13px', paddingRight: '20px', color: '#666'}}>
          {message}
        </div>
      )
    })
  }
  // Show error notification: message & description
  error(message, description) {
    let desc = description || ''
    notification.error({
      message: (
        <div style={{ fontSize: '13px', paddingRight: '20px', color: '#666'}}>
          {message}
        </div>
      ),
      description: desc,
      duration: 0
    })
  }
}

module.exports = NotificationHandler