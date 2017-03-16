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
  "statusPath": "/stagebuild/status",
  "logPath": "/stagebuild/log"
}

module.exports = config
