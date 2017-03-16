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
  "host": env.DEVOPS_HOST || "192.168.1.103:38090",
  "external_protocol": env.DEVOPS_EXTERNAL_PROTOCOL || "https",
  "external_host": env.DEVOPS_EXTERNAL_HOST || "cicdv2.tenxcloud.com",
  "statusPath": "/stagebuild/status",
  "logPath": "/stagebuild/log"
}

module.exports = config
