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
  prefix: 'ImageService',
  data: {
    editImageServiceSuccess: '编辑镜像服务地址成功',
    imageServiceAddressUnavailable: '镜像服务地址不可用',
    imageService: '镜像服务',
    clusterShouldHasHarbor: '集群必须配置harbor',
    configHarborAddress: '配置 harbor 地址',
    harborAddressUseFor: '管理集群 Docker 镜像，用于镜像仓库、流水线镜像发布等功能，可以使用默认harbor，也可以配置其它harbor',
    plsConfigImageService: '请配置镜像服务',
    plsInputRightIp: '请输入正确的IP地址',
    configImageService: '配置镜像服务',
    edit: '编辑',
    cancel: '取消',
    save: '保存'
  }
}

export default defineIntlMessages(mapData)
