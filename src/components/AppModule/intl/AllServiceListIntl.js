/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * AllServiceListIntl.js page
 *
 * @author zhangtao
 * @date Thursday August 23rd 2018
 */
import { defineMessages } from 'react-intl'

export default defineMessages({
  documentTitle: {
    id: 'AppModule.ServiceList.DocumentTitle',
    defaultMessage: '服务列表'
  },
  reStartOperation: {
    id: 'AppModule.ServiceList.reStartOperation',
    defaultMessage: '重新部署操作'
  },
  startOperation: {
    id: 'AppModule.ServiceList.startOperation',
    defaultMessage: '启动操作'
  },
  stopOperation: {
    id: 'AppModule.ServiceList.stopOperation',
    defaultMessage: '停止操作',
  },
  deleteOperation: {
    id: 'AppModule.ServiceList.deleteOperation',
    defaultMessage: '删除操作'
  },
  rebootOperation: {
    id: 'AppModule.ServiceList.rebootOperation',
    defaultMessage: '重启操作'
  },
  redeploy: {
    id: 'AppModule.ServiceList.redeploy',
    defaultMessage:'重新部署'
  },
  serviceName: {
    id: 'AppModule.ServiceList.serviceName',
    defaultMessage: '服务名称'
  },
  appName: {
    id: 'AppModule.ServiceList.appName',
    defaultMessage: '所属应用'
  },
  alarm: {
    id: 'AppModule.ServiceList.alarm',
    defaultMessage: '监控告警'
  },
  image: {
    id: 'AppModule.ServiceList.image',
    defaultMessage: '镜像'
  },
  serviceAddress: {
    id: 'AppModule.ServiceList.serviceAddress',
    defaultMessage: '服务地址'
  },
  createTime: {
    id: 'AppModule.ServiceList.createTime',
    defaultMessage: '创建时间'
  },
  createAlarmStrategy: {
    id: 'AppModule.ServiceList.createAlarmStrategy',
    defaultMessage: '创建告警策略'
  },
  createNotification: {
    id: 'AppModule.ServiceList.createNotification',
    defaultMessage: '创建新通知组'
  },
  verticalMiddleModal :{
    id: 'AppModule.ServiceList.verticalMiddleModal',
    defaultMessage: '垂直居中的对话框'
  },
  serviceTagButton: {
    id: 'AppModule.ServiceList.serviceTagButton',
    defaultMessage: '服务标签键'
  },
  serviceNameSearch: {
    id: 'AppModule.ServiceList.serviceNameSearch',
    defaultMessage: '按服务名称搜索'
  },
  serviceTagButtonSearch: {
    id: 'AppModule.ServiceList.serviceTagButtonSearch',
    defaultMessage: '按服务标签键搜索'
  },
  cannotOperationService: {
    id: 'AppModule.ServiceList.cannotOperationService',
    defaultMessage:'没有可以操作的服务'
  },
  choiceStopService: {
    id: 'AppModule.ServiceList.choiceStopService',
    defaultMessage: '请选择要停止的服务'
  },
  netPortDelete: {
    id: 'AppModule.ServiceList.netPortDelete',
    defaultMessage: '网络出口已删除'
  },
  net: {
    id: 'AppModule.ServiceList.net',
    defaultMessage: '网',
  },
  serviceInnerNet: {
    id: 'AppModule.ServiceList.serviceInnerNet',
    defaultMessage: '该服务可内网访问（通过集群网络出口）',
  },
  inner: {
    id: 'AppModule.ServiceList.inner',
    defaultMessage: '内'
  },
  servicePublicNet: {
    id: 'AppModule.ServiceList.servicePublicNet',
    defaultMessage: '该服务可公网访问（通过集群网络出口）'
  },
  public: {
    id: 'AppModule.ServiceList.public',
    defaultMessage: '公'
  },
  noDate: {
    id: 'AppModule.ServiceList.noDate',
    defaultMessage: '暂无数据'
  },
  serviceloadBalance: {
    id: 'AppModule.ServiceList.serviceloadBalance',
    defaultMessage: '该服务可被访问（通过应用负载均衡 LB ）'
  },
  rollPublish: {
    id: 'AppModule.ServiceList.rollPublish',
    defaultMessage: '滚动发布'
  },
  pleaseAfterRollOperation: {
    id: 'AppModule.ServiceList.pleaseAfterRollOperation',
    defaultMessage: '请在灰度升级完成或回滚后操作'
  },
  grayPublish: {
    id: 'AppModule.ServiceList.grayPublish',
    defaultMessage: '灰度发布'
  },
  standardExtend: {
    id: 'AppModule.ServiceList.standardExtend',
    defaultMessage: '水平扩展'
  },
  autoScale: {
    id: 'AppModule.ServiceList.standardExtend',
    defaultMessage: '自动伸缩'
  },
  changeConfig: {
    id: 'AppModule.ServiceList.changeConfig',
    defaultMessage: '更改配置'
  },
  changeSet: {
    id: 'AppModule.ServiceList.changeSet',
    defaultMessage: '变更设置'
  },
  changeEnv: {
    id: 'AppModule.ServiceList.changeEnv',
    defaultMessage: '修改环境变量',
  },
  changePort: {
    id: 'AppModule.ServiceList.changePort',
    defaultMessage: '修改端口',
  },
  HightAvailable: {
    id: 'AppModule.ServiceList.HightAvailable',
    defaultMessage: '设置高可用',
  },
  bundDomin: {
    id: 'AppModule.ServiceList.bundDomin',
    defaultMessage: '绑定域名',
  },
  setHTTPS: {
    id: 'AppModule.ServiceList.setHTTPS',
    defaultMessage: '设置HTTPS',
  },
  serviceTag: {
    id: 'AppModule.ServiceList.serviceTag',
    defaultMessage: '服务标签',
  },
  moreSet: {
    id: 'AppModule.ServiceList.moreSet',
    defaultMessage: '更多设置'
  }
})
