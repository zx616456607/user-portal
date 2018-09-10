/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Intl for middlewareCenter apps
 *
 * @author zhangxuan
 * @date 2018-09-07
 */
import { defineIntlMessages } from '../../../src/common/tools'

const mapData = {
  prefix: 'MiddlewareCenter.apps',
  data: {
    appPageTip: 'APPCenter 是一个云计算环境中的应用交付与运营管理平台，同时包含一整套用来开发云应用及云化已有应用的框架。让应用提供商和开发者可以从资源层管理的复杂性中脱离出来，从而更高效地开发、部署、运维及管理所提供的应用，让用户可以便捷地选择需要的应用来构建和管理自身的业务。',
    basicInfoTitle: '第 1 步：基本信息',
    clusterName: '集群名称',
    clusterNameIsRequired: '集群名称不能为空',
    description: '描述',
    version: '版本',
    versionIsRequired: '版本不能为空',
    pleaseEnter: '请输入{item}{tail}',
    bpmNodeTitle: '第 2 步：BPM 节点',
    containerConfig: '容器配置',
    memory: '内存',
    customize: '自定义',
    core: '核',
    instanceNum: '实例数',
    replicaLengthLimit: '实例数量为 1~10 之间',
    one: '个',
    sharedStorage: '共享存储',
    storageType: '存储类型',
    pleaseSelect: '请选择{item}',
    storageCluster: '存储集群',
    accessMethod: '访问方式',
    publicNetAccess: '公网访问',
    intranetAccess: '内网访问',
    publicTip: '服务支持公网访问',
    internalTip: '服务支持内网访问',
    plsSltNexport: '请选择一个网络出口',
    nexport: '网络出口',
    mysqlNodeTip: '第 3 步：MySQL 节点',
    blockStorage: '块存储',
    blockStorageCluster: '块存储集群',
    blockStorageClusterIsRequired: '块存储集群不能为空',
    blockStorageSizeIsRequired: '不能为空',
    databaseUsername: '数据库用户名',
    password: '密码',
  },
}

export default defineIntlMessages(mapData)
