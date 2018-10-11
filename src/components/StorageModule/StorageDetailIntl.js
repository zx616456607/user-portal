/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * define Intl Msg for StorageModule
 *
 * @author BaiYu
 * @date 2018-10-09
 *
*/

import { defineIntlMessages } from "../../common/tools"

export const mapData = {
  prefix: 'StorageDetail',
  data: {
    price: '价格',
    size: '大小',
    count: '合计',
    hour: '小时',
    about: '约',
    month: '月',
    getDetail: '获取存储详情失败',
    detail: '存储详情',
    back: '返回',
    storageType: '存储类型',
    storageService: '存储服务',
    serviceCommonDir: '服务共享目录',
    exclusiveStorage: '独享型',
    SharedStorage: '共享型',
    localStorage: '本地存储',
    createTime: '创建时间',
    blockStorage: '块存储',
    use: '用量',
    total:'总量',
    blockName: '块存储集群名称',
    notBind: '无绑定服务',
    bindService: '绑定服务',
    LeaseholdInfo: '租赁信息',
    service: '服务',
    forIn: '挂载点',
    volume: '存储卷',
    app: '应用',
    inputServiceName: '按服务名称搜索',
    uploadSuccess: '文件上传成功',
    uploadFailed: '文件上传失败',
    upload: '上传',
    download: '下载',
    uploadFile: '上传文件',
    exportFile: '导出文件',
    success: '成功',
    failure: '失败',
    unknown: '未知',
    active: '创建中',
    nodeVolume: '存储节点',
    systemRandom: '系统随机',
    hostDir: '宿主机目录',
    notSearchView: '未搜索到符合条件的服务',
    serviceStorageOnly: '服务对存储只读',
    serviceStoragefull: '服务对存储可读可写',
    inApp: '所属应用',
  }
}

export default defineIntlMessages(mapData)
