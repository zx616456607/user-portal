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
import {Button, Col} from "antd";
// data for index, clusterTabList
export const mapData = {
  prefix: 'clusterDetail',
  data: {
    masterNode: '主控节点/Master',
    computedNode: '计算节点/Slave',
    refreshSuccess: '刷新成功',
    running: '运行中',
    fail: '失败',
    booting: '启动中',
    containerName: '容器名称',
    status: '状态',
    namespace: '命名空间',
    belongApp: '所属应用',
    iamge: '镜像',
    accessAddress: '访问地址',
    createTime: '创建时间',
    hostInfo: '主机信息',
    resourceQuota: '资源配额（可分配）',
    CPUCore: '核',
    assigned: '已分配',
    memory: '内存',
    container: '容器',
    podCap: '{podCap} 个',
    foreverPodNumber: '已分配 {foreverPodNumber} 个',
    versionInfo: '版本信息',
    coreVersion: '内核版本',
    kubeletVersion: 'kubelet 版本',
    dockerVersion: 'Docker 版本',
    labelInfo: '标签信息',
    manageLabel: '管理标签',
    containerDetail: '容器详情',
    refresh: '刷新',
    search: '搜索',
    oneMinute: '1分钟',
    fiveMinutes: '5分钟',
    twentyMinutes: '20分钟',
    twoHours: '2小时',
    sixHours: '6小时',
    openDispatchSuccess: '开启调度成功',
    openDispatchFail: '开启调度失败',
    closeDispatchSuccess: '关闭调度成功',
    closeDispatchFail: '关闭调度失败',
    abnormal: '异常',
    maintaining: '维护中',
    migrateFail: '迁移失败',
    serverMigrating: '服务迁移中',
    notActWhenMigrating: '服务迁移过程最好不要进行其他操作，避免发生未知错误！',
    infrastructure: '基础设施',
    back: '返回',
    hostDetail: '主机详情',
    runningStatus: '运行状态',
    nodeRole: '节点角色',
    runningTime: '运行时间',
    dispatchStatus: '调度状态',
    maintainingNoDispatch: '维护状态禁止使用调度开关',
    off: '关',
    on: '开',
    detail: '详情',
    monitor: '监控',
    alarmStrategy: '告警策略',
    lastHeartbeatTime: '上次心跳时间：',
    os: '系统架构',
  }
}

export default defineIntlMessages(mapData)
