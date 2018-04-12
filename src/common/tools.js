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
import { browserHistory } from 'react-router'
import {
  AMOUNT_CONVERSION,
  AMOUNT_DEFAULT_PRECISION,
  DEFAULT_TIME_FORMAT,
} from '../../constants'
import {
  TENX_PORTAL_VERSION_MAJOR_KEY,
  TENX_PORTAL_VERSION_KEY,
  VERSION_REG_EXP,
  RESOURCES_DIY,
} from '../constants'
import { STANDARD_MODE, ENTERPRISE_MODE } from '../../configs/constants'
import { mode } from '../../configs/model'
import isEmpty from 'lodash/isEmpty'

const enterpriseFlag = ENTERPRISE_MODE == mode
const locale = window.appLocale.locale

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
 * Format date
 * `YYYY-MM-DD HH:mm:ss`
 * @export
 * @param {any} timestamp
 * @returns
 */
const dateLiteral = {
  zh: {
    year: ["年", "年"],
    month: ["月", "月"],
    day: ["日", "日"],
    hour: ["小时", "小时"],
    minute: ["分", "分"],
    second: ["秒", "秒"],
    millisecond: ["毫秒", "毫秒"]
  },
  en: {
    year: ["year", "years"],
    month: ["month", "months"],
    day: ["day", "days"],
    hour: ["hour", "hours"],
    minute: ["minute", "minutes"],
    second: ["second", "seconds"],
    millisecond: ["ms", "ms"]
  },
  jp: {
    year: ["年", "年"],
    month: ["ヶ月", "ヶ月"],
    day: ["日", "日"],
    hour: ["時間", "時間"],
    minute: ["分", "分"],
    second: ["秒", "秒"],
    millisecond: ["ミリ秒", "ミリ秒"]
  }
}

export function formatDuration(begin, end, showZeroSecond, separator, showZero, loc) {
  const start = toDate(begin)
  const over = toDate(end)
  const d = moment.duration(over - start)
  loc = loc ? loc : locale
  let table = {}
  if (dateLiteral.hasOwnProperty(loc)) {
    table = dateLiteral[loc]
  } else {
    table = dateLiteral['en']
  }
  if (!separator) {
    separator = ' '
  }
  const duration = [
    ['year', d.years()],
    ['month', d.months()],
    ['day', d.days()],
    ['hour', d.hours()],
    ['minute', d.minutes()],
    ['second', d.seconds()],
    ['millisecond', d.milliseconds()]
  ]
  const result = duration.reduce((parts, entry) => {
    const key = entry[0]
    const value = entry[1]
    if (value === 0 && !showZero) {
      return parts
    }
    const literal = value === 1 ? table[key][0] : table[key][1]
    parts.push(`${value} ${literal}`)
    return parts
  }, []).join(separator)
  if (result) {
    return result
  }
  return showZeroSecond ? `0 ${table['second'][0]}` : ""
}

function toDate(date) {
  if (typeof date === 'string') {
    return new Date(date)
  }
  return date
}

/**
 * Calculate time from now
 * Option
 * - beginDate
 * Output
 * - three days ago, etc
 */
export function calcuDate(beginDate) {
  moment.locale('zh-cn')
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


export function toQuerystring(obj, sep, eq, isSort) {
  sep = sep || '&'
  eq = eq || '='
  if (!obj) {
    return ''
  }
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
  for (const k in obj) {
    if (obj[k] === null || obj[k] === '' || obj[k] === undefined) {
      delete obj[k]
    }
  }
  let objKeysArray = Object.keys(obj)
  if (isSort) {
    objKeysArray = objKeysArray.sort()
  }
  const queryString = objKeysArray.map(function (k) {
      let ks = stringifyPrimitive(k) + eq
      if (Array.isArray(obj[k])) {
        return obj[k].map(function (v) {
          return ks + stringifyPrimitive(v)
        }).join(sep)
      } else {
        return ks + stringifyPrimitive(obj[k])
      }
    }).join(sep)
  if (!queryString) {
    return ''
  }
  return queryString
}

export function parseQueryStringToObject(querystring) {
  if(!querystring) {
    return {}
  }
  const queryObj = {}
  querystring = querystring.trim()
  if(querystring.indexOf('?') == 0) {
    querystring = querystring.substr(1)
  }
  const queryArray = querystring.split('&')
  queryArray.forEach(item => {
    let t = item.split('=')
    queryObj[t[0]] = t[1]
  })
  return queryObj
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
 * Generate random string with specified length, default is 6, max is 64
 */
export function genRandomString(mytoken, len) {
  const DEFAULT_TOKEN = '0123456789qwertyuioplkjhgfdsazxcvbnmABCDEFGHIJKLMNOPQRSTUVWXYZ@#$' // %&
  const DEFAULT_LEN = 6
  const MAX_LEN = 64
  if (!mytoken) {
    mytoken = DEFAULT_TOKEN
    len = DEFAULT_LEN
  } else if (!len) {
    if (typeof mytoken === 'number') {
      len = mytoken
      mytoken = DEFAULT_TOKEN
    } else {
      len = DEFAULT_LEN
    }
  }
  len = len > MAX_LEN ? MAX_LEN : len
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

export function isDomain(bindingDomainStr) {
  let bindingDomain = ''
  // Whether cluster can support binding domain
  if (bindingDomainStr === "true") {
    return true
  }
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

/**
 * Parse cpu with unit to number
 *
 * @export
 * @param {any} cpu
 * @returns
 */
export function parseCpuToNumber(cpu) {
  if (!cpu) {
    return
  }
  if (cpu.indexOf('m') < 0) {
    cpu *= 1000
  } else {
    cpu = parseInt(cpu)
  }
  return Math.ceil((cpu / 1000) * 10) / 10
}

/**
 * Format cpu
 *
 * @param {any} memory
 * @param {any} resources
 * @returns
 */
export function cpuFormat(memory, resources) {
  let cpuLimits = parseCpuToNumber(resources && resources.limits ? resources.limits.cpu : null)
  let cpuRequests = parseCpuToNumber(resources && resources.requests ? resources.requests.cpu : null)
  if (enterpriseFlag) {
    if (cpuLimits && cpuRequests && cpuLimits !== cpuRequests) {
      return `${cpuRequests}~${cpuLimits} CPU`
    }
    if (cpuLimits && cpuRequests && cpuLimits === cpuRequests) {
      return `${cpuRequests} CPU`
    }
  }
  if(!Boolean(memory)) {
    return '-'
  }
  let newMemory = parseInt(memory.replace('Mi','').replace('Gi'))
  switch(newMemory) {
    case 1:
      return '1 CPU（共享）'
    case 2:
      return '1 CPU（共享）'
    case 4:
      return '1 CPU'
    case 8:
      return '2 CPU'
    case 16:
      return '2 CPU'
    case 32:
      return '2 CPU'
    case 256:
      return '1 CPU（共享）'
    case 512:
      return '1 CPU（共享）'
  }
}

export function memoryFormat(resources) {
  let memoryLimits = resources && resources.limits ? resources.limits.memory : null
  let memoryRequests = resources && resources.requests ? resources.requests.memory : null
  if (!memoryLimits || !memoryRequests) {
    return '-'
  }
  memoryLimits = memoryLimits.replace('i', '')
  if (enterpriseFlag && memoryLimits && memoryRequests) {
    memoryRequests = memoryRequests.replace('i', '')
    if (memoryLimits === memoryRequests) {
      return memoryLimits
    }
    return `${memoryRequests}~${memoryLimits}`
  }
  return memoryLimits
}

export function isStandardMode() {
  return !enterpriseFlag
}

export function clearSessionStorage() {
  sessionStorage && sessionStorage.clear()
}

export function getVersion() {
  let version = window[TENX_PORTAL_VERSION_KEY]
  if (!version) {
    return
  }
  let versionMatch = version.match(VERSION_REG_EXP)
  if (!versionMatch) {
    return
  }
  version = versionMatch[0]
  version = version.replace('v', '')
  return version
}

/**
 * Get portal real mode
 *
 * @export
 * @returns lite | enterprise | standard
 */
export function getPortalRealMode() {
  let major = window[TENX_PORTAL_VERSION_MAJOR_KEY]
  if (!major) {
    return mode
  }
  return major
}
/**
 * formet time
 * @time s
 * @export string
 */
export function calcuTime(time) {
  let sym = '分钟'
  time = time / 60
  if(time / 60 > 1) {
    sym = '小时'
    time = time / 60
  }
  return time + sym
}

export function isSafariBrower() {
  var ua = navigator.userAgent.toLowerCase();
  if (ua.indexOf('safari') != -1) {
    if (ua.indexOf('chrome') < 0) {
      return true
    }
  }
  return false
}

export function getResourceByMemory(memory, DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU) {
  if (memory !== RESOURCES_DIY) {
    memory = parseInt(memory)
  }
  let cpuShow = 1 // unit: C
  let cpu = 0.1 // unit: C
  let memoryShow = 0.5 // unit: G
  let limitCpu = 0.1 // unit: C
  let limitMemory = 0.5 // unit: G
  let config = '2x'
  switch (memory) {
    case 256:
      memoryShow = 256 / 1024
      cpuShow = 1
      cpu = 0.1
      limitCpu = 1
      limitMemory = memory
      config = '1x'
      break
    case 512:
      memoryShow = 512 / 1024
      cpuShow = 1
      cpu = 0.2
      limitCpu = 1
      limitMemory = memory
      config = '2x'
      break
    case 1024:
      memoryShow = 1024 / 1024
      cpuShow = 1
      cpu = 0.4
      limitCpu = 1
      limitMemory = memory
      config = '4x'
      break
    case 2048:
      memoryShow = 2048 / 1024
      cpuShow = 1
      cpu = 0.8
      limitCpu = 1
      limitMemory = memory
      config = '8x'
      break
    case 4096:
      memoryShow = 4096 / 1024
      cpuShow = 1
      cpu = 1
      limitCpu = 1
      limitMemory = memory
      config = '16x'
      break
    case 8192:
      memoryShow = 8192 / 1024
      cpuShow = 2
      cpu = 2
      limitCpu = 2
      limitMemory = memory
      config = '32x'
      break
    case RESOURCES_DIY:
      memoryShow = Math.ceil(DIYMemory / 1024 * 100) / 100
      memory = Math.ceil(DIYMemory)
      cpuShow = DIYCPU
      cpu = DIYCPU
      limitCpu = DIYMaxCPU
      limitMemory = Math.ceil(DIYMaxMemory)
      config = RESOURCES_DIY
      break
    default:
      break
  }
  return { cpu, memory, cpuShow, memoryShow, limitCpu, limitMemory, config }
}

export function isValidateDate(date) {
  if (Object.prototype.toString.call(date) !== "[object Date]") {
    date = new Date(date)
  }
  const dateTime = date.getTime()
  if (isNaN(dateTime) || dateTime < 0) {
    return false
  }
  return true
}

export function isResourcePermissionError(err) {
  if (!err) {
    return false
  }
  const { statusCode, message } = err
  return statusCode === 403 && (message && message.details && message.details.kind === 'ResourcePermission')
}

export function isResourceQuotaError(err) {
  if (!err) {
    return false
  }
  const { statusCode, message } = err
  return statusCode === 412 && (message && message.details && message.details.kind === 'resourcequota')
}

/**
 * encode image fullname
 * `carrot/node/edge` -> `carrot/node%2Fedge`
 *
 * @export
 * @param {string} fullname
 * @return {string} encoded fullname
 */
export function encodeImageFullname(fullname) {
  const [ project, ...imageName ] = fullname.split('/')
  if (!imageName || imageName.length === 1) {
    return fullname
  }
  return `${project}/${encodeURIComponent(imageName.join('/'))}`
}

/**
 *
 * @param bytes
 * @param size
 * @returns
 */
export function bytesToSize(bytes, size) {
  if (bytes === 0) return { value: 0, unit: 'B' };
  let k = 1024,
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  if (size) {
    i = sizes.findIndex(item => item === size)
  }
  let value = (bytes / Math.pow(k, i)).toFixed(2)
  let unit = sizes[i]
  return { value, unit };
}

/**
 * merge query
 *
 * @export
 * @param {object} defaultQuery
 * @param {object} query another query
 * @return {object} query
 */
export function mergeQueryFunc(defaultQuery, query) {
  return query = Object.assign({}, defaultQuery, query)
}

/**
 * is query equal
 *
 * @export
 * @param {object} q1 query
 * @param {object} q2 another query
 * @return {boolean} is equal
 */
export function isQueryEqual(q1, q2) {
  return toQuerystring(q1, null, null, true) === toQuerystring(q2, null, null, true)
}

/**
 * adjust Browser Url
 *
 * @export
 * @param {object} location obj
 * @param {object} mergedQuery obj
 * @param {boolean} isFirstLoad
 * @return {function} browserHistory push
 */
export function adjustBrowserUrl(location = {}, mergedQuery = {}, isFirstLoad) {
  const { pathname, query } = location
  if (isQueryEqual(mergedQuery, query)) return
  delete mergedQuery.from
  delete mergedQuery.size
  for (let key in mergedQuery) {
    if (mergedQuery[key] === '' || mergedQuery[key] === null || mergedQuery[key] === undefined) {
      delete mergedQuery[key]
    }
  }
  if (parseInt(mergedQuery.page) === 1) {
    delete mergedQuery.page
  }
  if (typeof mergedQuery.search === 'boolean') {
    delete mergedQuery.search
  }
  if (isFirstLoad || isEmpty(mergedQuery)) {
    browserHistory.replace(pathname)
    return
  }
  browserHistory.push(`${pathname}?${toQuerystring(mergedQuery)}`)
}

/**
 * 转换模板服务为一维数组
 *
 * @param {object} detail
 * @param {array} templateArray
 */
export function formatServiceToArrry(detail, templateArray) {
  const { deployment, service, ingress } = detail;
    templateArray.push({
      deployment,
      service,
      ingress,
    });
    if (!detail.dependencies) {
      return;
    }
    const copyDetail = detail.dependencies[0];
    formatServiceToArrry(copyDetail, templateArray);
}

/**
 * 获取应用包文件类型
 *
 * @param {string} type
 */
export function getWrapFileType(type) {
  switch (type) {
    case 'java':
      return 'jar';
    case 'tomcat':
      return 'war';
    default:
      return 'jar';
  }
}