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
  prefix: 'TipSvcDomain',
  data: {
    copyScs: '复制成功',
    clickCopy: '点击复制',
    containerPort: '容器端口',
    clusterIn: '集群内',
    outNet: '外网',
    inNet: '内网',
    appLoadBalance: '应用负载均衡',
    httpsMode: 'HTTPS模式',
  }
}

export default defineIntlMessages(mapData)
