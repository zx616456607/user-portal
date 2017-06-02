/*
* Licensed Materials - Property of tenxcloud.com
* (C) Copyright 2017 TenX Cloud. All Rights Reserved.
*/

/* Util classes for harbor registry API
 * Document reference: https://github.com/vmware/harbor
 *
 * v0.1 - 2017-06-02
 * @author Wang Lei
*/

var logger = require('../../utils/logger').getLogger('harborAPIs');
var request = require('request');
var async = require('async');
var registryConfigLoader = require('../registryConfigLoader')

// Used to cache basic auth info of each user
var basicAuthCache = []
/*
 * Docker registry APIs
 */
function HarborAPIs(registryConfig, authInfo) {
  if (registryConfig) {
    this.registryConfig = registryConfig
  } else {
    // Get registry config from registry loader
    this.registryConfig = registryConfigLoader.GetRegistryConfig()
  }
  this.authInfo = authInfo
}

HarborAPIs.prototype.searchProjects = function (query, callback) {
  var method = "searchProjects";
  logger.debug(method, "Search harbor projects and repositories");

  // If no callback, then will use the 1st parameter as callback, so we can do search all by default
  var requestUrl = this.getAPIPrefix() + "/search";
  if (!callback) {
    callback = query
  } else {
    // Matching all q/page/n to do the search
    if (query) {
      requestUrl += "?q=" + query
    }
  }
  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback);
};


HarborAPIs.prototype.sendRequest = function (requestUrl, httpMethod, data, callback) {
  var method = "sendRequest";
  logger.info(method, "Sending request: " + requestUrl);
  var requestAction = request.get;
  data = (data == null ? "" : data)
  if (httpMethod == 'POST') {
    requestAction = request.post;
  } else if (httpMethod == 'PUT') {
    requestAction = request.put;
  } else if (httpMethod == 'DELETE') {
    requestAction = request.del;
  }
  logger.info(method, this.getAuthorizationHeader());
  logger.debug(method, data);
  requestAction({
    url: requestUrl,
    json: true,
    body: data,
    headers: this.getAuthorizationHeader()
  }, function (err, resp, body) {
    if (err) {
      logger.error(method, err);
      callback(err, 500, body);
      return;
    }
    if (callback) {
      var statusCode = resp ? resp.statusCode : 200;
      if (!resp) {
        logger.error("No response? " + resp);
      }
      callback(err, resp.statusCode, body);
    }
  });
};

/*
For registry v2 extension service
*/
HarborAPIs.prototype.getAPIPrefix = function () {
  var APIPrefix = this.registryConfig.url + '/api'
  return APIPrefix
}

HarborAPIs.prototype.getAuthorizationHeader = function () {
  return {
    'Authorization': 'Basic ' + this.authInfo
  }
}

module.exports = HarborAPIs;
