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

import { defineIntlMessages } from "../../../common/tools"
import React from "react";
import {Button} from "antd";
// data for index, clusterTabList
export const mapData = {
  prefix: 'AlarmModal',
  data: {
    plsInputName: '请输入名称',
    plsInput340: '请输入3~40位字符',
    plsInputCnEnNum: '请输入中文、英文字母或数字开头，中间可下划线、中划线',
    stgNameRepeat: '策略名称重复',
    nameIllegal: '名称包含非法字符',
    plsSlcType: '请选择类型',
    plsSlcNode: '请选择节点',
    plsSlcApp: '请选择应用',
    plsSlcServer: '请选择服务',
    node: '节点',
    server: '服务',
    slcMonitorCycle: '请选择告警周期',
    name: '名称',
    type: '类型',
    monitorCycle: '告警周期',
    min5: '5分钟',
    min30: '30分钟',
    hour1: '1小时',
    monitorObj: '监控对象',
    monitorServer: '监控服务',
    atLeastOneRule: '至少得有一项规则',
    a: '个',
    plsSlcOperator: '请选择运算符',
    alarmSettingRepeat: '告警设置填写重复',
    plsInputNum: '请填写数值',
    valueBig1: '此数值需大于1',
    cpuUseRate: 'CPU利用率',
    memoryUseRate: '内存使用率',
    memoryUse: '内存使用',
    uploadFlow: '出站流量',
    downloadFlow: '入站流量',
    diskUseRate: '磁盘利用率',
    tcpListenConnectNum: 'tcp listen连接数',
    tcpEsConnectNum: 'tcp established连接数',
    tcpCloseConnectNum: 'tcp close_wait连接数',
    tcpTimeConnectNum: 'tcp time_wait连接数',
    cpuRateFormula: '所有容器实例占用CPU总和/CPU资源总量',
    memoryRateFormula: '所有容器实例占用内存总和/容器实例数量',
    upStep: '上一步',
    nextStep: '下一步',
    plsInputRightEmail: '请输入正确的邮箱地址',
    plsInputRightPhone: '请输入正确的手机号',
    repeatPhone: '手机号重复',
    repeatEmail: '邮箱地址重复',
    sendEmailScs: '向 {email} 发送邮件邀请成功',
    sendEmailFail: '向 {email} 发送邮件邀请失败',
    validating: '验证中...',
    receiveInvite: '已接收邀请',
    plsInput321: '请输入3~21个字符',
    atLeastOneEmail: '至少添加一个通知方式',
    createGroupFail: '创建通知组失败',
    nameExist: `通知组名字已存在，请修改后重试`,
    withoutConfig: '请先完成『邮箱/短信服务器』的配置',
    editGroupFail: `修改通知组失败`,
    validatorEmail: '验证邮件',
    secondsAfter: '秒后重新验证',
    remarks: '备注',
    cancel: '取消',
    validatorPhone: '验证手机',
    description: '描述',
    email: '邮箱列表',
    addEmail: '添加邮箱',
    scanCodeWechat: '扫描二维码绑定微信',
    save: '保存',
    delete: '删除'
  }
}

export default defineIntlMessages(mapData)
