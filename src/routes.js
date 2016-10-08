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
/*-------------------App_manage Module Start-----------------------*/
/*-------------------Appliaction Start-----------------------------*/
import Application from './containers/Application/Index'
import AppList from './components/AppModule/AppList.js'
import AppDetail from './components/AppModule/AppDetail.js'
import AppCreate from './components/AppModule/AppCreate.js'
import Storage from './components/StorageModule/Storage'
import StorageDetail from './components/StorageModule/StorageDetail'
import Service from './components/ServiceConfig/Service'
/*---------AppCreate Start---------*/
import AppCreateSelectModel from './components/AppModule/AppCreate/CreateModel.js'
import AppCreateServiceList from './components/AppModule/AppCreate/ServiceList.js'
import AppCreateAppStore from './components/AppModule/AppCreate/AppStore.js'
import AppCreateComposeFile from './components/AppModule/AppCreate/ComposeFile.js'
/*---------AppCreate Stop---------*/
/*-------------------Application stop------------------------------*/
/*-------------------Container start-------------------------------*/
import ContainerList from './components/ContainerModule/ContainerList.js'
import ContainerDetail from './components/ContainerModule/ContainerDetail.js'
/*-------------------Container stop--------------------------------*/
/*-------------------App_manage Module Stop------------------------*/
/*-------------------Image_Center Module Start---------------------*/
import ImageCenterBox from './containers/ImageCenter/Index'
/*-------------------Image_Center Start----------------------------*/
import ImageCenter from './components/ImageCenter/Index'
import ImageStore from './components/ImageCenter/ImageStore.js'
import ComposeCenter from './components/ImageCenter/ComposeCenter.js'
/*-------------------Image_Center Stop-----------------------------*/
/*-------------------Image_Center Module Stop----------------------*/
export default (
  <Route path="/" component={App}>
    <IndexRoute component={IndexPage}/>
    <Route path="app_manage" component={Application}>
      <IndexRoute component={AppList}/>
      <Route path="detail/:app_name" component={AppDetail} />
      <Route path="app_create" component={AppCreate}>
        <IndexRoute component={AppCreateSelectModel}/>
        <Route path="fast_create" component={AppCreateServiceList} />
        <Route path="app_store" component={AppCreateAppStore} />
        <Route path="compose_file" component={AppCreateComposeFile} />
      </Route>
      <Route path="container">
        <IndexRoute component={ContainerList}/>
        <Route path="detail/:container_id" component={ContainerDetail} />
      </Route>
      <Route path="storage">
        <IndexRoute component={Storage}/>
        <Route path=":storage_id" component={StorageDetail} />
      </Route>
      <Route path="configs">
        <IndexRoute component={Service}/>
      </Route>
    </Route>
    <Route path="image_center" component={ImageCenterBox}>
    	<IndexRoute component={ImageCenter}/>
    	<Route path="image_store" component={ImageStore} />
      <Route path="compose_center" component={ComposeCenter} />
    </Route>
    <Route path="*" component={ErrorPage}/>
  </Route>
)
