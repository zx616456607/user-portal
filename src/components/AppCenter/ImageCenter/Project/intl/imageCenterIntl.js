/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for image-center
 *
 * @author zhouhaitao
 *
 */
import { defineIntlMessages } from "../../../../../common/tools"

export const mapData = {
  prefix: 'AppCenter.ImageCenter.List',
  data: {
    searchPlaceholder: '按仓库组搜索',
    repoGroupName: '仓库组名称',
    accessLevel: '访问级别',
    myRole: '我的角色',
    countOfImage: '镜像数',
    updateTime: '更新时间',
    creationTime: '创建时间',
    option: '操作',
    publicType: '公开',
    privateType: '私有',
    admin: '管理员',
    developer: '开发人员',
    visitor: '访客',
    setToPrivate: '设为私有',
    setToPublic: '设为公开',
    deleteThis: '删除',
    deleteThisAlertMsg: '应用商店对应仓库组，系统创建不可删除',
    total: '共',
    item: '条',
    noData: '暂无数据',
    setToPrivateTitle: '设为私有',
    setToPrivateContent: '当仓库组设为私有后，仅仓库组成员可查看仓库组内镜像；',
    setToPublicContent1: '当仓库组设为私有后，仅仓库组成员可查看仓库组内镜像；',
    setToPublicContent2: '命令行操作下需',
    setToPublicContent3: '方可拉取此仓库组内的镜像。',
    setToPrivateConfirm: '您确认将项目',
    deleteConfirm: '您确认删除 {repoName} 仓库组?',
    updateFailed: '更新仓库组 {repoName} 失败',
  }
}

export default defineIntlMessages(mapData)
