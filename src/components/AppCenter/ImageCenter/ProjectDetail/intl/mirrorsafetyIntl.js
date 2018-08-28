/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for src/components/AppCenter/ImageCenter/ProjectDetail/Mirrorsadesfrfety.js
 *
 * @author zhouhaitao
 *
 */
import { defineIntlMessages } from "../../../../../common/tools"

export const mapData = {
  prefix: 'AppCenter.ImageCenter.ServiceApi',
  data: {
    jobalreadyexist: '版本已经触发扫描，请稍后再试！',
    noNonEmptyLayer: '版本为空镜像，无法对空镜像进行扫描',
    couldNotBeEstablished: '版本无法连接到安全服务',
    errMsg: '[{name}]镜像的[{tag}]{msg}',
    envEdition: '此服务仅支持『专业版』，去查看『时速云|专业版』功能优势',
    goToCheck: '点击查看',
    selectImageVersionPlaceholder: '选择镜像版本，查看安全报告',
    notFoundContent: '无法找到',
    bugScan: '漏洞扫描',
    imageLayered: '镜像分层',
    softWarePackage: '软件包',
    baseScan: '基础扫描',
  }
}

export default defineIntlMessages(mapData)
