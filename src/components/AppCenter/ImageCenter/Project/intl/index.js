/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for imageCenter/Project/index
 *
 * @author zhouhaitao
 *
 */
import { defineIntlMessages } from "../../../../../common/tools"

export const mapData = {
  prefix: 'AppCenter.ImageCenter.NewRepoGroup',
  data: {
    repoGroupName: '仓库组名称',
    placeholder: '请输入仓库组名称',
    repoGroupType: '仓库组类型',
    privateType: '私有',
    publicType: '公开',
    newRepoGroupMessage: '当仓库组设为公开后，所有人都有读取该仓库组内镜像的权限。命令行操作下无需“docker login”即可以拉取该仓库组内的所有镜像。',
    nameValidateMsg1: '请输入仓库组名称',
    nameValidateMsg2: '仓库组名称至少3位字符',
    nameValidateMsg3: '仓库组名称长度不可超过30个字符',
    nameValidateMsg4: '请输入小写英文字母和数学开头和结尾，中间可[_-]',
    createSuccessMsg: '仓库组 {name} 创建成功',
    hasBeenCreated: '仓库组名称 {name} 已存在',
    requestErr: '请求错误，请检查仓库名称：${name}',
    createFail: '创建仓库组 ${name} 失败，错误代码: ${statusCode}',
    okText: '确定',
    cancelText: '取消',
    loadDataErr: '请求错误,镜像仓库暂时无法访问，请联系管理员',
    deleteRepoOk: '仓库组 {name} 删除成功',
    cannotDel: '仓库组包含镜像仓库或复制规则，无法删除',
    deleteFailed: '仓库组删除失败',
    newRepoBtn: '新建仓库组',
    searchPlaceholder: '按仓库组名称搜索',
    deleteRepoModalTitle: '删除仓库组',
    deleteConfirmText: '您确认删除 {name} 仓库组?'
  }
}

export default defineIntlMessages(mapData)
