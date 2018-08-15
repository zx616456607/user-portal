/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.js page
 *
 * @author zhangtao
 * @date Wednesday August 15th 2018
 */
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
import { render } from 'react-dom'
import { browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import Root from '../containers/Root'
import configureStore from '../store/configureStore'
import Notification from '../components/Notification'
import '@tenx-ui/icon/assets/index.less'

const notification  = new Notification()
const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)
notification.init(store)

render(
  <Root store={store} history={history} />,
  document.getElementById('root')
)

