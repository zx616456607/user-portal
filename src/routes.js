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
import AppList from './components/AppModule/AppList'
import AppDetail from './components/AppModule/AppDetail'
import AppCreate from './components/AppModule/AppCreate'
import Storage from './components/StorageModule/Storage'
import StorageDetail from './components/StorageModule/StorageDetail'
import Service from './components/ServiceConfig/Service'
/*---------AppCreate Start---------*/
import AppCreateSelectModel from './components/AppModule/AppCreate/CreateModel'
import AppCreateServiceList from './components/AppModule/AppCreate/ServiceList'
import AppCreateAppStore from './components/AppModule/AppCreate/AppStore'
import AppCreateComposeFile from './components/AppModule/AppCreate/ComposeFile'
/*---------AppCreate Stop---------*/
/*-------------------Application stop------------------------------*/
/*-------------------Container start-------------------------------*/
import ContainerList from './components/ContainerModule/ContainerList'
import ContainerDetail from './components/ContainerModule/ContainerDetail'
/*-------------------Container stop--------------------------------*/
/*-------------------App_manage Module Stop------------------------*/
/*-------------------App_center Module Start-----------------------*/
import AppCenter from './containers/AppCenter/Index'
import ImageCenter from './components/AppCenter/Index'
import ImageStore from './components/AppCenter/ImageStore'
import ComposeCenter from './components/AppCenter/ComposeCenter'
/*-------------------App_center Module Stop------------------------*/
/*-------------------database & cache Module Start------------------------*/  
import Database from './containers/Database/Index'
import MysqlCluster from './components/DatabaseCache/MysqlCluster'
import MongoCluster from './components/DatabaseCache/MongoCluster'
import RedisCluster from './components/DatabaseCache/RedisCluster'
import DatabaseStorage from './components/DatabaseCache/DatabaseStorage'
/*-------------------database & cache Module Stop------------------------*/  
/*-------------------CI/CD Module Start----------------------------------*/
import CICD from './containers/CICD/Index'
import CodeStore from './components/CICDModule/CodeStore'
import DockerFile from './components/CICDModule/DockerFile'
import TenxFlow from './components/CICDModule/TenxFlow'
import TenxFlowBuild from './components/CICDModule/TenxFlow/TenxFlowDetail'
/*-------------------CI/CD Module Stop-----------------------------------*/  


export default (
  <Route path="/" component={App}>
    <IndexRoute component={IndexPage} />
    <Route path="app_manage" component={Application}>
      <IndexRoute component={AppList} />
      <Route path="detail/:app_name" component={AppDetail} />
      <Route path="app_create" component={AppCreate}>
        <IndexRoute component={AppCreateSelectModel} />
        <Route path="fast_create" component={AppCreateServiceList} />
        <Route path="app_store" component={AppCreateAppStore} />
        <Route path="compose_file" component={AppCreateComposeFile} />
      </Route>
      <Route path="container">
        <IndexRoute component={ContainerList} />
        <Route path=":container_name" component={ContainerDetail} />
      </Route>
      <Route path="storage">
        <IndexRoute component={Storage} />
        <Route path=":pool/:cluster/:storage_name" component={StorageDetail} />
      </Route>
      <Route path="configs">
        <IndexRoute component={Service} />
      </Route>
    </Route>
    <Route path="app_center" component={AppCenter}>
      <IndexRoute component={ImageCenter} />
      <Route path="image_store" component={ImageStore} />
      <Route path="compose_center" component={ComposeCenter} />
    </Route>
    <Route path="database_cache" component={Database}>
      <IndexRoute component={MysqlCluster} />
      <Route path="mongo_cluster" component={MongoCluster} />
      <Route path="redis_cluster" component={RedisCluster} />
      <Route path="database_storage" component={DatabaseStorage} />
    </Route>
    <Route path="ci_cd" component={CICD}>
      <IndexRoute component={CodeStore} />
      <Route path="tenx_flow" >
        <IndexRoute component={TenxFlow} />
        <Route path="tenx_flow_build" component={TenxFlowBuild} />
      </Route>
      <Route path="docker_file" component={DockerFile} />
    </Route>
    <Route path="*" component={ErrorPage} />
  </Route>
)
