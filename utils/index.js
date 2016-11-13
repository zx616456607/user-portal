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

exports.formatDate = function(timestamp) {
  if ( !timestamp || timestamp === '' ) {
    return moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
  } else {
    return moment(timestamp).format("YYYY-MM-DD HH:mm:ss")
  }
}

exports.calcuDate = function(beginDate){
  var begin = Date.parse(beginDate);
  var end = new Date();
  var date = end - begin;

  var days = Math.floor(date/(24*3600*1000));

  var months = Math.floor(days / 30);
  var leave1 = date%(24*3600*1000);
  var hours=Math.floor(leave1/(3600*1000));

  var leave2=leave1%(3600*1000);
  var minutes=Math.floor(leave2/(60*1000));

  var leave3=leave2%(60*1000);
  var seconds=Math.round(leave3/1000);

  if (months > 0) {
    return months + '月前';
  } else if (days > 0) {
    return days + '天前';
  } else if (hours > 0) {
    return hours + '小时前';
  } else if (minutes > 0) {
    return minutes + '分钟前';
  } else if (seconds > 0) {
    return seconds + '秒前';
  } else {
    return '1秒前';
  }
}

exports.getClientIP = function(req){
  var ipAddress;
  var headers = req.headers;
  // console.log('headers:\n' + JSON.stringify(req.headers, null, 4));
  var forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'];
  forwardedIpsStr ? (ipAddress = forwardedIpsStr) : (ipAddress = null);
  if (!ipAddress) {
    ipAddress = req.connection.remoteAddress;
  } else if (ipAddress.indexOf(',') > -1) {
    var ipAddressArray = ipAddress.split(',');
    ipAddress = ipAddressArray[0];
  }
  return ipAddress;
}

exports.getHostname = function () {
  return os.hostname()
}

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