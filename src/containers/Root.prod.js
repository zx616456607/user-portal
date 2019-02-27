/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Root production file
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { Provider, connect } from 'react-redux'
import routes from '../routes'
import { Router } from 'react-router'

// Internationalization
import { LocaleProvider } from 'antd'
import { addLocaleData, IntlProvider } from 'react-intl'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { loadJS } from '../common/tools'
import { LOCALE_SCRIPT_ID } from '../constants'
import antdEn from 'antd/lib/locale-provider/en_US'
const appLocale = window.appLocale
addLocaleData(appLocale.data)

class Root extends Component {
  componentWillReceiveProps(newProps) {
    const { locale: newLocale } = newProps
    const { locale: oldLocale } = this.props
    if (newLocale !== oldLocale) {
      const localeScript = document.getElementById(LOCALE_SCRIPT_ID)
      if (localeScript) {
        localeScript.remove()
      }
      loadJS(`/bundles/${newLocale}.js?_=${Math.random()}`, LOCALE_SCRIPT_ID, () => {
        // Set moment internationalize
        if (newLocale === 'en') {
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
        } else {
          moment.locale('zh-cn')
        }
        this.forceUpdate()
      })
    }
  }

  componentDidMount() {
    // disabled react dev tools in the console
    window.$r = null
  }

  render() {
    const { store, history, locale } = this.props
    return (
      <Provider store={store}>
        <LocaleProvider locale={locale === 'en' ? antdEn : null}>
          <IntlProvider locale={locale} messages={window.appLocale[`${locale}_messages`]}>
            <Router onUpdate={() => window.scrollTo(0, 0)} history={history} routes={routes} />
          </IntlProvider>
        </LocaleProvider>
      </Provider>
    )
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}

export default connect(state => ({
  locale: state.entities.current.locale,
}))(Root)
