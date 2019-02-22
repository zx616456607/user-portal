/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Chinese entry file
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import moment from 'moment'
import 'moment/locale/zh-cn'
import appLocaleData from 'react-intl/locale-data/zh'
import zhMessages from '../../static/locales/frontend/zh.json'

// Set moment internationalize
moment.locale('zh-cn')

window.appLocale = Object.assign({}, window.appLocale, {
  zh_messages: {
    ...zhMessages,
  },
  locale: 'zh',
  data: appLocaleData
})
