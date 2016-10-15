/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Index entry file
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import 'babel-polyfill'
import '../common/lib'
import React from 'react'
import { render } from 'react-dom'
import { browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import Root from '../containers/Root'
import configureStore from '../store/configureStore'

const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)

render(
  <Root store={store} history={history} />,
  document.getElementById('root')
)

if (process.env.NODE_ENV !== 'production') {
  module.hot.accept()
}
