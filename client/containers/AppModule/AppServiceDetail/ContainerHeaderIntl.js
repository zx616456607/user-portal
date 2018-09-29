/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for IndexPage
 * v0.1 - 2018-08-28
 *
 * @author zhangpc
 *
 */

import { defineIntlMessages } from '../../../../src/common/tools'

export const mapData = {
  prefix: 'AppModule.AppServiceDetail.ContainerHeader',
  data: {
    fixedInstanceIP: '固定实例 IP',
    viewConfiguredIP: '查看配置的 IP',
    scaling: '水平扩展',
    autoScaling: '自动伸缩',
    refresh: '刷新',
    fixedIPTips: '已开启固定实例 IP，无法继续操作',
  },
}

export default defineIntlMessages(mapData)
