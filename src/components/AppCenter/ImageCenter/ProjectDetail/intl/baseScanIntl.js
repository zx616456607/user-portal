/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for src/components/AppCenter/ImageCenter/ProjectDetail/index.js
 *
 * @author zhouhaitao
 *
 */
import { defineIntlMessages } from "../../../../../common/tools"

export const mapData = {
  prefix: 'AppCenter.ImageCenter.BaseScan',
  data: {
    noDataText: '暂无信息',
    packageName: '包名称',
    packageVersion: '包版本',
    bug: '漏洞',
    remain: '升级后的剩余',
    impact: '升级的影响',
    picture: '引入镜像层',
    negligible: '可忽略级别的漏洞',
    baseScanRes: '基础扫描结果',
    noBug: '没有漏洞',
    noSoftWare: '暂未扫描到任何软件',
    softWarePackage: '镜像所含软件包',
    scanning: '正在扫描尚未结束',
    reload: '点击重新获取',
    scanningFailure: '扫描失败，请重新扫描',
    hasNotBeenScanned: '镜像没有被扫描过',
    clickToScan:'点击扫描',
    errMsg: '[ {name} ] 镜像的 [ {tag} ] {msg}',
    hasNotAndReload: '镜像没有被扫描过，请点击扫描',
    differentResult: '镜像扫描结果与上次扫描结果不同',
    alert: '镜像的安全扫描，这里提供的是一个静态的扫描，能检测出镜像的诸多安全问题，例如：端口暴露异常、是否提供了SSH Daemon等等安全相关。（注：请注意每个镜像的不同版本，安全报告可能会不同）'
  }
}

export default defineIntlMessages(mapData)
