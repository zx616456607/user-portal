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
    total: `总&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;数`,
    a: '个',
    adjustableDegree: '可调度数',
    normalOperation: '正常运行',
    CPUDistribution: 'CPU 分配',
    core: '核',
  }
}

export default defineIntlMessages(mapData)
