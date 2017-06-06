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
const utils = require('../../utils')
var request = require('request');
var async = require('async');
var queryString = require ('querystring')
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

// [GET] /jobs/replication
HarborAPIs.prototype.getReplicationJobs = function (query, callback) {
  const url = `${this.getAPIPrefix()}/jobs/replication${encodeQueryString(query)}`
  this.sendRequest(url, 'GET', null, callback)
}

// [DELETE] /jobs/replication/{id}
HarborAPIs.prototype.deleteReplicationJob = function (id, callback) {
  const url = `${this.getAPIPrefix()}/jobs/replication/${id}`
  this.sendRequest(url, 'DELETE', null, callback)
}

// [GET] /jobs/replication/{id}/log
HarborAPIs.prototype.getReplicationJobLogs = function (id, callback) {
  const url = `${this.getAPIPrefix()}/jobs/replication/${id}/log`
  this.sendRequest(url, 'GET', null, callback)
}

// [GET] /policies/replication
HarborAPIs.prototype.getReplicationPolicies = function (query, callback) {
  const url = `${this.getAPIPrefix()}/policies/replication${encodeQueryString(query)}`
  this.sendRequest(url, 'GET', null, callback)
}

// [POST] /policies/replication
HarborAPIs.prototype.newReplicationPolicy = function (policy, callback) {
  const url = `${this.getAPIPrefix()}/policies/replication`
  this.sendRequest(url, 'POST', policy, callback)
}

// [GET] /policies/replication/{id}
HarborAPIs.prototype.getReplicationPolicy = function (id, callback) {
  const url = `${this.getAPIPrefix()}/policies/replication/${id}`
  this.sendRequest(url, 'GET', null, callback)
}

// [PUT] /policies/replication/{id}
HarborAPIs.prototype.modifyReplicationPolicy = function (id, policy, callback) {
  const url = `${this.getAPIPrefix()}/policies/replication/${id}`
  this.sendRequest(url, 'PUT', policy, callback)
}

// [PUT] /policies/replication/{id}/enablement  -- { enable: 0 } / { enable: 1 }
HarborAPIs.prototype.enableReplicationPolicy = function (id, enable, callback) {
  const url = `${this.getAPIPrefix()}/policies/replication/${id}/enablement`
  this.sendRequest(url, 'PUT', enable, callback)
}

// [GET] /targets
HarborAPIs.prototype.getReplicationTargets = function (query, callback) {
  const url = `${this.getAPIPrefix()}/targets${encodeQueryString(query)}`
  this.sendRequest(url, 'GET', null, callback)
}

// [POST] /targets
HarborAPIs.prototype.newReplicationTarget = function (target, callback) {
  const url = `${this.getAPIPrefix()}/targets`
  this.sendRequest(url, 'POST', target, callback)
}

// [POST] /targets/ping
HarborAPIs.prototype.pingReplicationTarget = function (target, callback) {
  const url = `${this.getAPIPrefix()}/targets/ping`
  this.sendRequest(url, 'POST', target, callback)
}

// [POST] /targets/{id}/ping
HarborAPIs.prototype.pingReplicationTargetByID = function (id, callback) {
  const url = `${this.getAPIPrefix()}/targets/${id}/ping`
  this.sendRequest(url, 'POST', null, callback)
}

// [PUT] /targets/{id}
HarborAPIs.prototype.modifyReplicationTarget = function (id, target, callback) {
  const url = `${this.getAPIPrefix()}/targets/${id}`
  this.sendRequest(url, 'PUT', target, callback)
}

// [GET] /targets/{id}
HarborAPIs.prototype.getReplicationTarget = function (id, callback) {
  const url = `${this.getAPIPrefix()}/targets/${id}`
  this.sendRequest(url, 'GET', null, callback)
}

// [DELETE] /targets/{id}
HarborAPIs.prototype.deleteReplicationTarget = function (id, callback) {
  const url = `${this.getAPIPrefix()}/targets/${id}`
  this.sendRequest(url, 'DELETE', null, callback)
}

// [GET] /targets/{id}/policies
HarborAPIs.prototype.getReplicationTargetRelatedPolicies = function (id, callback) {
  const url = `${this.getAPIPrefix()}/targets/${id}/policies`
  this.sendRequest(url, 'GET', null, callback)
}

/*----------------log start---------------*/

HarborAPIs.prototype.getLogs = function(query, callback) {
  const method = 'getLog'
  logger.debug(method, 'Get user recent log')
  let requestUrl = `${this.getAPIPrefix()}/logs`
  if(typeof query == 'function') {
    callback = query
    query = null
  } else {
    if(query) {
      requestUrl += `?${queryString.stringify(query)}`
    }
  }
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

HarborAPIs.prototype.getProjectLogs = function(projectID, query, data, callback) {
  const method = 'getProjectLogs'
  logger.debug(method, `Get project logs`)
  let requestUrl = `${this.getAPIPrefix()}/projects/${projectID}/logs/filter`
  if(typeof projectID != 'string') {
    const err = new Error('project is require')
    return callback(err)
  }
  if(typeof query == 'function') {
    callback = query
    query = null
  }
  if(typeof data == 'function') {
    callback = data
    data = null
  }
  if(query) {
    requestUrl += `?${queryString.stringify(query)}`
  }
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'POST', data, callback)
}

/*----------------log end---------------*/

/*----------------systeminfo start---------------*/

HarborAPIs.prototype.getSystemInfo = function(callback) {
  const method = 'getSystemInfo'
  logger.debug(method, `Get SystemInfo`)
  const requestUrl = `${this.getAPIPrefix()}/systeminfo`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

HarborAPIs.prototype.getSystemInfoVolumes = function(callback) {
  const method = 'getSystemInfoVolumes'
  logger.debug(method, `Get SystemInfoVolumes`)
  const requestUrl = `${this.getAPIPrefix()}/systeminfo/volumes`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

HarborAPIs.prototype.getSystemInfoCert = function(callback) {
  const method = 'getSystemInfoCert'
  logger.debug(method, `Get SystemInfoCert`)
  const requestUrl = `${this.getAPIPrefix()}/systeminfo/getcert`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}


/*----------------systeminfo end---------------*/



/*----------------configurations start---------------*/

HarborAPIs.prototype.getConfigurations = function(callback) {
  const method = 'getConfiguratoins'
  logger.debug(method, `Get Configurations`)
  const requestUrl = `${this.getAPIPrefix()}/configurations`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

HarborAPIs.prototype.updateConfigurations = function(data, callback) {
  const method = 'updateConfiguratoins'
  logger.debug(method, `Update Configurations`)
  const requestUrl = `${this.getAPIPrefix()}/configurations`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'PUT', data, callback)
}

HarborAPIs.prototype.resetConfigurations = function(callback) {
  const method = 'resetConfiguratoins'
  logger.debug(method, `Reset Configurations`)
  const requestUrl = `${this.getAPIPrefix()}/configurations/reset`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'POST', null, callback)
}

/*----------------configurations end---------------*/


// [GET] /projects?page=1&page_size=10&page_name=test
HarborAPIs.prototype.getProjects = function (query, callback) {
  var method = "getProjects";
  logger.debug(method, "Get harbor projects");

  // If no callback, then will use the 1st parameter as callback, so we can do search all by default
  var requestUrl = this.getAPIPrefix() + "/projects";
  if (!callback) {
    callback = query
  } else {
    if (query) {
      requestUrl += `?${utils.toQuerystring(query)}`
    }
  }
  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback);
}

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

function encodeQueryString(kvs) {
  return '?' + Object.getOwnPropertyNames(kvs).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(kvs[key])}`).join('&')
}

module.exports = HarborAPIs;
