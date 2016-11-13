/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Common tools
 * v0.1 - 2016-10-19
 * @author Zhangpc
 */
'use strict'

const moment = require('moment')

/**
 * Format date
 */
export function formatDate(timestamp) {
  if ( !timestamp || timestamp === '' ) {
    return moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
  } else {
    return moment(timestamp).format("YYYY-MM-DD HH:mm:ss")
  }
}
/**
 * Calculate time
 * Option
 * - beginDate
 * Output
 * - three days ago, etc
 */
export function calcuDate(beginDate){
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

// Y year
// M month
// D day
// h hour
// m minute
// s second
export function formateDate(date, format) {
  if (Object.prototype.toString.call(date).indexOf('Date') < 0) {
    return date
  }
  if (typeof format !== 'string') {
    throw new Error('The second argument must be string')
  }
  const uDate = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds()
  }
  function _addZero(text) {
    return text.toString().length === 2 ? text : `0${text}`
  }
  return format.replace(/YYYY/, uDate.year).replace(/MM/, _addZero(uDate.month)).replace(/DD/, _addZero(uDate.day)).replace(/hh/, _addZero(uDate.hour)).replace(/mm/, _addZero(uDate.minute)).replace(/ss/, _addZero(uDate.second))
}


export function toQuerystring(obj, sep, eq) {
  sep = sep || '&'
  eq = eq || '='
  if (!obj) {
    return ''
  }
  return Object.keys(obj).map(function (k) {
    let ks = encodeURIComponent(stringifyPrimitive(k)) + eq
    if (Array.isArray(obj[k])) {
      return obj[k].map(function (v) {
        return ks + encodeURIComponent(stringifyPrimitive(v))
      }).join(sep)
    } else {
      return ks + encodeURIComponent(stringifyPrimitive(obj[k]))
    }
  }).join(sep)
  function stringifyPrimitive(v) {
    switch (typeof v) {
      case 'string':
        return v
      case 'boolean':
        return v ? 'true' : 'false'
      case 'number':
        return isFinite(v) ? v : ''
      default:
        return ''
    }
  }
}

export function getCookie(cName) {
  if (document.cookie.length === 0) {
    return null
  }
  let cStart = document.cookie.indexOf(cName + '=')
  if (cStart === -1) {
    return null
  }
  cStart = cStart + cName.length + 1
  let cEnd = document.cookie.indexOf(';', cStart)
  if (cEnd === -1) {
    cEnd = document.cookie.length
  }
  return unescape(document.cookie.substring(cStart, cEnd))
}

/**
 * Set cookie
 * options
 * - path: ;path=path (e.g., '/', '/mydir')
 * - domain: ;domain=domain (e.g., 'example.com' or 'subdomain.example.com')
 * - max-age: ;max-age=max-age-in-seconds (e.g., 60*60*24*365 or 31536000 for a year)
 * - expires: ;expires=date-in-GMTString-format
 */
export function setCookie(cName, value, options = {}) {
  if (getCookie(cName) && getCookie(cName) == value) {
    return
  }
  const cookieArray = []
  cookieArray.push(`${encodeURIComponent(cName)}=${value}`)
  if (options.domain) {
    cookieArray.push(`; domain=${options.domain}`)
  }
  if (options['max-age']) {
    cookieArray.push(`; max-age=${options['max-age']}`)
  }
  if (options.expires) {
    cookieArray.push(`; domain=${options.expires.toGMTString()}`)
  }
  cookieArray.push(`; path=${options.path ? options.path : '/'}`)
  const cookie = cookieArray.join('')
  document.cookie = cookie
}