/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * define Intl Msg for ClusterModule
 *
 * @author Songsz
 * @date 2018-08-23
 *
*/

import { defineIntlMessages } from '../../../src/common/tools'

// data for index, clusterTabList
export const mapData = {
  prefix: 'TerminalModal',
  data: {
    containerStateless: '由于容器本身无状态且不可变的特性，以防容器销毁后，对容器内部做的改动无法保留，',
    suggestNotEditContainer: '建议不要直接修改容器中内容（有状态容器中存储映射出来的目录除外）',
    iKnow: '知道了',
    neverMind: '不再提醒',
    termConnecting: '终端链接中...',
    connectTimeout: '连接超时了',
    closeTermAct: '关闭终端链接操作',
    confirmCloseAll: '您是否确定要关闭所有终端链接么?',
    confirmClose: '您是否确定要关闭此终端链接?',
    notSupportSafari: '暂不支持 Safari 浏览器',
    log: '日志',
    connectClose: '连接已断开',
  },
}

export default defineIntlMessages(mapData)
