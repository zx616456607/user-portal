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
  const query = this.query
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.projects.getBy(['plugins', 'installed'], query)
  this.status = response.statusCode
  const { data:{ istio: {code = 404} = {} } = {} } = response
  const newResponse = {
      data:{
        code,
      },
    }
  this.body = newResponse
}

// serviceMesh 相关
// 设置服务 Istio 状态（开/关）
exports.putToggleAPPMesh = function *() {
  const clusterId = this.params.clusterId
  const name = this.params.name

  const loginUser = this.session.loginUser;
  const projectApi = apiFactory.getMeshApi(loginUser)
  const response = yield projectApi.servicemesh.updateBy(['clusters', clusterId, 'paas', 'services' ,
  name, 'status'], null,  this.request.body)
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

// 获取服务列表服务状态
exports.getServiceListServiceMeshStatus = function *() {
  const clusterId = this.params.clusterId
  const query = this.query
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getMeshApi(loginUser)
  const response = yield projectApi.servicemesh.getBy(['clusters', clusterId, 'paas', 'services'], query)
  this.status = response.statusCode
  this.body = response
}

// 列取服务网格出口
exports.getServiceMeshPortList = function *() {
  const clusterId = this.params.clusterId
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getMeshApi(loginUser)
  const response = yield projectApi.servicemesh.getBy(['clusters', clusterId, 'ingressgateway'])
  this.status = response.statusCode
  this.body = response
}

exports.getServiceMeshPort = function *() {
  const clusterId = this.params.clusterId
  const hashedName = this.params.hashedName
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getMeshApi(loginUser)
  const response = yield projectApi.servicemesh.getBy(['clusters', clusterId, 'ingressgateway', hashedName])
  this.status = response.statusCode
  this.body = response
}

exports.createServiceMeshPort = function *() {
  const clusterId = this.params.clusterId
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getMeshApi(loginUser)
  const response = yield projectApi.servicemesh.createBy(['clusters', clusterId, 'ingressgateway'], null, this.request.body )
  this.status = response.statusCode
  this.body = response
}

exports.updateServiceMeshPort = function *() {
  const clusterId = this.params.clusterId
  const hashedName = this.params.hashedName
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getMeshApi(loginUser)
  const response = yield projectApi.servicemesh.updateBy(['clusters', clusterId, 'ingressgateway', hashedName], null,  this.request.body)
  this.status = response.statusCode
  this.body = response
}

exports.deleteServiceMeshPort = function *() {
  const clusterId = this.params.clusterId
  const hashedName = this.params.hashedName
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getMeshApi(loginUser)
  const response = yield projectApi.servicemesh.deleteBy(['clusters', clusterId, 'ingressgateway', hashedName])
  this.status = response.statusCode
  this.body = response
}

exports.getServiceMeshClusterNode = function *() {
  const clusterId = this.params.clusterId
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getMeshApi(loginUser)
  const response = yield projectApi.servicemesh.getBy(['clusters', clusterId, 'nodes'])
  this.status = response.statusCode
  this.body = response
}

exports.getImageAppStackN = function *() {
  const query = this.query
  const loginUser = this.session.loginUser
  const projectApi = apiFactory.getApi(loginUser)
  const response = yield projectApi.registries.getBy(['images', 'loads'], query)
  this.status = response.statusCode
  this.body = response
}