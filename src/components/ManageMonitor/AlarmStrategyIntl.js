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
import {Button} from "antd";
// data for index, clusterTabList
export const mapData = {
  prefix: 'AlarmStrategy',
  data: {
    getStgFail: '获取策略失败',
    delete: '删除',
    modify: '修改',
    stopUse: '停用',
    startUse: '启用',
    checkLog: '查看记录',
    clearLog: '清除记录',
    slcDeleteStg: '请选择要删除的策略',
    deleteStgScs: '删除策略成功',
    deleteStgFail: '删除策略失败',
    stgStarting: '策略启动中...',
    stgInStop: '策略停止中...',
    stgEditFail: '策略修改失败！',
    slcIgnoreTimeStg: '请选择要设置忽略时间的策略',
    setting: '设置中',
    setStgTimeScs: '设置策略忽略时间成功',
    tip: '提示',
    noServerAlarm: '当前应用下还未添加服务，添加服务后可为服务创建告警策略',
    slcClearStg: '请选择要清除记录的策略',
    stgAlarmInClear: '策略告警记录清除中',
    stgAlarmClearScs: '策略告警记录清除成功',
    stgAlarmDeleteFail: '策略告警记录删除失败',
    name: '名称',
    status: '状态',
    alarm: '告警',
    ignore: '忽略',
    monitorCycle: '监控周期',
    createTime: '创建时间',
    lastEditPeople: '最后修改人',
    operation: '操作',
    createAlarm: '创建告警',
    refresh: '刷新',
    totalItem: '共计 {total} 条',
    deleteStg: '删除策略',
    confirmDeleteStg: '策略删除后将不再发送邮件告警，是否确定删除？',
    back: '返回',
    submit: '提 交',
    stgStopPlsStart: '当前告警策略已停用，请先启用该策略',
    noteIgnoreNoMail: '注意：在忽略时间内，将不会触发告警',
    ignoreTime: '忽略时长',
    hour: '小时',
    minute: '分钟',
    second: '秒',
    startStg: '启用策略',
    stopStg: '停止策略',
    confirmStartStg: '您是否确定要启用此策略 ?',
    confirmStopStg: '您是否确定要停用此策略 ?',
    editAlarmStg: '修改告警策略',
    createAlarmStg: '创建告警策略',
    createNotiGroup: '创建新通知组',
    clearStgLog: '清除策略告警记录',
    deleteStgConfirm: '您的操作将会清空 {name} 策略所有告警记录，并且重置告警次数，是否清空？',
    clusterCreatingTip: '添加中，完成后可查看集群详情',
    clusterCreateFailedTip: '创建失败',
  }
}

export default defineIntlMessages(mapData)
