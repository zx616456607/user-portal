/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Request api tools
 * support promise and callback
 * 
 * v0.1 - 2016-09-13
 * @author Zhangpc
 */
'use strict'

const urllib = require('urllib')
const _ = require('lodash')
const errors = require('./errors')
const logger = require('../../../utils/logger').getLogger('tenx_api/v1/request')
const DEFAULT_PROTOCOL = 'http'
const DEFAULT_VERSION = 'v1'
const DEFAULT_TIMEOUT = 1000 * 20
const DEFAULT_DATATYPE = 'json'

module.exports = (protocol, host, version, auth, timeout) => {
  !protocol && (protocol = DEFAULT_PROTOCOL)
  !version && (version = DEFAULT_VERSION)
  !timeout && (timeout = DEFAULT_TIMEOUT)
  
  const _getUrl = (object) => `${protocol}://${host}/api/${version}${object.endpoint}`

  const _isSuccess = (statusCode) => statusCode >= 300

  const _makeRequest = (object, callback) => {
    object = _.clone(object)
    let url = _getUrl(object)
    const options = {}
    delete object.endpoint
    options.dataType = object.dataType || DEFAULT_DATATYPE
    options.timeout = timeout
    options.headers = options.headers
    if (!callback) {
      return urllib.request(url, object).then((result) => {
        if (_isSuccess(result.res.statusCode)) {
          return result.data
        }
        throw errors.get(result.res)
      }).catch((err) => {
        logger.error(err.stack)
        throw err
      })
    }
    return urllib.request(url, object, (err, data, res) => {
      if (err) {
        return callback(err)
      }

      if (_isSuccess(res.statusCode)) {
        return callback(null, data)
      }

      callback(errors.get(result.res))
    })
  }

  return (object, callback) => {
    if (auth) {
      !object.headers && (object.headers = {})
      object.headers.Username = auth.user
      object.headers.Authorization = `token ${auth.token}`
    }
    return _makeRequest(object, callback)
  }
}