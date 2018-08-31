/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * AllServiceListIntl.js page
 *
 * @author zhangtao
 * @date Thursday August 23rd 2018
 */
import {defineIntlMessages} from '../../../common/tools'

export const mapData = {
  prefix: 'AppModule.ServiceList',
  data: {
    documentTitle: '服务列表',
    reStartOperation: '重新部署操作',
    startOperation: '启动操作',
    stopOperation: '停止操作',
    deleteOperation: '删除操作',
    rebootOperation: '重启操作',
    redeploy: '重新部署',
    serviceName: '服务名称',
    appName: '所属应用',
    alarm: '监控告警',
    image: '镜像',
    serviceAddress: '服务地址',
    createTime:'创建时间',
    createAlarmStrategy: '创建告警策略',
    createNotification: '创建新通知组',
    verticalMiddleModal: '垂直居中的对话框',
    serviceTagButton: '服务标签键',
    serviceNameSearch: '按服务名称搜索',
    serviceTagButtonSearch: '按服务标签键搜索',
    cannotOperationService: '没有可以操作的服务',
    choiceStopService: '请选择要停止的服务',
    netPortDelete: '网络出口已删除',
    net: '网',
    serviceInnerNet: '该服务可内网访问（通过集群网络出口）',
    inner: '内',
    servicePublicNet: '该服务可公网访问（通过集群网络出口）',
    public: '公',
    noDate: '暂无数据',
    serviceloadBalance: '该服务可被访问（通过应用负载均衡 LB ）',
    rollPublish:'滚动发布',
    pleaseAfterRollOperation: '请在灰度升级完成或回滚后操作',
    grayPublish: '灰度发布',
    standardExtend: '水平扩展',
    autoScale: '自动伸缩',
    changeConfig: '更改配置',
    changeSet: '变更设置',
    changeEnv: '修改环境变量',
    changePort: '修改环境变量',
    HightAvailable: '设置高可用',
    bundDomin: '绑定域名',
    setHTTPS: '设置HTTPS',
    serviceTag: '服务标签',
    moreSet: '更多设置',
    extend: '扩展',
  }
}

export default defineIntlMessages(mapData)