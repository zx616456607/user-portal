/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App template controller
 *
 * v0.1 - 2018-03-22
 * @author zhangxuan
 */
'use strict'

const apiFactory = require('../services/api_factory')

// create template
exports.createTemplate = function* () {
  const loginUser = this.session.loginUser;
  const cluster = this.params.cluster;
  const body = this.request.body;
  const api = apiFactory.getApi(loginUser);
  const result = yield api.templates.updateBy(['helm', 'clusters', cluster], null, body);
  this.body = result;
}

// get template list
exports.getTemplateList = function* () {
  const loginUser = this.session.loginUser;
  const query = this.query;
  const api = apiFactory.getApi(loginUser);
  const result = yield api.templates.getBy(['helm'], query);
  const data = []
  if (result.data && result.data.data) {
    for (let [key, value] of Object.entries(result.data.data)) {
      data.push({
        name: key,
        versions: value,
      })
    }
    result.data.data = data
  }
  this.body = result;
}

// delete template
exports.deleteTemplate = function* () {
  const loginUser = this.session.loginUser;
  const name = this.params.name;
  const version = this.params.version;
  const api = apiFactory.getApi(loginUser);
  const result = yield api.templates.deleteBy(['helm', name, 'versions', version]);
  this.body = result;
}

// get template detail
exports.getTemplateDetail = function* () {
  const loginUser = this.session.loginUser;
  const name = this.params.name;
  const version = this.params.version;
  const api = apiFactory.getApi(loginUser);
  const result = yield api.templates.getBy(['helm', name, 'versions', version]);
  this.body = result;
}

// deploy template check
exports.deployTemplateCheck = function* () {
  const loginUser = this.session.loginUser;
  const cluster = this.params.cluster;
  const name = this.params.name;
  const version = this.params.version;
  const api = apiFactory.getApi(loginUser);
  const result = yield api.templates.getBy(['helm', name, 'versions', version, 'clusters', cluster]);
  this.body = result;
}

// deploy template
exports.deployTemplate = function* () {
  const loginUser = this.session.loginUser;
  const name = this.params.name;
  const version = this.params.version;
  const cluster = this.params.cluster;
  const body = this.request.body;
  const api = apiFactory.getApi(loginUser);
  const result = yield api.templates.createBy(['helm', name, 'versions', version, 'clusters', cluster], null, body);
  this.body = result;
}

// template name check
exports.templateNameCheck = function* () {
  const loginUser = this.session.loginUser;
  const name = this.params.name;
  const api = apiFactory.getApi(loginUser);
  const result = yield api.templates.getBy(['helm', name]);
  this.body = result;
}
