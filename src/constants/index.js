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
export const CREATE_APP_ANNOTATIONS = 'tenxcloud.com/schemaPortname'
export const LABEL_APPNAME = `${TENX_MARK}/appName`
export const USERNAME_REG_EXP = new RegExp('^[a-z][-a-z0-9]{1,40}[a-z0-9]$')
export const STORAGENAME_REG_EXP = new RegExp('^[a-z][-a-z0-9_]{2,14}$')
export const EMAIL_REG_EXP = new RegExp('^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$')
export const HOST = 'localhost:8003'
// When these actions occurs the page will render to ErrorPage(StatusCode === 404 || StatusCode >= 500).
export const SHOW_ERROR_PAGE_ACTION_TYPES = [
  'APP_DETAIL_FAILURE',
  'CONTAINER_DETAIL_FAILURE',
  'USER_DETAIL_FAILURE',
]
export const LOGIN_EXPIRED_MESSAGE = 'LOGIN_EXPIRED'
export const MY_SPACE = {
  name: "我的空间",
  spaceName: "我的空间",
  namespace: "default",
  teamID: "default",
}
export const MAX_LOGS_NUMBER = 500