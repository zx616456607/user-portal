/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for \src\components\AppCenter\ImageCenter\ProjectDetail\DetailInfo.js
 *
 * @author zhouhaitao
 *
 */
import { defineIntlMessages } from "../../../../../common/tools"

export const mapData = {
  prefix: 'AppCenter.ImageCenter.DetailInfo',
  data: {
    inUpdate: '更新镜像 {name} 信息中...',
    updateSuccess: '更新镜像 {name} 成功',
    updateFailure: '更新镜像 {name} 失败',
    hasNotBeenAddInfoYet: '还没有添加详细信息',
    edit: '编辑',
    markdownSupport: '注：基本信息支持 markdown 语法编辑',
    baseInfo: '基本信息',
    okText: '确定',
    cancelText: '取消',
  }
}

export default defineIntlMessages(mapData)
