/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * container_security_policy.js.js page
 *
 * @author zhangtao
 * @date Wednesday November 7th 2018
 */

const apiFactory = require('../services/api_factory')

//
exports.getK8sNativeResource = function *() {
  const cluster = this.params.cluster
  const type = this.params.type
  const loginUser = this.session.loginUser;
  const projectApi = apiFactory.getApi(loginUser);
  const response = yield projectApi.clusters.getBy([cluster, 'native', type],null,);
  this.status = response.statusCode;
  this.body = response;
}

exports.deleteK8sNativeResourceInner = function *() {
  const cluster = this.params.cluster
  const type = this.params.type
  const name = this.params.name
  const loginUser = this.session.loginUser;
  const projectApi = apiFactory.getApi(loginUser);
  const response = yield projectApi.clusters.deleteBy([cluster, 'native', type, name],null,);
  this.status = response.statusCode;
  this.body = response;
}

exports.deletePSP = function *() {
  const cluster = this.params.cluster
  const name = this.params.name
  const loginUser = this.session.loginUser;
  const projectApi = apiFactory.getApi(loginUser);
  const response = yield projectApi.clusters.deleteBy([cluster, 'podsecuritypolicy', name],null,);
  this.status = response.statusCode;
  this.body = response;
}

exports.listPSP = function *() {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser;
  const projectApi = apiFactory.getApi(loginUser);
  const response = yield projectApi.clusters.getBy([cluster, 'podsecuritypolicy'],null,);
  this.status = response.statusCode;
  this.body = response;
}

exports.listPSPDetail = function *() {
  const cluster = this.params.cluster
  const name = this.params.name
  const loginUser = this.session.loginUser;
  const projectApi = apiFactory.getApi(loginUser);
  const response = yield projectApi.clusters.getBy([cluster, 'podsecuritypolicy', name],null,);
  this.status = response.statusCode;
  this.body = response;
}

exports.listProjectPSPDetail = function *() {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser;
  const projectApi = apiFactory.getApi(loginUser);
  const response = yield projectApi.clusters.getBy([cluster, 'podsecuritypolicy', 'project'],null,);
  this.status = response.statusCode;
  this.body = response;
}

exports.startPodProject = function *() {
  const cluster = this.params.cluster
  const resources = this.params.resources
  const loginUser = this.session.loginUser;
  const projectApi = apiFactory.getApi(loginUser);
  const response = yield projectApi.clusters.createBy([cluster, 'podsecuritypolicy', 'project', resources],null,);
  this.status = response.statusCode;
  this.body = response;
}

exports.stopPSPProject = function *() {
  const cluster = this.params.cluster
  const resources = this.params.resources
  const loginUser = this.session.loginUser;
  const projectApi = apiFactory.getApi(loginUser);
  const response = yield projectApi.clusters.deleteBy([cluster, 'podsecuritypolicy', 'project', resources],null,);
  this.status = response.statusCode;
  this.body = response;
}
