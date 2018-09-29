/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * service_mesh.js page
 *
 * @author zhangtao
 * @date Thursday September 27th 2018
 */
'use strict'

const apiFactory = require('../services/api_factory')

// 项目在某个集群下开启或关闭serviceMesh
// 设置项目 Istio 状态（开/关）
exports.updateToggleServiceMesh = function *() {
  const clusterId = this.params.clusterId
  const loginUser = this.session.loginUser;
  const projectApi = apiFactory.getMeshApi(loginUser);
  const response = yield projectApi.servicemesh.updateBy(['clusters', clusterId, 'paas', 'status' ],
  null, this.request.body);
  this.status = response.statusCode
  this.body = response
}

// 查看某个项目在某个集群下是否开启了serviceMesh
// 获取项目 Istio 状态
exports.getCheckProInClusMesh = function *() {
  const clusterId = this.params.clusterId
  const loginUser = this.session.loginUser;
  const projectApi = apiFactory.getMeshApi(loginUser);
  const response = yield projectApi.servicemesh.getBy(['clusters', clusterId, 'paas', 'status'],
  null,);
  this.status = response.statusCode;
  this.body = response;
}
// 查看某个集群是否安装了istio
exports.getCheckClusterIstio = function *() {
  const query = this.query;
  const loginUser = this.session.loginUser;
  const projectApi = apiFactory.getApi(loginUser);
  const response = yield projectApi.projects.getBy(['istio', 'check'], query);
  this.status = response.statusCode;
  this.body = response;
}

// serviceMesh 相关
exports.putToggleAPPMesh = function *() {
  const cluster = this.params.cluster
  const service = this.params.service

  const loginUser = this.session.loginUser;
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.clusters.updateBy([cluster, 'services', service, 'mesh'], )
  this.status = response.statusCode
  this.body = response
}

// 查询服务是否开启服务网格
// 获取服务 Istio 状态
exports.getCheckAPPInClusMesh = function *() {
  const clusterId = this.params.clusterId
  const query = this.query
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getMeshApi(loginUser)
  const response = yield projectApi.servicemesh.getBy(['clusters', clusterId, 'paas', 'pods'], query)
  this.status = response.statusCode
  this.body = response
}
