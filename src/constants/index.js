/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App constants
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

export const API_URL_PREFIX = '/api/v2'
export const DEFAULT_IMAGE_POOL = 'k8s-pool'
export const DEFAULT_REGISTRY = 'default'
export const TENX_MARK = 'tenxcloud.com'
export const LABEL_APPNAME = `${TENX_MARK}/appName`
export const USERNAME_REG_EXP = new RegExp('^[a-z][-a-z0-9]{1,40}[a-z0-9]$')
export const EMAIL_REG_EXP = new RegExp('^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$')
export const TEST_MONITOR_OPTION = {
  title: {
    text: 'test monitor'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['container 1', 'container 2']
  },
  toolbox: {
    feature: {
      saveAsImage: {}
    }
  },
  grid: {
    left: 50,
    right: 50,
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  series: [
    {
      name: 'container 1',
      type: 'line',
      stack: '总量',
      areaStyle: { normal: {} },
      data: [120, 132, 101, 134, 90, 230, 210]
    },
    {
      name: 'container 2',
      type: 'line',
      stack: '总量',
      areaStyle: { normal: {} },
      data: [220, 182, 191, 234, 290, 330, 310]
    }
  ]
}