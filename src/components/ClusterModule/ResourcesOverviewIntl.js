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
// data for index, clusterTabList
export const mapData = {
  prefix: 'ResourcesOverview',
  data: {
    resourceAllocation: '集群资源分配情况',
    onlyComputedNode: '仅显示计算节点',
    nodeType: '集群内节点分为计算节点、其他节点（添加了 taint 用以专门用途的 node 节点）',
    hostStatus: '主机状态',
    total: `总数`,
    a: '个',
    adjustableDegree: '可调度数',
    normalOperation: '正常运行',
    CPUDistribution: 'CPU 分配',
    core: '核',
    allocatedNumber: '已分配数',
    actualUsage: '实际使用',
    memoryAllocated: '内存分配',
    totalAmount: '总量',
    allocatedAmount: '已分配量',
    container: '容器',
    running: '运行中',
    inOperation: '操作中',
    abnormal: '异   常',
  }
}

export default defineIntlMessages(mapData)
