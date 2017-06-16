/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Request errors handler
 *
 * v0.1 - 2016-09-21
 * @author Zhangpc
 */
'use strict'

class ClientError extends Error {
  constructor(data, statusCode) {
    super()
    this.message = data
    this.statusCode = statusCode
  }
}

class InvalidDataError extends ClientError {
  constructor(data, statusCode) {
    super(data, statusCode)
    this.statusCode = 400
  }
}

// 认证错误
class AuthenticationError extends ClientError {
  constructor(data, statusCode) {
    super(data, statusCode)
    this.statusCode = 401
  }
}

// 授权错误
class AuthorizationError extends ClientError {
  constructor(data, statusCode) {
    super(data, statusCode)
    this.statusCode = 403
  }
}

class NotFoundError extends ClientError {
  constructor(data, statusCode) {
    super(data, statusCode)
    this.statusCode = 404
  }
}

class ServerError extends ClientError {
  constructor(data, statusCode) {
    super(data, statusCode)
    switch (data.code) {
      case 'ENOTFOUND':
        this.message = `Request ${data.host} ENOTFOUND`
        break
      default:
        this.message = 'Internal server error'
    }
    this.statusCode = 500
  }
}

class InvalidHttpCodeError extends Error {
  constructor(err) {
    super()
    this.message = err.message
    switch (err.name) {
      case 'ResponseTimeoutError':
      case 'ConnectionTimeoutError':
        this.statusCode = 504
        this.message = `Gateway Timeout`
        break
      case 'RequestError':
        this.statusCode = 503
        break
      default:
        this.statusCode = 500
    }
    // For request error
    switch (err.code) {
      case 'ETIMEDOUT':
        this.message = `Gateway Timeout`
        this.statusCode = 504
        break
      case 'ECONNREFUSED':
        this.message = `The connection could not be established`
        this.statusCode = 501
        break
    }
  }
}

function get(res) {
  const statusCode = res.statusCode
  const data = res.data || {}
  switch (statusCode) {
    case 400:
      return new InvalidDataError(data)
    case 401:
      return new AuthenticationError(data)
    case 403:
      return new AuthorizationError(data)
    case 404:
      return new NotFoundError(data)
    case 500:
      return new ServerError(data)
    case -1:
      return new InvalidHttpCodeError(res)
    default:
      return new ClientError(data, statusCode)
  }
}

exports.ClientError = ClientError
exports.InvalidDataError = InvalidDataError
exports.AuthenticationError = AuthenticationError
exports.AuthorizationError = AuthorizationError
exports.NotFoundError = NotFoundError
exports.ServerError = ServerError
exports.InvalidHttpCodeError = InvalidHttpCodeError
exports.get = get