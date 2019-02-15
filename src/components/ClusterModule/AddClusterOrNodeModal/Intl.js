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

// data for index, clusterTabList
export const mapData = {
  prefix: 'AddClusterOrNodeModal',
  data: {
    installDockerVersion: '1. 安装 Docker 18.09.2 版本',
    installDockerOnLinux: '如何在Linux安装Docker',
    exeCommand: '2. 在安装好 Docker 的主机上执行以下命令：',
    copySuccess: '复制成功',
    clickCopy: '点击复制',
  }
}

export default defineIntlMessages(mapData)
