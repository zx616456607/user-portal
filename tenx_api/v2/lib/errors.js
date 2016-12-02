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
    switch (err.code) {
      case 'ETIMEDOUT':
        this.message = `Gateway Timeout`
        this.statusCode = 504
        break
    }
  }
}

function get(res) {
  switch (res.statusCode) {
    case 400:
      return new InvalidDataError(res.data)
    case 401:
      return new AuthenticationError(res.data)
    case 403:
      return new AuthorizationError(res.data)
    case 404:
      return new NotFoundError(res.data)
    case 500:
      return new ServerError(res.data)
    case -1:
      return new InvalidHttpCodeError(res)
    default:
      return new ClientError(res.data, res.statusCode)
  }
}

module.exports.ClientError = ClientError
module.exports.InvalidDataError = InvalidDataError
module.exports.AuthenticationError = AuthenticationError
module.exports.AuthorizationError = AuthorizationError
module.exports.NotFoundError = NotFoundError
module.exports.ServerError = ServerError
module.exports.get = get