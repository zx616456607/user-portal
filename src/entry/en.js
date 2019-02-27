/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * English entry file
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import moment from 'moment'
import appLocaleData from 'react-intl/locale-data/en'
import enMessages from '../../static/locales/frontend/en.json'

// Set moment internationalize
moment.locale('en', {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "%d s",
    m: "a min",
    mm: "%d min",
    h: "1 h",
    hh: "%d h",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years"
  }
})

window.appLocale = Object.assign({}, window.appLocale, {
  en_messages: {
    ...enMessages,
  },
  locale: 'en',
  data: appLocaleData
})
