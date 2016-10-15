/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Nomal tools
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
'use strict'

const moment = require('moment')

exports.DateNow = function () {
  return new Date(moment().add(8, 'hour'))
}

exports.toUTCString = function (date) {
  if (!date || !date.toUTCString) {
    return null
  }
  return `${date.toUTCString()}+0800`
}

exports.promisify = function(fn, receiver) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key ++) {
      args[_key] = arguments[_key]
    }

    return new Promise(function (resolve, reject) {
      fn.apply(receiver, [].concat(args, [function (err, res) {
        return err ? reject(err) : resolve(res)
      }]))
    })
  }
}


exports.handleExecError = function(method, err) {
  if (!err || Object.keys(err).length < 1) {
    return {}
  }
  let stdout, stderr
  if (err.stdout) stdout = err.stdout.toString()
  if (err.stderr) stderr = err.stderr.toString()
  if (stdout || stderr) {
    logger.error(method, 'stdout: ' + stdout)
    logger.error(method, 'stderr: ' + stderr)
    return {stdout, stderr}
  }
  logger.error(method, JSON.stringify(err))
  return err
}