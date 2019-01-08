/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Utilities functions for right cloud
 *
 * v0.1 - 2019-01-07
 * @author zhangxuan
 */

export const renderNetStatus = status => {
  let text = ''
  let cls = ''
  switch (status) {
    case 'ACTIVE':
      text = '运行中'
      cls = 'successColor'
      break
    case 'INACTIVE':
      text = '不可用'
      cls = 'hintColor'
      break
    case 'CREATE_FAILURE':
      text = '创建失败'
      cls = 'failedColor'
      break
    case 'CREATING':
      text = '创建中'
      cls = 'themeColor'
      break
    case 'STOPPED':
      text = '已停止'
      cls = 'failedColor'
      break
    case 'DELETING':
      text = '删除中'
      cls = 'failedColor'
      break
    default:
      break
  }
  return {
    text,
    cls,
  }
}
