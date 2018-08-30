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
import React from "react";

export const mapData = {
  prefix: 'AppModule.AppServiceList',
  data: {
    noOperationServer: '没有可操作的服务',
    slcStopServer: '请选择要停止的服务',
    nameServerList: '{appName} 的服务列表',
    addServer: '添加服务',
    redeploy: '重新部署',
    redeployAct: '重新部署操作',
    bootAct: '启动操作',
    boot: '启动',
    stop: '停止',
    refresh: '刷新',
    stopAct: '停止操作',
    delete: '删除',
    deleteAct:'删除操作',
    reboot: '重启',
    rebootAct: '重启操作',
    more: '更多',
    totalItems: '共 {total}条',
    serverName: '服务名称',
    status: '状态',
    image:'镜像',
    serverAddress: '服务地址',
    createTime: '创建时间',
    act: '操作',
    grayBackAct: '请在灰度升级完成或回滚后操作',
    rollUpdateAct: '请在滚动升级后操作',
    expand: '扩展',
    thisServerStorage: '该服务已添加存储',
    storage: '存',
    check: '查看',
  }
}

export default defineIntlMessages(mapData)
