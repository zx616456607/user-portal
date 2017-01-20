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
import { AMOUNT_CONVERSION, AMOUNT_DEFAULT_PRECISION, DEFAULT_TIME_FORMAT } from '../../constants'
import { STANDARD_MODE } from '../../configs/constants'
import { mode } from '../../configs/model'

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
 * `YYYY-MM-DD HH:mm:ss`
 * @export
 * @param {any} timestamp
 * @returns
 */
export function formatDate(timestamp, format) {
  format = format || DEFAULT_TIME_FORMAT
  if (!timestamp || timestamp === '') {
    return moment(new Date()).format(format)
  } else {
    return moment(timestamp).format(format)
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
/*export function formateDate(date, format) {
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
}*/


export function toQuerystring(obj, sep, eq) {
  sep = sep || '&'
  eq = eq || '='
  if (!obj) {
    return ''
  }
  return Object.keys(obj).map(function (k) {
    let ks = stringifyPrimitive(k) + eq
    if (Array.isArray(obj[k])) {
      return obj[k].map(function (v) {
        return ks + stringifyPrimitive(v)
      }).join(sep)
    } else {
      return ks + stringifyPrimitive(obj[k])
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

/**
 * Generate random string with specified length, default is 6
 */
export function genRandomString(mytoken, len) {
  const DEFAULT_TOKEN = '0123456789qwertyuioplkjhgfdsazxcvbnmABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&'
  const DEFAULT_LEN = 6
  if (!mytoken) {
    mytoken = DEFAULT_TOKEN
    len = DEFAULT_LEN
  } else if (!len) {
    len = mytoken
    mytoken = DEFAULT_TOKEN
  }
  let randomStr = ''
  for (let i = 0; i < len; i++) {
    randomStr += mytoken.charAt(Math.ceil(Math.random() * 100000000) % mytoken.length)
  }
  return randomStr
}

/**
 * Check object if empty.
 */
export function isEmptyObject(obj) {
  for (var name in obj) {
    return false
  }
  return true
}

/**
 * Parse api amount to human money
 *
 * @export
 * @param {Number|String} amount
 * @param {Number} precision
 * @returns {Object}
 * ```
 * {
 *   amount: 0.25,
 *   unit: '￥' || 'T',
 *   fullAmount: '￥ 0.25' || '0.25 T'
 * }
 * ```
 */
export function parseAmount(amount, precision) {
  const data = {}
  amount = Math.ceil(amount)
  precision = parseInt(precision)
  if (isNaN(amount)) {
    amount = 0
  }
  if (!precision || isNaN(precision) || precision < 2) {
    precision = AMOUNT_DEFAULT_PRECISION
  }
  let conversionLog10 = Math.ceil(Math.log(AMOUNT_CONVERSION) / Math.log(10))
  if (precision > conversionLog10) {
    precision = conversionLog10
  }
  amount = Math.ceil(amount / Math.pow(10, conversionLog10 - precision))
  amount = amount / Math.pow(10, precision)
  data.amount = amount
  if (mode === STANDARD_MODE) {
    data.unit = '￥'
    data.fullAmount = `${data.unit} ${amount}`
  } else {
    data.unit = 'T'
    data.fullAmount = `${amount} ${data.unit}`
  }
  return data
}

export function isStorageUsed(volumes) {
  let used = false
  if (volumes) {
    for (var i in volumes) {
      if (volumes[i].rbd) {
        used = true
        break
      }
    }
  }
  return used
}

/*
  *判断是否有域名
  *bindingDomain --- '' , '[]' , '[""]' , null , undefind
*/

export function isDomain (bindingDomainStr) {
  let bindingDomain = ''
  try {
    bindingDomain = JSON.parse(bindingDomainStr)
  }
  catch (e) {
    return false
  }
  if (bindingDomain.length === 0 || bindingDomain[0] === '') {
    return false
  }
  return true
}

/**
 * Get type of param
 * return `undefined|null|string|number|object|array|function|boolean`
 * @export
 * @param {any} param
 * @returns {String}
 */
export function getType(param) {
  let type = Object.prototype.toString.call(param)
  type = type.replace(/\[object /, '')
  type = type.replace(/\]/, '')
  return type.toLowerCase()
}

/**
 * return value by key
 *
 * @param {Object} obj
 * @param {String} key 'name.name2.name3'
 * @returns
 */
export function getValue(obj, key) {
  if(!obj) {
    return
  }
  let combinedKeys = key.split('.')
  let value = obj
  combinedKeys.every(cKey => {
    value = value[cKey]
    if (!value) {
      return false
    }
    return true
  })
  if (typeof(value) === 'object') {
    return JSON.stringify(value)
  }
  return value
}
