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

import { defineIntlMessages } from "../../common/tools"
import React from "react";

export const mapData = {
  prefix: 'AppModule.AppList',
  data: {
    boot: '启动',
    delete: '删除',
    reDeploy: '重新部署',
    refresh: '刷新',
    createApp: '创建应用',
    aiModalApp: 'AI 模型应用',
    appList: '应用列表',
    bootOperation: '启动操作',
    stop: '停止',
    stopOperation: '停止操作',
    deleteOperation: '删除操作',
    reDeployOperation: '重新部署操作',
    searchByAppName: '按应用名搜索',
    allItems: '共 {total} 条',
    moreOperation: '更多操作',
    appName: '应用名称',
    status: '状态',
    containerNum: '容器数量',
    alarm: '告警',
    accessAddress: '访问地址',
    createTime: '创建时间',
    operation: '操作',
    createAlarmStg: '创建告警策略',
    createNotiGroup: '创建新通知组',
    slcDeployEnv: '选择部署环境',
    noOperationApp: '没有可以操作的应用',
    tip: '提示',
    noServerNoAlarm: '当前应用下还未添加服务，添加服务后可为服务创建告警策略',
    noDataYet: '暂无数据',
    checkLayout: '查看编排',
    alarmSetting: '告警设置',
    lookTopology: '查看拓扑图',
  }
}

export default defineIntlMessages(mapData)
