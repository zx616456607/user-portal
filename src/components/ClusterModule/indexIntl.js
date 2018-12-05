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
// data for index, clusterTabList
export const mapData = {
  prefix: 'ClusterModule',
  data: {
    previewStep: '上一步',
    title: '基础设施',
    addClusterHelp: '基础设施，在这里您可以完成容器云平台的计算资源池管理：集群的添加、删除，以及集群内主机的添加、删除，并管理主机内的容器实例、查看主机维度的监控等。',
    addCluster: '添加集群',
    addClusterTip: '当前许可证最多支持 {maxClusters} 个集群（目前已添加 {clusterSum} 个）',
    noClusterPlsAdd: '暂无可用集群，请添加',
    configImgRepoAlert: '请先配置镜像仓库并添加集群，然后再进行其他操作',
    initConfig: '初始化配置',
    imgServerConfig: '镜像服务配置',
    submit: '提 交',
    back: '返 回',
    onlyOpenToEnterprise: '对企业内全部个人帐号开放该集群',
    inputDomain: '输入服务域名',
    serverDomain: '服务域名',
    description: '描述',
    inputServerOutIp: '请输入服务出口 IP',
    plsInputClusterName: '请填写集群名称',
    clusterNameErr: '集群名称不能超过18个字符',
    plsInputApiServer: '请填写 API Server',
    plsInputApiToken: '请填写 API Token',
    plsInputRightServerIp: '请填写正确的服务出口 IP',
    plsIptServerDomain: '请填写服务域名',
    plsIptRightServerDomain: '请填写正确的服务域名',
    plsSelect: '请选择',
    newCluster: '新建集群',
    newClusterAnnotation: '注：新建的首个集群，将设置对平台全部个人帐号开放',
    logout: '注销登录',
    finishAddCluster: '完成集群添加',
    addExistCluster: '添加已有集群',
    clusterName: '集群名称',
    apiHostPlaceholder: '协议 + API server 地址 + 端口号',
    serverOutIp: '服务出口 IP',
    addClusterNameSuccess: '添加集群 {clusterName} 成功',
    addClusterFail: '添加集群 {clusterName} 失败',
    apiHostValidatorErr: 'API Host 由协议 + API server 地址 + 端口号 组成',
    hasNoClusterAdd: '您还未添加集群，请添加',
    addClusterSuccess: '添加集群成功',
    checkClusterErr: '检测集群时发生错误，请重试',
    finishNNext: '完成并下一步',
    canAccessPublicNetwork: '可访问公网，暂不配置',
    imgServerAddress: '镜像服务地址',
    imgRepoUseFor: '该镜像仓库用途：',
    imgRepoUseFor1: '① 默认『系统组件』的容器镜像将从该仓库拉取，如可访问公网可略过',
    imgRepoUseFor2: '② 该仓库会作为平台 DevOps 的镜像仓库（交付中心、CI/CD 模块中使用）',
    savingImgServerConfig: '保存镜像服务配置中',
    imgServerAddressNotAvailable: '镜像服务地址不可用',
    imgServerSaveSuccess: '镜像服务配置保存成功',
    imgServerSaveFail: '镜像服务配置保存失败',
    plsInputRightImgServerAddress: '请填入合法的镜像服务地址',
    plsInputImgServerAddress: '请填写镜像服务地址',
    buildEnv: '构建环境',
    sourceOverview: '资源总览',
    hostList: '主机列表',
    labelManage: '标签管理',
    networkSolution: '网络方案',
    clusterStorage: '集群存储',
    clusterSet: '集群设置',
    addHostNode: '添加主机节点',
    createAlarmStrategy: '创建告警策略',
    createNewNotiGroup: '创建新通知组',
    addClusterOrNodeNote: '注意：新添加的主机需要与 Master 节点同一内网，可互通',
    noAvailableTermNode: '没有可用终端节点，请联系管理员',
    clusterCreatingTip: '添加中，完成后可查看集群详情',
    clusterCreateFailedTip: '创建失败',
  }
}

export default defineIntlMessages(mapData)
