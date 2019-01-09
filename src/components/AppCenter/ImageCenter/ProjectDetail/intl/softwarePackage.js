/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for src/components/AppCenter/ImageCenter/ProjectDetail/SoftwarePackage.js
 *
 * @author zhouhaitao
 *
 */
import { defineIntlMessages } from "../../../../../common/tools"

export const mapData = {
  prefix: 'AppCenter.ImageCenter.SoftwarePackage',
  data: {
    noDataText: '暂无数据',
    packageName: '包名称',
    packageVersion: '包版本',
    bug: '漏洞',
    remain: '升级后的剩余',
    impact: '升级的影响',
    picture: '引入镜像层',
    hasKnown: '镜像安全扫描器已经认识 {total} 包',
    noSoftWare: '暂未扫描到任何软件',
    softWarePackage: '镜像所含软件包',
    scanningFailure: '扫描失败',
    hasNotBeenScanned: '镜像没有被扫描过',
    softwarePackage: '点击扫描',
  }
}

export default defineIntlMessages(mapData)
