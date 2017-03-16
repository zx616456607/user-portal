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
const logger  = require('../utils/logger').getLogger('registryConfigLoader');
const apiFactory = require('../services/api_factory')

var registryLocalStorage = 'INIT_STATE'

// Initialize it at server startup, wait for 5 seconds
setTimeout(function() {
  GetRegistryConfig(function(err, config) {
    if (!err) {
      logger.info("Registry configuration loaded: " + config.protocol + "://" + config.host + ":" + config.port)
    }
  })
}, 2000)

// Get registry configuration from api service
function GetRegistryConfig(callback) {
  if (registryLocalStorage != 'INIT_STATE') {
    return registryLocalStorage
  }
  // No user info needed
  // const spi = apiFactory.getTenxSysSignSpi({})
  // spi.tenxregistries.get(null, function(err, result) {
  //   if (!err) {
  //     registryLocalStorage = result.data
  //     if (!registryLocalStorage || !registryLocalStorage.host) {
  //       logger.warn("No valid tenxcloud registry configured, should check the configuration in the database.")
  //     }
  //     // It's a global configuration
  //     registryLocalStorage.globalConfigured = true
  //     callback && callback(null, result.data)
  //   } else {
  //     registryLocalStorage = 'FAIL_TO_LOAD'
  //     if (err.statusCode == 404) {
  //       logger.warn("No global tenxcloud hub configured.")
  //     } else {
  //       logger.error("Failed to get registry config from api service: " + JSON.stringify(err))
  //     }
  //     callback && callback(err, result)
  //   }
  // })
   registryLocalStorage = global.globalConfig.registryConfig
   registryLocalStorage.globalConfigured = true
   if (!registryLocalStorage || !registryLocalStorage.host) {
        logger.warn("No valid tenxcloud registry configured, should check the configuration in the database.")
   }
   if(callback) {
     callback(global.globalConfig.registryConfig)
   }
}
exports.GetRegistryConfig = GetRegistryConfig
