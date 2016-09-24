/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Tenxcloud API service
 * 
 * v0.1 - 2016-09-12
 * @author Zhangpc
 */
'use strict'
// protocol, host, version, auth, timeout
module.exports = function (config) {
  if (!config.host) {
    const error = new TypeError('host must be provided')
    error.status = 400
    throw error
  }
  if (!config.auth) {
    const error = new TypeError('auth info must be provided')
    error.status = 400
    throw error
  }
  const request = require('./request')(config.protocol, config.host, config.version, config.auth, config.timeout)

  // ~~~~~ PUBLIC

  const Collections = require('./collections')
  const collections = new Collections(request)
  
  // ~ cluster
  this.clusters = collections.create('clusters')
  
  //~ storage
  this.storage = collections.create('storage')

}