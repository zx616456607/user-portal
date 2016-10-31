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

export function tenxDateFormat(oldDate) {
  let newDate = oldDate.replace("T", " ");
  newDate = newDate.replace("Z", " ");
  newDate = newDate.split("+")[0];
  return newDate;
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