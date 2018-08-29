/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for src/components/AppCenter/ImageCenter/ProjectDetail/MirrorSafetyBug.js
 *
 * @author zhouhaitao
 *
 */
import { defineIntlMessages } from "../../../../../common/tools"

export const mapData = {
  prefix: 'AppCenter.ImageCenter.ServiceApi',
  data: {
    noRevision: '暂无修正版',
    accessVectorArr1: '',
    accessVectorArr2: '网络',
    accessVectorArr3: '相邻网络',
    accessVectorArr4: '本地',
    accessComplexityArr1: '',
    accessComplexityArr2: '低',
    accessComplexityArr3: '中',
    accessComplexityArr4: '高',
    authenticationArr1: '',
    authenticationArr2: '没有',
    authenticationArr3: '单',
    authenticationArr4: '多',
    confidentialityImpactArr1: '',
    confidentialityImpactArr2: '完成',
    confidentialityImpactArr3: '局部',
    confidentialityImpactArr4: '没有',
    visit: '访问向量',
    complex: '访问的复杂性',
    authentication: '认证',
    privacy: '保密性的影响',
    completeness: '完整性的影响',
    network: '网络',
    adjacentNetwork: '相邻网络',
    local: '本地',
    vector: '矢量',
    currentScore: '当前分数{score}',
    describe: '描述',
    echartsGapTemplateHigh: '           {num}  封装      {name}',
    echartsGapTemplateMedium: '         {num}  封装      {name}',
    echartsGapTemplateLow: '       {num}  封装      {name}',
    echartsGapTemplateNegligible: '     {num}  封装      {name}',
    echartsGapTemplateUnknown: '   {num}  封装      {name}',
    high: '高级别安全漏洞',
    medium: '中级别安全漏洞',
    low: '低级别安全漏洞',
    negligible: '可忽略级别的漏洞',
    unknown: '未知的漏洞',
    critical: '严重',
    softwarePackage: '软件包',
    currentVersion: '当前版本',
    revision: '当前版本',
    layerInfo: '位于镜像层',
    thereIsNoBug: '暂未扫描出任何漏洞',
    imageBug: '镜像漏洞'
  }
}

export default defineIntlMessages(mapData)
