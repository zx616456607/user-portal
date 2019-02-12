/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * v0.1 - 2016-11-04
 * @author Lei
 */

/*
 *
 * Devops config file
 */
'use strict'
const env = process.env

const config = {
  "protocol": env.DEVOPS_PROTOCOL || "http",
  "host": env.DEVOPS_HOST || "enterprise.tenxcloud.com:48080",
  "external_protocol": env.DEVOPS_EXTERNAL_PROTOCOL || "https",
  "external_host": env.DEVOPS_EXTERNAL_HOST || "enterprise.tenxcloud.com:48080",
  "statusPath": "/stagebuild/status",
  "logPath": "/stagebuild/log"
}

module.exports = config
