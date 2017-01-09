/*
* Licensed Materials - Property of tenxcloud.com
* (C) Copyright 2017 TenxCloud. All Rights Reserved.
*/

/*
 * Load registry configuration from API
 * Load configuration at the server startup or at first call, and will cache the config to avoid API call each time
 * v0.1 - 2017-01-07
 * @author Wang Lei
*/
'use strict'
const logger  = require('../utils/logger').getLogger('registry_index');
const apiFactory = require('../services/api_factory')

var registryLocalStorage = ''

// Initialize it at server startup, wait for 5 seconds
var self = this
setTimeout(function() {
  self.GetRegistryConfig(function(err, config) {
    if (!err) {
      logger.info("Registry configuration loaded: " + config.protocol + "://" + config.host + ":" + config.port)
    }
  })
}, 2000)

// Get registry configuration from api service
exports.GetRegistryConfig = function (callback) {
  if (registryLocalStorage != '') {
    return registryLocalStorage
  }
  // No user info needed
  const spi = apiFactory.getTenxSysSignSpi({})
  spi.tenxregistries.get(null, function(err, result) {
    if (!err) {
      registryLocalStorage = result.data
      if (!registryLocalStorage.host) {
        logger.warn("No valid tenxcloud registry configured, should check the configuration in the database.")
      }
      callback && callback(null, result.data)
    } else {
      logger.error("Failed to get registry config from api service: " + JSON.stringify(err))
      callback && callback(err, result)
    }
  })
}

