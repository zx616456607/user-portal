/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * App routes
 * 
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

import React from 'react'
import { Route, IndexRoute } from 'react-router'
import App from './containers/App'
import IndexPage from './containers/IndexPage'
import ErrorPage from './containers/ErrorPage'
import Container from './containers/container/Index'
import DomainAliases from './containers/container/DomainAliases'
import IP from './containers/container/IP'
import Transh from './containers/container/Transh'
import Ci from './containers/ci/Index'
import Registry from './containers/registry/Index'
import Stack from './containers/stack/Index'
import Hosting from './containers/hosting/Index'
/*-------------------App_manage Module Start-----------------------*/
import Application from './containers/Application/Index'
import AppList from './components/AppModule/AppList.js'
import AppDetail from './components/AppModule/AppDetail.js'
import AppCreate from './components/AppModule/AppCreate.js'
/*---------AppCreate Start---------*/
import AppCreateSelectModel from './components/AppModule/AppCreate/CreateModel.js'
/*---------AppCreate Stop---------*/
/*-------------------App_manage Module Stop------------------------*/
export default (
  <Route path="/" component={App}>
    <IndexRoute component={IndexPage}/>
    <Route path="app_manage" component={Application}>
      <IndexRoute component={AppList}/>
      <Route path="detail/:app_id" component={AppDetail} />
      <Route path="app_create" component={AppCreate} >
        <IndexRoute component={AppCreateSelectModel}/>
      </Route>
    </Route>
    <Route path="containers">
      <IndexRoute component={Container}/>
      <Route path="/" component={DomainAliases}/>
      <Route path="ip" component={IP}/>
      <Route path="transh" component={Transh}/>
    </Route>
    <Route path="ci">
      <IndexRoute component={Ci}/>
    </Route>
    <Route path="docker-registry">
      <IndexRoute component={Registry}/>
    </Route>
    <Route path="stack">
      <IndexRoute component={Stack}/>
    </Route>
    <Route path="hosting">
      <IndexRoute component={Hosting}/>
    </Route>
    <Route path="*" component={ErrorPage}/>
  </Route>
)
