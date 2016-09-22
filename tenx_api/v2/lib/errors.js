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

function get(res) {
  switch (res.statusCode) {
    case 400:
      return new InvalidDataError(res.data)
    case 401:
    case 403:
        return new AuthorizationError(res.data)
    case 404:
        return new NotFoundError(res.data)
    default:
        return new ClientError(res.data, res.statusCode)
  }
}

module.exports.ClientError = ClientError
module.exports.InvalidDataError = InvalidDataError
module.exports.AuthorizationError = AuthorizationError
module.exports.NotFoundError = NotFoundError
module.exports.get = get