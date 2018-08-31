/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for App
 * v0.1 - 2018-08-30
 *
 * @author zhangpc
 *
 */

import { defineIntlMessages } from '../../common/tools'

export const mapData = {
  prefix: 'Container.Detail',
  data: {
    delContainerConfirm: '您是否确认要重新分配 {containerName} 这个容器',
    containerDeleting: '容器 {containerName} 重新分配中...',
    containerDeleted: '容器 {containerName} 已成功重新分配',
    containerDeleteFailed: '容器 {containerName} 重新分配失败',
    stop: '停止',
    title: '容器 {containerName}',
    status: '状态：',
    address: '地址：',
    createTime: '创建：',
    loginTerminal: '登录终端',
    deleteContainer: '重新分配',
    configs: '配置',
    monitor: '监控',
    logs: '日志',
    events:'事件',
    progress: '进程',
    localStorage: '本地存储',
    rbdStorage: '独享型（rbd）',
    nfsStorage: '共享型（nfs）',
    allConfigGroupMounted: '已挂载整个配置组',
    basic: '基本信息',
    name: '名称',
    image: '镜像',
    node: '所属节点',
    resources: '资源配置',
    memory: '内存',
    sysDisk: '系统盘',
    env: '环境变量',
    envKey: '变量名',
    envValue: '变量值',
    volume: '存储',
    volumeType: '存储类型',
    mountPath: '容器目录',
    config: '服务配置',
    configGroup: '配置组',
    configFile: '配置文件',
    mountPoint: '挂载点',
    historyLogs: '历史日志',
    maxLogsTip: '最多保留 {maxLogNum} 条日志',
    pRunning: 'R (运行)',
    pSleeping: 'S (休眠)',
    pUninterruptible: 'D (不可中断)',
    pDead: 'Z (僵死)',
    pStop: 'T (停止或追踪停止)',
    pTrackStop: 't (追踪停止)',
    pMemorySwap: 'W (进入内存交换)',
    pExit: 'X (退出)',
    pLowerExit: 'x (退出)',
    pOther: '其他',
    pUser: '用户',
    virtualMemory: '虚拟内存',
    physicalMemory: '物理内存',
    pStatus: '状态',
    pStartTime: '启动时间',
    pCpuTime: 'CPU时间',
    pCmd: '命令行',
    pInfo: '进程信息',
    noData: '暂无数据',
    eventsInfo: '消息：',
  },
}

export default defineIntlMessages(mapData)
