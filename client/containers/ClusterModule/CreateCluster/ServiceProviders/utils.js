/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * utils
 *
 * @author zhangxuan
 * @date 2018-11-29
 */

const formatInnerIp = data => {
  const [ ips, port ] = data.split(':')
  const startIndex = ips.indexOf('[')
  const middleIndex = ips.indexOf('-')
  const endIndex = ips.indexOf(']')
  const prefix = ips.substring(0, startIndex)
  const start = +ips.substring(startIndex + 1, middleIndex)
  const end = +ips.substring(middleIndex + 1, endIndex)
  const ipArray = []
  for (let i = start; i < end; i++) {
    ipArray.push(`${prefix}${i}:${port}`)
  }
  return ipArray
}

export const formatIpRangeToArray = data => {
  const outArray = data.split('\n')
  const finalArray = []
  outArray.forEach(item => {
    if (!item.includes('[')) {
      finalArray.push(item)
    } else {
      finalArray.push(...formatInnerIp(item))
    }
  })
  return finalArray
}
