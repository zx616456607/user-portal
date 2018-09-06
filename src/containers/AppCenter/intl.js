/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * app center intl message
 *
 * @author zhangxuan
 * @date 2018-08-23
 */
import { defineIntlMessages } from '../../common/tools'

const messageObj = {
  prefix: 'AppCenter.AppTemplate',
  data: {
    appTemplate: '应用模板',
    create: '创建模板',
    refresh: '刷新',
    placeholder: '请输入模板名称搜索',
    total: '共 {total} 条',
    deleteTemplate: '删除应用模板',
    deleteTip: '删除模板后，基于此模板创建的应用不受影响，但删除后无法恢复，是否确定删除？',
    chartRepoConnectFailure: 'chart repo 连接失败',
    deleting: '应用模板删除中',
    deleteFailure: '应用模板删除失败',
    deleteSuccess: '应用模板删除成功',
    emptyTip: '您还没有应用模板，创建一个吧!',
    edit: '修改',
    delete: '删除',
    deploy: '部署',
    updateOn: '更新于 {date}',
    deteting: '应用模板删除中',
  }
}

export default defineIntlMessages(messageObj)
