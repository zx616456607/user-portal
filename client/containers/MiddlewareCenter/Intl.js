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
    appPageTip: '服务目录: 一个中间件与大数据的完整交付平台，包含云化的中间件、大数据应用的全生命周期管理。',
    basicInfoTitle: '基本信息',
    clusterName: '集群名称',
    clusterNameIsRequired: '集群名称不能为空',
    description: '描述',
    version: '版本',
    versionIsRequired: '版本不能为空',
    pleaseEnter: '请输入{item}{tail}',
    bpmNodeTitle: 'BPM 节点',
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
    mysqlNodeTip: 'MySQL 节点',
    blockStorage: '块存储',
    blockStorageCluster: '块存储集群',
    blockStorageClusterIsRequired: '块存储集群不能为空',
    blockStorageSizeIsRequired: '不能为空',
    databaseUsername: '数据库用户名',
    password: '密码',
    classify: '分类',
    all: '全部',
    deploy: '部署',
    cloudApp: '云应用',
    deployManage: '部署管理',
    deploying: '部署中',
    deployFailed: '部署失败',
    deploySuccess: '部署成功',
    cancel: '取消',
    create: '创建',
    nameCheckFailed: '名称校验失败',
    nameExisted: '名称重复',
    app: '应用',
  },
}

export default defineIntlMessages(mapData)
