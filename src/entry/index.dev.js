/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Index entry file
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

import '@babel/polyfill'
import '../common/lib'
import React from 'react'
import ReactDOM from 'react-dom'
import { browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { AppContainer } from 'react-hot-loader'
import Root from '../containers/Root'
import configureStore from '../store/configureStore'
import Notification from '../components/Notification'

const notification  = new Notification()
const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)
notification.init(store)

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      {Component}
    </AppContainer>,
    document.getElementById('root')
  )
}

render(<Root store={store} history={history} />)

if (module.hot) {
  module.hot.accept('../containers/Root', () => {
    render(<Root store={store} history={history} />)
  })
}
