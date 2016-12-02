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
// When these action occurs the page will render to ErrorPage
export const SHOW_ERROR_PAGE_ACTION_TYPES = [
  'APP_DETAIL_FAILURE',
  'CONTAINER_DETAIL_FAILURE',
  'USER_DETAIL_FAILURE',
]