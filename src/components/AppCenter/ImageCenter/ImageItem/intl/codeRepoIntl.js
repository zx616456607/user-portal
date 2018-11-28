/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for coderepo
 *
 * @author zhouhaitao
 *
 */
import { defineIntlMessages } from "../../../../../common/tools"

export const mapData = {
  prefix: 'AppCenter.ImageCenter.Detail.CodeRepo',
  data: {
    uploadImage: '上传镜像',
    downloadImage: '下载镜像',
    searchPlaceholder: '按镜像名称搜索',
    total: '共计 {total} 条',
    imageUrl: '镜像地址',
    versionNumber: '版本数',
    downloadCount: '下载次数',
    DeployService: '部署服务',
    publish: '发布',
    delThis: '删除',
    delImageTitle: '删除镜像',
    delMessage: '镜像 {repo} 删除成功',
    cannotDelMessage: '您没有权限删除该镜像',
    delImageConfirm: '您确定要删除镜像 {image}',
    delFailedMessage: '镜像删除失败',
    prohibitDelMessage: '在只读模式下删除是被禁止的',
    uploadImageStep1: '在本地 docker 环境中输入以下命令进行登录',
    uploadImageStep2: '然后，对本地需要 push 的 image 进行标记，比如：',
    uploadImageStep3: '最后在命令行输入如下命令，就可以 push 这个 image 到镜像仓库中了',
    downloadImageStep1: '在本地 docker 环境中输入以下命令，就可以 pull 一个镜像到本地了',
    downloadImageStep2: '私有镜像需要先 login 后才能拉取',
    downloadImageStep3: '为了在本地方便使用，下载后可以修改tag为短标签，比如：',
    noData: '暂无数据'
  }
 }

export default defineIntlMessages(mapData)
