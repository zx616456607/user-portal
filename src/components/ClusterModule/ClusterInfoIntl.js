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
  prefix: 'ClusterInfo',
  data: {
    cancel: '取消',
    save: '保存',
    inputClusterName: '输入集群名称',
    editCluster: '编辑集群',
    clusterName: '集群名称',
    status: '状态',
    normal: '正常',
    abnormal: '异常',
    buildEnv: '构建环境',
    clusterForBuildImg: '该集群用来作为构建镜像的环境',
    authMember: '授权成员',
    canUseByAll: '该集群可被所有成员选择使用',
    description: '描述',
    addDescription: '添加描述',
    deleteCluster: '删除集群',
    confirmDelete: '确定要删除',
    cautionDeleteCluster: '注意：请确认执行删除集群操作！该操作会导致将选中的集群与当前控制台Portal解绑，完全脱离当前控制台的管理，但不影响该集群的容器应用等的运行状态。',
    tip: '提示',
    onlySupportOneCluster: '目前只支持一个集群作为构建集群，修改构建集群后，为保证可以正常运行，请进行一下配置：',
    cicdToNewHarbor: '1、需要将 CI/CD 基础镜像上传到新的 harbor 上',
    configPipelineCluster: '2、流水线中执行环境选择将清空，请重新进行配置',
    sureChangeBuild: '是否确定将[ {clusterName} ]作为构建集群？',
    clusterSource: '集群来源',
    clusterTypeOne: '接入服务商提供的主机（自定义添加主机）',
    clusterTypeTwo: '接入服务商提供的主机（OpenStack）',
    clusterTypeThree: '接入服务商提供的主机（云星）',
    clusterTypeFour: '导入已有 Kubernetes 集群',
    clusterTypeFive: '添加主机自建 Kubernetes 集群',
  }
}

export default defineIntlMessages(mapData)
