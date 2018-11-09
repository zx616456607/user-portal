/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for Header
 * v0.1 - 2018-08-25
 *
 * @author zhangpc
 *
 */

import { defineIntlMessages } from '../../common/tools'

export const mapData = {
  prefix: 'Header',
  data: {
    project: '项目',
    cluster: '集群',
    selectProject: '选择项目',
    selectCluster: '选择集群',
    switchSuccessfully: '已成功切换到',
    emptyClustersTip: '{project} {projectName} 的{cluster}列表为空，请重新选择{project}',
    msaPortal: '微服务入口',
    sysAdmin: '系统管理员',
    paasAdmin: '平台管理员',
    localAdmin: '基础设施管理员',
    normalUser: '普通成员',
    balance: '帐户余额',
    logout: '注销登录',
    account: '账户信息',
    changePwd: '修改密码',
    team: '团队',
    project: '项目',
    loadProjectsFailedTip: '加载项目失败',
    loadClustersFailedTip: '加载集群失败',
    workOrder: '工单',
    systemNotice: '公告',
  },
}

export default defineIntlMessages(mapData)
