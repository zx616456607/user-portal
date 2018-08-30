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
  prefix: 'AppCenter.ImageCenter.ServiceApi',
  data: {
    noDataText: '暂无数据',
    packageName: '包名称',
    packageVersion: '包版本',
    bug: '漏洞',
    remain: '升级后的剩余',
    impact: '升级的影响',
    picture: '引入镜像层',
    echartsGapTemplateHigh: '           {num}  封装      {name}',
    echartsGapTemplateMedium: '         {num}  封装      {name}',
    echartsGapTemplateLow: '       {num}  封装      {name}',
    echartsGapTemplateNegligible: '     {num}  封装      {name}',
    echartsGapTemplateUnknown: '   {num}  封装      {name}',
    hasKnown: '镜像安全扫描器已经认识 {total} 包',
    high: '高级别安全漏洞',
    medium: '中级别安全漏洞',
    low: '低级别安全漏洞',
    negligible: '可忽略级别的漏洞',
    unknown: '未知的漏洞',
    noSoftWare: '暂未扫描到任何软件',
    softWarePackage: '镜像所含软件包',
    scanning: '正在扫描尚未结束',
    reload: '点击重新获取',
    scanningFailure: '扫描失败，请重新扫描',
    hasNotBeenScanned: '镜像没有被扫描过',
    clickToScan:'点击扫描',
    errMsg: '[ {name} ] 镜像的 [ {tag} ] {msg}',
    hasNotAndReload: '镜像没有被扫描过，请点击扫描',
    differentResult: '镜像扫描结果与上次扫描结果不同'
  }
}

export default defineIntlMessages(mapData)
