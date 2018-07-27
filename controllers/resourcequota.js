/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * resourcequota.js page
 *
 * @author zhangtao
 * @date Wednesday June 20th 2018
 */
'use strict'

const apiFactory = require('../services/api_factory')

// 申请资源配额 // post
exports.applyResourcequota = function* () {
  const loginUser = this.session.loginUser;
  const body = this.request.body;
  const { teamspace } = this.request.headers
  let headers
  if ( teamspace ) {
    let headers = { teamspace }
  }
  const api = apiFactory.getApi(loginUser);
  const result = yield api.resourcequota.createBy(['apply'], null, body, { headers });
  this.body = result;
}

// 查看申请记录
exports.checkApplyRecord = function* () {
  const loginUser = this.session.loginUser;
  const api = apiFactory.getApi(loginUser);
  const query = this.query;
  const result = yield api.resourcequota.getBy(['apply'], query);
  this.body = result;
}

// 删除审批记录
exports.deleteResourcequota = function* () {
  const loginUser = this.session.loginUser;
  const id = this.params.id;
  const api = apiFactory.getApi(loginUser);
  const result = yield api.resourcequota.deleteBy(['apply', id]);
  this.body = result;
}

// 更新审批状态
exports.updateResourcequota = function* () {
  const loginUser = this.session.loginUser;
  const body = this.request.body;
  const id = this.params.id;
  const api = apiFactory.getApi(loginUser);
  const result = yield api.resourcequota.updateBy(['apply', id], null, body);
  this.body = result;
}

// 查看审批详情
exports.checkResourcequotaDetail = function* () {
  const loginUser = this.session.loginUser;
  const api = apiFactory.getApi(loginUser);
  const id = this.params.id;
  const result = yield api.resourcequota.getBy(['apply', id,]);
  this.body = result;
}

// 查看审批记录是否已存在
exports.checkResourcequotaExist = function* () {
  const loginUser = this.session.loginUser;
  const api = apiFactory.getApi(loginUser);
  const result = yield api.resourcequota.getBy(['apply', 'checkApplyExist']);
  this.body = result;
}
// 获取资源定义
exports.resourceDefinite = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.resourcequota.getBy(['definitions'])
  this.body = result
}


