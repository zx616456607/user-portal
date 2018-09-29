/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for App
 * v0.1 - 2018-08-30
 *
 * @author zhangpc
 *
 */

import { defineIntlMessages } from '../../common/tools'

export const mapData = {
  prefix: 'App',
  data: {
    insufficientBalance: '余额不足，请充值后重试',
    teamInsufficientBalance: '团队余额不足，请充值后重试',
    projectInsufficientBalance: '项目余额不足，请充值后重试',
    operationFailed: '操作失败',
    licenseExpired: '许可证已过期，请在登录界面激活',
    noInstalled: '{kind} 未安装',
    initialization: '初始化中...',
    getClusterInfo: '获取集群信息中...',
    switchClusterOrProject: '切换项目/集群中...',
    one: '个',
    loginExpired: '登录失效',
    goLogin: '去登录',
    loginExpiredTip: '您的登录状态已失效，请登录后继续当前操作',
    notAuthorized: '当前操作未被授权',
    gotIt: '知道了',
    notAuthorizedTip: '当前操作未被授权{operation}，请联系管理员进行授权后，再进行操作',
    resourceQuotaTip1: '超过配额，你目前只剩下{leftResource}配额',
    resourceQuotaTip2: '您可以前往总览或项目详情页面查询当前配额使用情况或联系系统管理员提高配额。',
    loadError: '加载出错',
    loadErrorBtn: '重新加载',
    loadErrorTips: '加载出错，平台升级中，点击「重新加载」刷新页面',
    loginUserChanged: '登录用户已变更',
    loginUserChangedTips: '检测到当前浏览器已登录其他用户：{user}',
    loginUserChangedBtn: '刷新',
    noProjetsTip: '帐号还未加入任何项目，请先『创建项目』或『联系管理员加入项目』',
    createProject: '『创建项目』',
    noProjetsTipWithLink: '帐号还未加入任何项目，请先{link}或『联系管理员加入项目』',
    noClustersTip: '项目暂无授权的集群，请先申请『授权集群』或选择其他项目',
    applyClusters: '申请『授权集群』',
    noClustersTipWithLink: '项目暂无授权的集群，请先{link}或选择其他项目',
  }
}

export default defineIntlMessages(mapData)
