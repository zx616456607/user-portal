/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Chinese entry file
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import 'babel-polyfill'
import appLocaleData from 'react-intl/locale-data/zh'
import zhMessages from '../../static/locales/frontend/zh.json'

window.appLocale = {
  messages: {
    ...zhMessages,
  },
  antd: null,
  locale: 'zh',
  data: appLocaleData
}