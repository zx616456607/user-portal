/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Utility for different notification handler
 * v0.2 - 2017-06-27
 * @author Lei, Zhangpc
 */

import React from 'react'
import { Spin, notification } from 'antd'
import { genRandomString } from '../../common/tools'
import { connect } from 'react-redux'
import { camelize } from  'humps'
import Header from './Header'

let store
const DEFAULT_CONFIG = {
  top: 60,
  duration: 10,
}

// Set notification global
notification.config(DEFAULT_CONFIG)

class Notification {
  // timeout is optional, and used for loading interval
  constructor(timeout) {
    // generate a key, only required for loading notification
    this.key = genRandomString(10)
    this.timeout = timeout
    this.closeTimeoutObj = {}
  }

  init(initStore) {
    store = initStore
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

  check(message, description) {
    const state = store.getState()
    const { notifications } = state
    let isExist = false
    for(let key in notifications) {
      const item = notifications[key]
      if (item.message === message && item.description === description) {
        isExist = true
        let count = item.count || 1
        count ++
        this.updateNotification(key, { count })
        break
      }
    }
    return isExist
  }

  // Show success notification
  success(message, description, duration) {
    let desc = description || ''
    notification.success({
      message: (
        <div style={{ fontSize: '13px', paddingRight: '20px', color: '#666'}}>
          {message}
        </div>
      ),
      description: desc,
      duration: duration || DEFAULT_CONFIG.duration,
    })
  }

  // Show info notification
  info(message) {
    notification.info({
      message: (
        <div style={{ fontSize: '13px', paddingRight: '20px', color: '#666'}}>
          {message}
        </div>
      ),
      duration: 5,
    })
  }

  // Show warn notification
  warn(message, description, duration) {
    let desc = description || ''
    let timeout = duration
    if (timeout === undefined) {
      timeout = DEFAULT_CONFIG.duration
    }
    notification.info({
      message: (
        <div style={{ fontSize: '13px', paddingRight: '20px', color: '#666'}}>
          {message}
        </div>
      ),
      description: desc,
      duration: timeout
    })
  }

  addNotification(key, content) {
    setTimeout(() => {
      store.dispatch({
        type: 'ADD_NOTIFICATION',
        key,
        content,
      })
    })
  }

  removeNotification(key) {
    setTimeout(() => {
      store.dispatch({
        type: 'DELETE_NOTIFICATION',
        key,
      })
    })
  }

  updateNotification(key, content) {
    setTimeout(() => {
      store.dispatch({
        type: 'UPDATE_NOTIFICATION',
        key,
        content,
      })
    })
  }

  // Show error notification: message & description
  error(message, description, duration) {
    description = description || ''
    duration = duration || DEFAULT_CONFIG.duration
    if (message && message.message) {
      message = message.message
    }
    if (typeof message !== 'string') {
      message = '请求错误'
    }
    if (this.check(message, description)) {
      return
    }
    const key = camelize(`error${genRandomString(5)}`)
    this.addNotification(key, { message, description, duration, count: 1 })
    setTimeout(this.removeNotification.bind(this, key), duration * 1000)
    notification.error({
      message: <Header store={store} message={message} id={key} />,
      description,
      duration,
    })
  }
}

module.exports = Notification
