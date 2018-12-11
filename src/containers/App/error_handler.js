/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Error handler
 *
 * v0.1 - 2016-11-24
 * @author Zhangpc
*/

import React, { Component, PropTypes } from 'react'
import { message as MSG } from 'antd'
import { defineMessages } from 'react-intl'
import Notification from '../../components/Notification'

const notification = new Notification()
const messages = defineMessages({
  error: {
    id: 'App.error',
    defaultMessage: '请求错误',
  },
  error400: {
    id: 'App.error.400',
    defaultMessage: '请求{resource}发生客户端错误',
  },
  error401: {
    id: 'App.error.401',
    defaultMessage: '请求{resource}未授权',
  },
  error403: {
    id: 'App.error.403',
    defaultMessage: '请求{resource}被拒绝',
  },
  error404: {
    id: 'App.error.404',
    defaultMessage: '{resource}未找到',
  },
  error409: {
    id: 'App.error.409',
    defaultMessage: '请求{resource}发生冲突',
  },
  error500: {
    id: 'App.error.500',
    defaultMessage: '请求{resource}发生服务器错误',
  },
  error501: {
    id: 'App.error.501',
    defaultMessage: '平台后端服务已停止，或正在构建更新，请稍后再试',
  },
  error502: {
    id: 'App.error.502',
    defaultMessage: '请求{resource}无响应',
  },
  error503: {
    id: 'App.error.503',
    defaultMessage: '网络或服务暂时不可用，请您稍后再试',
  },
  error504: {
    id: 'App.error.504',
    defaultMessage: '请求{resource}超时',
  },
})

export default function handler(error, intl, cancelNotification = false) {
  const { formatMessage } = intl
  if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    error.message = {
      code: 503,
      message: ''
    }
  }
  const defaultError = formatMessage(messages.error)
  const statusCode = error.statusCode
  let { message, description, duration } = _errorFormat(error, statusCode)
  if (typeof message !== 'string') {
    message = '请求错误'
  }
  if (typeof description !== 'string') {
    description = ''
  }
  // For network interruption
  if (error.message.code === 503) {
    MSG.error(message)
  } else {
    if (cancelNotification === false) {
    notification.error(message, description, duration)
    }
  }
  return message
  // Formate error message
  function _errorFormat(error, statusCode) {
    const errorMessage = error.message
    let { message, details, code } = errorMessage
    if (message === undefined) {
      message = error.message
    }
    const { title, duration, tempDes } = _translateMessageByCode(errorMessage, statusCode)
    return {
      message: title,
      description: tempDes || message,
      duration,
    }
  }

  // Formate error message by code
  function _translateMessageByCode(message, statusCode) {
    let { details, code } = message
    let { name, kind } = details || {}
    const data = {
      title: defaultError,
      duration: null,
    }
    code = code === undefined ? statusCode : code
    const resource = _spellKindAndName(kind, name)
    if (code == 401) {
      data.title = formatMessage(messages.error401, { resource })
      return data
    }
    if (code == 403) {
      data.title = formatMessage(messages.error403, { resource })
      return data
    }
    if (code == 404) {
      data.title = formatMessage(messages.error404, { resource })
      data.duration = 8
      if (message.message === "cluster undefined not found") {
        data.title = "当前项目的集群列表为空"
        data.tempDes = "请重新选择项目"
      }
      return data
    }
    if (code == 409) {
      data.title = formatMessage(messages.error409, { resource })
      return data
    }
    if (code < 500) {
      data.title = formatMessage(messages.error400, { resource })
      return data
    }
    if (code === 501 && typeof message === 'string') {
      if (message.includes('ECONNREFUSED')) {
        data.title = formatMessage(messages.error501, { resource })
        return data
      }
    }
    if (code == 502) {
      data.title = formatMessage(messages.error502, { resource })
      return data
    }
    if (code == 503) {
      data.title = formatMessage(messages.error503)
      return data
    }
    if (code == 504) {
      data.title = formatMessage(messages.error504, { resource })
      return data
    }
    if (code >= 500) {
      data.title = formatMessage(messages.error500, { resource })
      return data
    }
    return data
  }

  // Spell kind and name
  function _spellKindAndName(kind, name) {
    if (!kind && !name) {
      return ''
    }
    if (!kind || !name) {
      return kind || name
    }
    return `${kind} ${name}`
  }
}
