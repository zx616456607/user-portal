/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Root dev file
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { Provider, connect } from 'react-redux'
import routes from '../routes'
import { Router } from 'react-router'
// import { hot } from 'react-hot-loader'
// Internationalization
import { LocaleProvider } from 'antd'
import { addLocaleData, IntlProvider } from 'react-intl'
const appLocale = window.appLocale
addLocaleData(appLocale.data)

class Root extends Component {
  render() {
    const { store, history, locale } = this.props
    return (
      <Provider store={store}>
        <LocaleProvider locale={locale}>
          <IntlProvider locale={locale} messages={appLocale.messages}>
            <Router
              onUpdate={() => window.scrollTo(0, 0)}
              history={history}
              routes={routes}
              key={Math.random()} // for react hot load
            />
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
