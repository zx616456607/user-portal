/*
* Licensed Materials - Property of tenxcloud.com
* (C) Copyright 2017 TenX Cloud. All Rights Reserved.
*/

/* Util classes for harbor registry API
 * Document reference: https://github.com/vmware/harbor
 *
 * v0.1 - 2018-01-19
 * @author YangYuBiao
*/
'use strict'

const configLoader = require('../registryConfigLoader')
const urllib = require('urllib')
const url = require('url')
const logger = require('../../utils/logger').getLogger(`dockerhub/request`)
var tenx_registry = require('../../services/tenx_registry')
const merge = require('lodash/merge')
const DEFAULT_TIMEOUT = 1000 * 60


var TokenCacheMgr = []
var TokenExpiredTime = 600 // seconds
const DockerHubDomain = 'https://hub.docker.com'
const DockerRegistry = 'registry.docker.io'
const Repository_Scope_Prefix = 'repository'

const _isSuccess = (statusCode) => statusCode < 300

module.exports = class DockerHub {
  constructor(config) {
    if (config) {
      this.config = config
    }
  }

  getDockerHubConfig(user, id) {
    this.config = configLoader.GetRegistryConfig(user, id)
    return this.config
  }

  searchDockerImage(query, page, page_size) {
    if (!page_size) {
      page_size = 10000
    }
    if(!page) {
      page = 1
    }
    const path = `/v2/search/repositories?query=${query}&page=${page}&page_size=${page_size}`
    return this.sendRequest(this.getRequestUrl(path, DockerHubDomain), {
      method: "GET"
    })
  }

  getImageList(page_size) {
    if (!page_size) {
      page_size = 1000
    }
    const path = `/v2/repositories/${this.config.username}/?page_size=${page_size}`
    return this.sendRequest(this.getRequestUrl(path, DockerHubDomain), {
      method: "GET"
    })
  }
  getImageTags(imageName, page_size) {
    if (!page_size) {
      page_size = 1000
    }
    const path = `/v2/repositories/${imageName}/tags/?page_size=${page_size}`
    return this.sendRequest(this.getRequestUrl(path, DockerHubDomain), {
      method: "GET"
    })
  }
  getImageTagInfo (imageName, tag, isGetManifest) {
    var method = "getImageTagInfo"
    // TODO: Refresh token everytime for now, do cache later
    var self = this
    return new Promise(function (resolve, reject) {
      self.refreshToken(Repository_Scope_Prefix + ":" + imageName + ":pull", function(statusCode, result) {
        if (statusCode === 200) {
          var token = result
          var tagsURL = self.config.server +"/v2/" + imageName + '/manifests/' + tag
          self.sendRequest(tagsURL, self.getBearerHeader(token), function(statusCode, result) {
            logger.debug(method, "Tag config status code: " + statusCode)
            logger.debug(method, 'Tag config body: ' + JSON.stringify(result))
            if (statusCode === 200) {
              var configInfo = {}
              if(isGetManifest) {
                resolve({"code": statusCode, "result": result})
                return
              }
              if (result && result.history) {
                configInfo = result.history[0].v1Compatibility
              }
              self.sendRequest(tagsURL, self.getBearerHeader(token,
                { "Accept": "application/vnd.docker.distribution.manifest.v2+json"}), function(statusCode, layerInfo) {
                logger.debug(method, "Tag size status code: " + statusCode)
                logger.debug(method, 'Tag size body: ' + JSON.stringify(result))
                if (statusCode === 200) {
                  var size = 0
                  var length = 0
                  var result = {}
                  // Customize the tag config information before use it
                  result.configInfo = tenx_registry.FormatImageInfo(JSON.parse(configInfo), imageName, tag)
                  if (layerInfo && layerInfo.layers) {
                    layerInfo.layers.forEach(function(layer) {
                      size += layer.size
                    })
                    length = layerInfo.layers.length
                  }
                  result.sizeInfo = {
                    "layerLength": length,
                    "totalSize": size
                  }
                  resolve({"code": statusCode, "result": result})
                } else {
                  reject({"code": statusCode, "result": result})
                }
              })
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
  getDockerHubNamespaces() {
    const path = `/v2/repositories/namespaces/`
    return this.sendRequest(this.getRequestUrl(path, DockerHubDomain), {
      method: "GET"
    })
  }

  sendRequest(url, options, callback) {
    const defaultOptions = {
      headers: {
        Authorization: "JWT " + this.config.token
      },
      dataType: "json",
      contentType: "json",
      timeout: DEFAULT_TIMEOUT
    }
    if (options) {
      options = merge(defaultOptions, options)
    }
    logger.info(`<-- [${options.method || 'GET'}] ${url}`)
    logger.info(`--> [options]`, options)
    if(callback) {
      urllib.request(url, options, (err, data, res) => {
        if (err) {
          err.statusCode = res.statusCode
          return callback(res.statusCode, err)
        }
        if (_isSuccess(res.statusCode)) {
          data.statusCode = res.statusCode
          return callback(200, data)
        }
        const e = new Error("请求镜像仓库错误，错误代码：" + res.statusCode)
        e.status = res.statusCode
        callback(e.status, e)
      })
      return
    }
    return urllib.request(url, options).then(
      (result) => {
        logger.debug(`--> [${options.method || 'GET'}] ${url}`)
        logger.debug(`api result: ${JSON.stringify(result.data)}`)

        if (options.returnAll) {
          return result
        }
        if (_isSuccess(result.res.statusCode)) {
          // data maybe null
          if (!result.data) {
            result.data = {}
          }
          result.data.statusCode = result.res.statusCode
          return result.data
        }
        const err = new Error("请求镜像仓库错误，错误代码：" + result.res.statusCode)
        err.status = result.res.statusCode
        throw err
      },
      (err) => {
        throw err
      }
    )
  }

  refreshToken(scope, callback) {
    var method = "refreshToken"
    if (!this.config.password || this.config.password === "") {
      // Not password, so skip the token exchange
      callback(200, "Skip the token refresh step.")
      return
    }
    var self = this
    var exchangeURL = this.config.authServer + "?account=" + this.config.username + "&scope=" + scope +"&service=" + DockerRegistry
    // Use exchangeURL as the key
    if (TokenCacheMgr[exchangeURL]) {
      var timePeriod = new Date() - TokenCacheMgr[exchangeURL].lastRefreshTime
      if (timePeriod/1000 < TokenExpiredTime) {
        logger.info(method, "Using cache...")
        return callback(200, TokenCacheMgr[exchangeURL].lastToken)
      }
    }

    logger.debug(method, "Request url: " + exchangeURL)
     this.sendRequest(exchangeURL, this.getBasicAuthHeader(),function(statusCode, body) {
      logger.debug(method, "Refresh token Status code: " + statusCode)
      logger.debug(method, 'Refresh token body: ' + JSON.stringify(body))
      if (statusCode === 200) {
        // Add to cache
        TokenCacheMgr[exchangeURL] = {
          lastRefreshTime: new Date(),
          lastToken: body.token
        }
        callback(statusCode, body.token)
      } else {
        callback(statusCode, body)
      }
    })
  }

  getBasicAuthHeader () {
    var authHeader = {
      headers: {
        'Authorization': 'Basic ' + Buffer(this.config.username + ':' + this.config.password).toString('base64')
      }
    }
    return authHeader
  }

  getBearerHeader (token, otherHeader) {
    var authHeader = {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }
    if (otherHeader) {
      Object.keys(otherHeader).forEach(function(key) {
        var value = otherHeader[key]
        authHeader[key] = value
      })
    }
    return authHeader
  }

  getRequestUrl(path, domain) {
    if(domain) {
      return new url.URL(path, domain).toString()
    }
    return new url.URL(path, this.config.server).toString()
  }

}