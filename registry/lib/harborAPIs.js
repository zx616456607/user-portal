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
'use strict'


var logger = require('../../utils/logger').getLogger('harborAPIs');
const utils = require('../../utils')
var request = require('request');
var async = require('async');
var queryString = require('querystring')
var _ = require('lodash')
var registryConfigLoader = require('../registryConfigLoader')

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
  var requestUrl = this.getAPIPrefix() + "/repositories/search";
  if (!callback) {
    callback = query
  } else {
    // Matching all q/page/n to do the search
    if (query) {
      requestUrl += `?${utils.toQuerystring(query)}`
    }
  }
  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback);
};

HarborAPIs.prototype.getStatistics = function (query, callback) {
  var method = "getStatistics"
  logger.debug(method, "Get statistics of projects and repositories")

  // If no callback, then will use the 1st parameter as callback, so we can do search all by default
  var requestUrl = this.getAPIPrefix() + "/statistics"
  logger.debug(method, "Request url: " + requestUrl)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

// [post] /replications
HarborAPIs.prototype.copyReplications = function (body, callback) {
  const url = `${this.getAPIPrefix()}/replications`
  this.sendRequest(url, 'POST', body, callback)
}

// [put] /jobs/replication
HarborAPIs.prototype.updateReplicationJobs = function (body, callback) {
  const url = `${this.getAPIPrefix()}/jobs/replication`
  this.sendRequest(url, 'PUT', body, callback)
}

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

// [DELETE] /policies/replication/{id}
HarborAPIs.prototype.deleteReplicationPolicy = function (id, callback) {
  const url = `${this.getAPIPrefix()}/policies/replication/${id}`
  this.sendRequest(url, 'DELETE', null, callback)
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
  this.sendRequest(url, 'POST', target, { timeout: 10 * 1000 }, callback)
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

HarborAPIs.prototype.deleteRepository = function (name, callback) {
  const method = 'deleteRepository'
  logger.debug(method, `delete repo`)
  const requestUrl = `${this.getAPIPrefix()}/repositories/${name}`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'DELETE', null, callback)
}

HarborAPIs.prototype.deleteRepositoryTag = function (project, repository, tag, callback) {
  const url = `${this.getAPIPrefix()}/repositories/${project}/${repository}/tags/${tag}`
  this.sendRequest(url, 'DELETE', null, callback)
}

HarborAPIs.prototype.getRepositoriesTags = function (name, callback, is_detail) {
  const method = 'getRepositoriesTags'
  logger.debug(method, `Get Repos tags`)
  const requestUrl = `${this.getAPIPrefix()}/repositories/${name}/tags?detail=${is_detail}`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

// [PUT] repositories/:user/:projectname/maxtag
HarborAPIs.prototype.setRepositoriesMaxTag = function (name, body, callback) {
  const url = `${this.getAPIPrefix()}/repositories/${name}/maxtag`
  this.sendRequest(url, 'PUT', body, callback)
}
// POST /api/repositories/:project/:rest/tags/:tag/labels
HarborAPIs.prototype.setRepositoriesTagLabel = function (name, tagname, body, callback) {
  const url = `${this.getAPIPrefix()}/repositories/${name}/tags/${tagname}/labels`
  this.sendRequest(url, 'POST', body, callback)
}
// DELETE /api/repositories/:project/:rest/tags/:tag/labels/:id
HarborAPIs.prototype.delRepositoriesTagLabel = function (name, tagname, id, callback) {
  const url = `${this.getAPIPrefix()}/repositories/${name}/tags/${tagname}/labels/${id}`
  this.sendRequest(url, 'DELETE', null, callback)
}

HarborAPIs.prototype.getRepositoriesManifest = function (name, tag, callback) {
  const method = 'getRepositoriesManifest'
  logger.debug(method, `Get Repos tags`)
  const requestUrl = `${this.getAPIPrefix()}/repositories/${name}/tags/${tag}/manifest`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

// [POST] /api/repositories/scanAll
HarborAPIs.prototype.scanRepositoriesAllImages = function (callback) {
  const url = `${this.getAPIPrefix()}/repositories/scanAll`
  this.sendRequest(url, 'POST', null, callback)
}

// [POST] /api/repositories/:repo_name/tags/:tag/scan
HarborAPIs.prototype.scanRepositoriesImage = function (repoName, tagname, callback) {
  logger.debug(`repo name: ${repoName}, tag name: ${tagname}`)
  const url = `${this.getAPIPrefix()}/repositories/${repoName}/tags/${tagname}/scan`
  this.sendRequest(url, 'POST', null, callback)
}

// [GET] /api/repositories/:repo_name/tags/:tag/vulnerability/details
HarborAPIs.prototype.getVulnerabilityImage = function (repoName, tagname, callback) {
  logger.debug(`repo name: ${repoName}, tag name: ${tagname}`)
  const url = `${this.getAPIPrefix()}/repositories/${repoName}/tags/${tagname}/vulnerability/details`
  this.sendRequest(url, 'GET', null, callback)
}

// TODO: scope=g 是取全局标签
// scope=p 是取项目内标签，取项目内标签还要跟project_id=2，传具体 project id
// 全局的或项目内的，如果 query 参数再加个 name=xxxx, 是按名称搜索，也能起到检查是否存在的作用，不存在，返回的是个空数组

/*
{ id: 4,  // id 是有用的，给镜像设标签的时候要用到这个 id
  name: 'suo',
  description: 'descriptiondescription',
  color: '#0065AB',
  scope: 'g',
  project_id: 0,
  creation_time: '2018-07-13T02:18:27Z',
  update_time: '2018-07-16T04:19:07Z' }
*/

// http://192.168.1.232/api/labels?scope=g&name=lalala
// http://192.168.1.232/api/labels?scope=p&project_id=2
// http://192.168.1.232/api/labels?scope=p&project_id=2&name=project
HarborAPIs.prototype.getLabels = function (query, callback) {
  const url = `${this.getAPIPrefix()}/labels${encodeQueryString(query)}`
  this.sendRequest(url, 'GET', null, callback)
}

// TODO: 就是把取到的标签的结构，把要改的字段值改了之后，在把结构给 put 回来
HarborAPIs.prototype.updateLabel = function (id, label, callback) {
  const url = `${this.getAPIPrefix()}/labels/${id}`
  this.sendRequest(url, 'PUT', label, callback)
}

// TODO: 删除标签
HarborAPIs.prototype.deleteLabel = function (id, callback) {
  const url = `${this.getAPIPrefix()}/labels/${id}`
  this.sendRequest(url, 'DELETE', null, callback)
}

// TODO: 创建标签，结构里的字段，看字面已经能知道什么意思了。需要注意的是 scope，g 是全局的，p 是项目的，全局的 project_id 是 0，项目的传真实的 project id

/*
{ name: 'lalala',
  description: 'lalala',
  color: '#61717D',
  scope: 'g',
  project_id: 0 }

{ name: 'project',
  description: 'project',
  color: '#BE90D6',
  scope: 'p',
  project_id: 2 }
*/

HarborAPIs.prototype.createLabel = function (label, callback) {
  const url = `${this.getAPIPrefix()}/labels`
  this.sendRequest(url, 'POST', label, callback)
}

/*----------------log start---------------*/

HarborAPIs.prototype.getLogs = function (query, callback) {
  const method = 'getLog'
  logger.debug(method, 'Get user recent log')
  let requestUrl = `${this.getAPIPrefix()}/logs`
  if (typeof query == 'function') {
    callback = query
    query = null
  } else {
    if (query) {
      requestUrl += `?${queryString.stringify(query)}`
    }
  }
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

HarborAPIs.prototype.getProjectLogs = function (projectID, query, data, callback) {
  const method = 'getProjectLogs'
  logger.debug(method, `Get project logs`)
  let requestUrl = `${this.getAPIPrefix()}/projects/${projectID}/logs`
  if (typeof projectID != 'string') {
    const err = new Error('project is require')
    return callback(err)
  }
  if (typeof query == 'function') {
    callback = query
    query = null
  }
  if (typeof data == 'function') {
    callback = data
    data = null
  }
  if (query) {
    requestUrl += '?'
    if (!!query.operation) {
      let temp = ''
      query.operation.split(',').map(item => {
        temp += '&operation=' + item.toLocaleLowerCase()
      })
      delete query.operation
      requestUrl += `?${queryString.stringify(query)}${temp}`
    } else {
      requestUrl += `?${queryString.stringify(query)}`
    }
  }
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', data, callback)
}

/*----------------log end---------------*/

/*----------------systeminfo start---------------*/

HarborAPIs.prototype.getSystemInfo = function (callback) {
  const method = 'getSystemInfo'
  logger.debug(method, `Get SystemInfo`)
  const requestUrl = `${this.getAPIPrefix()}/systeminfo`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

HarborAPIs.prototype.getSystemInfoVolumes = function (callback) {
  const method = 'getSystemInfoVolumes'
  logger.debug(method, `Get SystemInfoVolumes`)
  const requestUrl = `${this.getAPIPrefix()}/systeminfo/volumes`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

HarborAPIs.prototype.getSystemInfoCert = function (callback) {
  const method = 'getSystemInfoCert'
  logger.debug(method, `Get SystemInfoCert`)
  const requestUrl = `${this.getAPIPrefix()}/systeminfo/getcert`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}


/*----------------systeminfo end---------------*/



/*----------------configurations start---------------*/

HarborAPIs.prototype.getConfigurations = function (callback) {
  const method = 'getConfiguratoins'
  logger.debug(method, `Get Configurations`)
  const requestUrl = `${this.getAPIPrefix()}/configurations`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

HarborAPIs.prototype.updateConfigurations = function (data, callback) {
  const method = 'updateConfiguratoins'
  logger.debug(method, `Update Configurations`)
  const requestUrl = `${this.getAPIPrefix()}/configurations`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'PUT', data, callback)
}

HarborAPIs.prototype.resetConfigurations = function (callback) {
  const method = 'resetConfiguratoins'
  logger.debug(method, `Reset Configurations`)
  const requestUrl = `${this.getAPIPrefix()}/configurations/reset`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'POST', null, callback)
}

/*----------------configurations end---------------*/

// [GET] /users/current
HarborAPIs.prototype.getCurrentUser = function (callback) {
  const url = `${this.getAPIPrefix()}/users/current`
  // 10 * 1000, 10sec
  this.sendRequest(url, 'GET', null, { timeout: 10000 }, callback)
}

// [GET] /projects?page=1&page_size=10&page_name=test&is_public=1
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

// [POST] /projects
HarborAPIs.prototype.createProject = function (body, callback) {
  const url = `${this.getAPIPrefix()}/projects`
  this.sendRequest(url, 'POST', body, callback)
}

// [GET] /projects/:project_id
HarborAPIs.prototype.getProjectDetail = function (id, callback) {
  const url = `${this.getAPIPrefix()}/projects/${id}`
  this.sendRequest(url, 'GET', null, callback)
}

// [DELETE] /projects/:project_id
HarborAPIs.prototype.deleteProject = function (id, callback) {
  const url = `${this.getAPIPrefix()}/projects/${id}`
  this.sendRequest(url, 'DELETE', null, callback)
}

// [PUT] /projects/:project_id
HarborAPIs.prototype.updateProject = function (id, body, callback) {
  const url = `${this.getAPIPrefix()}/projects/${id}`
  this.sendRequest(url, 'PUT', body, callback)
}

// [PUT] /projects/:project_id/publicity
HarborAPIs.prototype.updateProjectPublicity = function (id, body, callback) {
  const url = `${this.getAPIPrefix()}/projects/${id}/publicity`
  this.sendRequest(url, 'PUT', body, callback)
}

// [GET] /projects/:project_id/members
HarborAPIs.prototype.getProjectMembers = function (id, query, callback) {
  const url = `${this.getAPIPrefix()}/projects/${id}/members?${utils.toQuerystring(query)}`
  this.sendRequest(url, 'GET', null, callback)
}

// [POST] /projects/:project_id/members
HarborAPIs.prototype.addProjectMember = function (id, body, callback) {
  const url = `${this.getAPIPrefix()}/projects/${id}/members`
  this.sendRequest(url, 'POST', body, callback)
}

// [PUT] /projects/:project_id/members/:user_id
HarborAPIs.prototype.updateProjectMember = function (project_id, user_id, body, callback) {
  const url = `${this.getAPIPrefix()}/projects/${project_id}/members/${user_id}`
  this.sendRequest(url, 'PUT', body, callback)
}

// [DELETE] /projects/:project_id/members/:user_id
HarborAPIs.prototype.deleteProjectMember = function (project_id, user_id, callback) {
  const url = `${this.getAPIPrefix()}/projects/${project_id}/members/${user_id}`
  this.sendRequest(url, 'DELETE', null, callback)
}

// [GET] /repositories
HarborAPIs.prototype.getProjectRepositories = function (query, callback) {
  const url = `${this.getAPIPrefix()}/repositories?${utils.toQuerystring(query)}`
  this.sendRequest(url, 'GET', null, callback)
}

// [GET] /repositories/:name
HarborAPIs.prototype.getRepository = function (name, callback) {
  const url = `${this.getAPIPrefix()}/repositories/${name}`
  this.sendRequest(url, 'GET', null, callback)
}

// [PUT] /repositories/:name
HarborAPIs.prototype.updateRepository = function (name, body, callback) {
  const url = `${this.getAPIPrefix()}/repositories/${name}`
  const headers = {
    'Content-Type': 'application/json',// 'text/plain',
  }
  logger.info("sendRequest", "body: " + body);
  this.sendRequest(url, 'PUT', body, { headers }, callback)
}

// TODO: 给某个镜像设标签，看示例 url 跟函数参数，应该能知道传的参都是什么意思
// http://192.168.1.232/api/repositories/tenx_containers/cluster-autoscaler/tags/v3.0/labels
HarborAPIs.prototype.setImageLabel = function (repository, tag, labelId, callback) {
  const url = `${this.getAPIPrefix()}/repositories/${repository}/tags/${tag}/labels`
  this.sendRequest(url, 'POST', { id: labelId }, callback)
}

HarborAPIs.prototype.sendRequest = function (requestUrl, httpMethod, data, options, callback) {
  var method = "sendRequest";

  if (!callback) {
    callback = options
    options = null
  }
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
  const defaultOptions = {
    url: requestUrl,
    json: true,
    body: data,
    headers: this.getAuthorizationHeader(),
  }

  options = _.merge(defaultOptions, options)

  logger.debug(method, this.getAuthorizationHeader());
  logger.debug(method, data);
  logger.debug(method, options);

  requestAction(options, function (err, resp, body) {
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
      callback(err, statusCode, body, resp.headers);
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
  const query = Object.getOwnPropertyNames(kvs).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(kvs[key])}`).join('&')
  if (query) {
    return '?' + query
  }
  return ''
}

function range(begin, end) {
  const count = end - begin
  return Array.apply(null, Array(count)).map((_, index) => index + begin)
}

function parseAuthParameter(query, parameter) {
  const removeQuote = JSON.parse
  const kv = parameter.split('=')
  const key = kv[0]
  const value = removeQuote(kv[1])
  query[key] = value
  return query
}

function getRequestBearerTokenURL(realm) {
  const removeQuote = JSON.parse
  const params = realm.split(',').map(param => param.trim())
  const authURL = removeQuote(params[0].split('=')[1])
  const query = range(1, params.length).reduce(
    (query, index) => parseAuthParameter(query, params[index]), {})
  return `${authURL}${encodeQueryString(query)}`
}

HarborAPIs.prototype.basicAuthToBearerToken = function (realm, callback) {
  const url = getRequestBearerTokenURL(realm)
  this.sendRequest(url, 'GET', null, callback)
}

HarborAPIs.prototype.getManifest = function (repoName, tag, callback) {
  const registry = this.registryConfig.url
  const url = `${registry}/v2/${repoName}/manifests/${tag}`
  request.get({ url, json: true }, (err, resp, body) => {
    if (resp.statusCode == 401) {
      const realm = resp.headers['www-authenticate']
      this.basicAuthToBearerToken(realm, (err, statusCode, result) => {
        if (err) {
          callback(err, statusCode, result)
        } else {
          const token = result.token
          const headers = { 'Authorization': `Bearer ${token}` }
          request.get({ url, json: true, headers }, (err, resp, body) => {
            callback(err, resp.statusCode, {
              manifest: body,
              headers,
              registry: registry.replace("http://", "").replace("https://", "")
            })
          })
        }
      })
    } else {
      callback(err, resp.statusCode, body)
    }
  })
}

module.exports = HarborAPIs;
