/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Registry factory
 *
 * v0.1 - 2016-10-10
 * @author Zhangpc
 */
'use strict'
const registryAPIs = require('../registry/lib/registryAPIs')
const markdown     = require('markdown-it')()
const logger       = require('../utils/logger.js').getLogger("tenx_registry")

exports.getPublicImages = function (username) {
  const registry = new registryAPIs()
  if (username) {
    username = username.toLowerCase()
  }
  return new Promise(function (resolve, reject) {
    registry.getRepositories(username, null, function (statusCode, data, err) {
      if (err) {
        reject(err)
        return
      }
      if (statusCode > 300) {
        logger.error('Failed to get public repositories -> ' + statusCode)
        err = new Error('Failed to get public repositories')
        err.status = statusCode
        reject(err)
        return
      }
      resolve(data.results)
    })
  })
}

exports.getImageTags = function (username, imageFullName) {
  const registry = new registryAPIs()
  if (username) {
    username = username.toLowerCase()
  }
  return new Promise(function (resolve, reject) {
    registry.getTagsV2(username, imageFullName, function (statusCode, tags, err) {
      if (err) {
        reject(err)
        return
      }
      if (statusCode > 300) {
        logger.error('Failed to get image tags -> ' + statusCode)
        err = new Error('Failed to get image tags')
        err.status = statusCode
        reject(err)
        return
      }
      resolve(tags)
    })
  })
}

exports.getImageConfigs = function (username, imageFullName, tag) {
  const registry = new registryAPIs()
  if (username) {
    username = username.toLowerCase()
  }
  return new Promise(function (resolve, reject) {
    registry.getImageJsonInfoV2(username, imageFullName, tag, function (statusCode, configs, err) {
      if (err) {
        reject(err)
        return
      }
      if (statusCode > 300) {
        logger.error('Failed to get image configs -> ' + statusCode)
        err = new Error('Failed to get image configs')
        err.status = statusCode
        reject(err)
        return
      }
      var result = _formatImageInfo(JSON.parse(configs.configInfo), imageFullName, tag)
      result.sizeInfo = configs.sizeInfo
      resolve(result)
    })
  })
}

exports.getImageInfo = function(username, imageFullName) {
  const registry = new registryAPIs()
  if (username) {
    username = username.toLowerCase()
  }
  return new Promise(function (resolve, reject) {
    registry.getImageInfo(username, imageFullName, function (statusCode, imageInfo, err) {
      statusCode = parseInt(statusCode)
      if (err) {
        reject(err)
        return
      }
      if (statusCode > 300) {
        // Indicate whether the current user is the owner
        logger.error("Failed to get image information -> " + statusCode)
        err = new Error('Failed to get image info , dockerfile: ' + imageInfo)
        err.status = statusCode
        reject(err)
        return
      }
      if (imageInfo && imageInfo.contributor == username) {
        imageInfo.isOwner = true
      }
      if (imageInfo.detail) {
        imageInfo.detailMarkdown = markdown.render(imageInfo.detail)
      } else {
        imageInfo.detailMarkdown = imageInfo.detail
      }
      if (!imageInfo.dockerfile) {
        imageInfo.dockerfile = '';
      }
      resolve(imageInfo)
    })
  })
}

/*
Service to get the repostories for specified user including private repositories
*/
exports.getPrivateRepositories = function(username, showDetail) {
  var registry = new registryAPIs()
  if (username) {
    username = username.toLowerCase()
  }
  return new Promise(function (resolve, reject) {
    registry.getPrivateRepositories(username, showDetail, function(statusCode, respositories, err) {
      if (err) {
        reject(err)
      }
      if (statusCode < 300) {
        logger.debug('getPrivateRepositories', 'Return my repositories: ' + JSON.stringify(respositories));
        resolve(respositories.results);
      } else {
        logger.error("Failed to get my repositories -> " + statusCode);
        err = 'Failed to get my repositories: ' + respositories;
        reject(err)
      }
    })
  })
}

/*
Service to get the repostories for specified user including private repositories
*/
exports.getFavouriteRepositories = function(username, showDetail) {
  var registry = new registryAPIs()
  if (username) {
    username = username.toLowerCase()
  }
  return new Promise(function (resolve, reject) {
    registry.getMyfavouritesRepos(username, showDetail, function(statusCode, respositories, err) {
      if (err) {
        reject(err)
      }
      if (statusCode < 300) {
        logger.info('getFavouriteRepositories', 'Return my favourite repositories: ' + JSON.stringify(respositories));
        resolve(respositories.results);
      } else {
        logger.error("Failed to get my repositories -> " + statusCode);
        err = 'Failed to get my repositories: ' + respositories;
        reject(err)
      }
    })
  })
}

function _formatImageInfo(imageInfo, imageName, tag) {
  var image = {}
  if (!imageInfo) {
    return image
  }
  if (imageInfo.id) {
    image.id = imageInfo.id
  }
  if (imageName) {
    image.name = imageName
  }
  if (tag) {
    image.tag = tag
  }
  if (imageInfo.os) {
    image.os = imageInfo.os
  }
  if (imageInfo.docker_version) {
    image.docker_version = imageInfo.docker_version
  }
  if (imageInfo.config) {
    if (imageInfo.config.ExposedPorts) {
      image.containerPorts = _getValueName(imageInfo.config.ExposedPorts)
    }
    if (imageInfo.config.Volumes) {
      image.mountPath = _getValueName(imageInfo.config.Volumes)
    }
    if (imageInfo.config.Env) {
      image.defaultEnv = imageInfo.config.Env
    }
    image.cmd = imageInfo.config.Cmd
    image.entrypoint = imageInfo.config.Entrypoint
  }
  return image
}

function _getValueName(Obj) {
  var nameArray = []
  if (!Obj || typeof Obj !== 'object') {
    return nameArray
  }
  for (let valueName in Obj) {
    nameArray.push(valueName)
  }
  return nameArray
}