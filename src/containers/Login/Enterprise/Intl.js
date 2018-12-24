/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for login page
 * v0.1 - 2018-08-23
 *
 * @author zhangpc
 *
 */

import { defineIntlMessages } from '../../../common/tools'

export const mapData = {
  prefix: 'Login',
  data: {
    login: '登录',
    usernameOrEmail: '用户名 / 邮箱',
    password: '密码',
    tipsSuccess: '用户 {username} 登录成功',
    tipsFailed: '登录名或者密码错误',
    tipsFailedInit: '请先进行初始化配置',
    tipsFailedChangePwd: '由于安全管理需要，首次登录需设置新密码',
    tipsFailedBlock: '该账号已被停用',
    inputTipsUser: '请填写用户名',
    inputTipsEmail: '邮箱地址填写错误',
    inputTipsPassword: '请填写密码',
    serviceUnavailable: '服务不可用',
    licenseExpired: '许可证已过期，',
    licenseInputRequired: '请重新输入许可证',
    licenseExplore: '以使用平台',
    licenseGoaActivate: '去激活',
    moreLoginMethods: '更多登录方式',
    KeycloakLoginFailed: 'Keycloak 登录失败',
  }
}

export default defineIntlMessages(mapData)
