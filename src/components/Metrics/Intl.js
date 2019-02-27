/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * define Intl Msg for Metrics
 *
 * @author Songsz
 * @date 2018-08-23
 *
*/

import { defineIntlMessages } from "../../common/tools"

// data for index, clusterTabList
export const mapData = {
  prefix: 'Metrics',
  data: {
    // TimeControl.js
    last1Hour: '最近1小时',
    last6Hour: '最近6小时',
    last24Hour: '最近24小时',
    last7Day: '最近7天',
    last30Day: '最近30天',
    // CPU.js
    min1: '1分钟',
    timeSpace: '时间间隔',
    realTimeSwitch: '实时开关',
    on: '开',
    off: '关',
    // Memory.js
    memory: '内存',
    // Network.js
    network: '网络',
    download: '出站',
    upload: '入站',
    // Disk.js
    disk: '磁盘',
    read: '读取',
    write: '写入',
    // Tcp.js
    a: '个',
  }
}

export default defineIntlMessages(mapData)
