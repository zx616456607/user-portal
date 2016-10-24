/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
*/

/* Utility for docker registry v2 API
 * Document reference: https://docs.docker.com/registry/spec/api/
 *
 * 2016-10-20
 * @author Wang Lei
*/
'use strict'
var request = require('request')
var async   = require('async')
var logger  = require('../utils/logger.js').getLogger("docker_registry")

const Catalog_Scope = 'registry:catalog:*'
const Repository_Scope_Prefix = 'repository'

/*
 * Docker registry APIs
 */
function SpecRegistryAPIs(registryConfig) {
  if (!registryConfig) {
    throw "No registry configuration specified."
  }
  this.registryConfig = registryConfig
}

/*
List repositories
/v2/_catalog?n=<integer> API
*/
SpecRegistryAPIs.prototype.getCatalog = function () {
  var method = "getCatalog"
  // TODO: Refresh token everytime for now, do cache later
  var self = this
  return new Promise(function (resolve, reject) {
    self.refreshToken(Catalog_Scope, function(statusCode, result) {
      if (statusCode === 200) {
        var catalogURL = self.registryConfig.server +"/v2/_catalog"
        self.sendRequest(catalogURL, self.getBearerHeader(result), null, function(statusCode, result) {
          logger.debug(method, "Catalog status code: " + statusCode)
          logger.debug(method, 'Catalog body: ' + JSON.stringify(result))
          if (statusCode === 200) {
            resolve({"code": statusCode, "result": result})
          } else {
            reject({"code": statusCode, "result": result})
          }
        })
      } else {
        reject({"code": statusCode, "result": result})
      }
    })
  })
}
/*
List image tags
/v2/<name>/tags/list API
*/
SpecRegistryAPIs.prototype.getImageTags = function (imageName) {
  var method = "getImageTags"
  // TODO: Refresh token everytime for now, do cache later
  var self = this
  return new Promise(function (resolve, reject) {
    self.refreshToken(Repository_Scope_Prefix + ":" + imageName + ":pull", function(statusCode, result) {
      if (statusCode === 200) {
        var tagsURL = self.registryConfig.server +"/v2/" + imageName + '/tags/list'
        self.sendRequest(tagsURL, self.getBearerHeader(result), null, function(statusCode, result) {
          logger.debug(method, "Tags status code: " + statusCode)
          logger.debug(method, 'Tags body: ' + JSON.stringify(result))
          if (statusCode === 200) {
            resolve({"code": statusCode, "result": result})
          } else {
            reject({"code": statusCode, "result": result})
          }
        })
      } else {
        reject({"code": statusCode, "result": result})
      }
    })
  })
}

/*
Get 1st layer of specified image & tag as the config
/v2/<name>/manifests/<reference> API
*/
SpecRegistryAPIs.prototype.getImageTagInfo = function (imageName, tag) {
  var method = "getImageTagInfo"
  // TODO: Refresh token everytime for now, do cache later
  var self = this
  return new Promise(function (resolve, reject) {
    self.refreshToken(Repository_Scope_Prefix + ":" + imageName + ":pull", function(statusCode, result) {
      if (statusCode === 200) {
        var tagsURL = self.registryConfig.server +"/v2/" + imageName + '/manifests/' + tag
        self.sendRequest(tagsURL, self.getBearerHeader(result), null, function(statusCode, result) {
          logger.debug(method, "Tag config status code: " + statusCode)
          logger.debug(method, 'Tag config body: ' + JSON.stringify(result))
          if (statusCode === 200) {
            resolve({"code": statusCode, "result": result.history[0].v1Compatibility})
          } else {
            reject({"code": statusCode, "result": result})
          }
        })
      } else {
        reject({"code": statusCode, "result": result})
      }
    })
  })
}

/*
Get 1st layer of specified image & tag as the config
/v2/<name>/manifests/<reference> API
*/
SpecRegistryAPIs.prototype.getImageTagSize = function (imageName, tag) {
  var method = "getImageTagInfo"
  // TODO: Refresh token everytime for now, do cache later
  var self = this
  return new Promise(function (resolve, reject) {
    self.refreshToken(Repository_Scope_Prefix + ":" + imageName + ":pull", function(statusCode, result) {
      if (statusCode === 200) {
        var tagsURL = self.registryConfig.server +"/v2/" + imageName + '/manifests/' + tag
        self.sendRequest(tagsURL, self.getBearerHeader(result,
          { "Accept": "application/vnd.docker.distribution.manifest.v2+json"}), null, function(statusCode, result) {
          logger.debug(method, "Tag size status code: " + statusCode)
          logger.debug(method, 'Tag size body: ' + JSON.stringify(result))
          if (statusCode === 200) {
            var size = 0
            result.layers.forEach(function(layer) {
              size += layer.size
            })
            var returnResult = {
              "layerSize": result.layers.length,
              "imageSize": size
            }
            resolve({"code": statusCode, "result": returnResult})
          } else {
            reject({"code": statusCode, "result": result})
          }
        })
      } else {
        reject({"code": statusCode, "result": result})
      }
    })
  })
}
/*
Refresh token used to authorize with docker registry
*/
SpecRegistryAPIs.prototype.refreshToken = function (scope, callback) {
  var method = "refreshToken"
  if (!this.registryConfig.password || this.registryConfig.password === "") {
    // Not password, so skip the token exchange
    callback(200, "Skip the token refresh step.")
    return
  }
  var serviceHost = this.registryConfig.server.replace("http://", "").replace("https://", "")
  var exchangeURL = this.registryConfig.authServer + "?account=" + this.registryConfig.username + "&scope=" + scope +"&service=" + serviceHost

  logger.debug(method, "Request url: " + exchangeURL)
  this.sendRequest(exchangeURL, this.getBasicAuthHeader(), null, function(statusCode, body) {
    logger.debug(method, "Refresh token Status code: " + statusCode)
    logger.debug(method, 'Refresh token body: ' + JSON.stringify(body))
    if (statusCode === 200) {
      callback(statusCode, body.token)
    } else {
      callback(statusCode, body)
    }
  })
}

SpecRegistryAPIs.prototype.getBasicAuthHeader = function () {
  var authHeader = {
    'Authorization': 'Basic ' + Buffer(this.registryConfig.username + ':' + this.registryConfig.password).toString('base64')
  }
  return authHeader
}

SpecRegistryAPIs.prototype.getBearerHeader = function (token, otherHeader) {
  var authHeader = {
    'Authorization': 'Bearer ' + token
  }
  if (otherHeader) {
    Object.keys(otherHeader).forEach(function(key) {
      var value = otherHeader[key]
      authHeader[key] = value
    })
  }
  return authHeader
}

SpecRegistryAPIs.prototype.sendRequest = function (requestUrl, authHeader, data, callback) {
  var method = "sendRequest"

  logger.info(method, "Sending request: " + requestUrl)
  // Only support 'GET' for now
  var requestAction = request.get
  data = (data == null ? "" : data)

  logger.debug(method, data)
  requestAction({
    url: requestUrl,
    json: true,
    body: data,
    headers: authHeader
  }, function (err, resp, body) {
    if (err) {
      logger.error(method, err)
      callback(500, body, err)
      return
    }
    if (callback) {
      var statusCode = resp ? resp.statusCode : 200
      if (!resp) {
        logger.error("No response? " + resp)
      }
      callback(resp.statusCode, body)
    }
  })
}

module.exports = SpecRegistryAPIs