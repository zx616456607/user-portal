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

import moment from 'moment'

const locale = window.appLocale.locale
// Set moment internationalize
if (locale === 'zh') {
  moment.locale('zh-cn')
} else {
  moment.locale('en', {
    relativeTime: {
      future: "in %s",
      past: "%s ago",
      s: "%d s",
      m: "a min",
      mm: "%d min",
      h: "1 h",
      hh: "%d h",
      d: "a day",
      dd: "%d days",
      M: "a month",
      MM: "%d months",
      y: "a year",
      yy: "%d years"
    }
  })
}

/**
 * Format date
 */
export function formatDate(timestamp) {
  if (!timestamp || timestamp === '') {
    return moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
  } else {
    return moment(timestamp).format("YYYY-MM-DD HH:mm:ss")
  }
}

/**
 * Calculate time from now
 * Option
 * - beginDate
 * Output
 * - three days ago, etc
 */
export function calcuDate(beginDate) {
  return moment(beginDate).fromNow()
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