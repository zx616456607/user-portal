/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for image-detail
 *
 * @author zhouhaitao
 *
 */
import { defineIntlMessages } from "../../../../common/tools"

export const mapData = {
  prefix: 'AppCenter.ImageCenter.Detail',
  data: {
    returnTxt: '返回',
    privateRepoGroup: '私有仓库组',
    publicRepoGroup: '公开仓库组',
    myRole: '我的角色',
    admin: '管理员',
    developer: '开发人员',
    visitor: '访客',
    fetchMemberFailure: '获取成员失败',
    unknown: '未知',
    imageRepo: '镜像仓库',
    auditLog: '审计日志',
    authorityManagement: '权限管理',
    imageAsync: '镜像同步',
    tagManagement: '标签管理',
  },
}
export default defineIntlMessages(mapData)
