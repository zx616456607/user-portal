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
  prefix: 'ClusterModule',
  data: {
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
  }
}

export default defineIntlMessages(mapData)
