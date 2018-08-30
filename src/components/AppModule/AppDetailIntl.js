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

export const mapData = {
  prefix: 'AppModule.AppDetail',
  data: {
    appDescriptionScs: '应用描述修改成功',
    appDescriptionFail: '应用描述修改失败',
    appNameDetail: '应用 {appName} 详情',
    status: '状态',
    address: '地址',
    server: '服务',
    create: '创建',
    update: '更新',
    description: '描述',
    edit: '编辑',
    plsIptAppDesc: '请输入应用描述',
    cancel: '取消',
    save: '确定',
    serverInstance: '服务实例',
    layoutFile: '编排文件',
    auditLog: '审计日志',
    rentInfo: '租赁信息',
    alarmStg: '告警策略',
    topology: '拓扑图',
    none: '无',
    createApp: '创建应用',
    editApp: '修改应用',
    createServer: '创建服务',
    deleteServer: '删除服务',
    stopApp: '停止应用',
    startApp: '启动应用',
    rebootApp: '重启应用',
    deleteApp: '删除应用',
    reDeployServer: '重新部署服务',
    stopServer: '停止服务',
    startServer: '启动服务',
    scs: '成功',
    fail: '失败',
  }
}

export default defineIntlMessages(mapData)
