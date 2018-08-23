/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for login page
 *
 * @author zhangpc
 *
 */

import { defineMessages } from 'react-intl'

export default defineMessages({
  login: {
    id: 'Login.login',
    defaultMessage: '登录',
  },
  usernameOrEmail: {
    id: 'Login.usernameOrEmail',
    defaultMessage: '用户名 / 邮箱',
  },
  password: {
    id: 'Login.password',
    defaultMessage: '密码',
  },
  tipsSuccess: {
    id: 'Login.tipsSuccess',
    defaultMessage: '用户 {username} 登录成功',
  },
  tipsFailed: {
    id: 'Login.tipsFailed',
    defaultMessage: '登录名或者密码错误',
  },
  tipsFailedInit: {
    id: 'Login.tipsFailedInit',
    defaultMessage: '请先进行初始化配置',
  },
  tipsFailedChangePwd: {
    id: 'Login.tipsFailedChangePwd',
    defaultMessage: '由于安全管理需要，首次登录需设置新密码',
  },
  tipsFailedBlock: {
    id: 'Login.tipsFailedBlock',
    defaultMessage: '该账号已被停用',
  },
  inputTipsUser: {
    id: 'Login.inputTipsUser',
    defaultMessage: '请填写用户名',
  },
  inputTipsEmail: {
    id: 'Login.inputTipsEmail',
    defaultMessage: '邮箱地址填写错误',
  },
  inputTipsPassword: {
    id: 'Login.inputTipsPassword',
    defaultMessage: '请填写密码',
  },
  serviceUnavailable: {
    id: 'Login.serviceUnavailable',
    defaultMessage: '服务不可用',
  },
  licenseExpired: {
    id: 'Login.licenseExpired',
    defaultMessage: '许可证已过期，',
  },
  licenseInputRequired: {
    id: 'Login.licenseInputRequired',
    defaultMessage: '请重新输入许可证',
  },
  licenseExplore: {
    id: 'Login.licenseExplore',
    defaultMessage: '以使用平台',
  },
  licenseGoaActivate: {
    id: 'Login.licenseGoaActivate',
    defaultMessage: '去激活',
  },
})
