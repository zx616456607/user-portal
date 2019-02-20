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
  prefix: 'AppCenter.ImageCenter.ImageDetail',
  data: {
    type: '类型',
    pubilicType: '公开',
    privateType: '私有',
    colletctImage: '收藏镜像',
    closeImage: '取消收藏',
    deployImage: '部署镜像',
    downloadImage: '下载镜像',
    info: '基本信息',
    tag: '版本及接口',
    attribute: '属性',
    mirrorSafety: '镜像安全',
    copyBtn: '点击复制',
    copySuccess: '复制成功',
    securityScan: '安全扫描',
    okText: '确定',
    cancelText: '取消',
    version: '镜像版本',
    notFoundContent: '镜像未找到',
    selectPlaceholder: '请选择镜像版本，查看安全报告',
    errMsg: '[{name}]镜像的[{tag}]{msg}',
    createAppStack: '已创建工作负载',
  }
}

export default defineIntlMessages(mapData)
