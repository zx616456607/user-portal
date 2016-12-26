/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Registry config file
 *
 * v0.1 - 2016-10-08
 * @author Zhangpc
 */
'use strict'

const env = process.env
/*const config = {
  ext_server: {
    protocol: "http" ,
    host: "192.168.1.113"
  },
  auth_server: {
    protocol: "https" ,
    host: "192.168.1.113:5001"
  },
  user: "admin",
  password: "registry-password"
}*/
const config = {
  "protocol": env.REGISTRY_EXT_SERVER_PROTOCOL || "http",
  "host": env.REGISTRY_EXT_SERVER_HOST || "192.168.1.113",
  "port": env.REGISTRY_EXT_SERVER_PORT || "4081",
  "user": "admin",
  "password": env.REGISTRY_EXT_SERVER_PWD || "registry-password",
  "v2Server": env.REGISTRY_SERVER_HOST || "192.168.1.113",
  "v2AuthServer": env.REGISTRY_AUTH_SERVER_URL || "https://192.168.1.113:5001",
  "v2ServerProtocol": env.REGISTRY_SERVER_PROTOCOL || "http"
}

module.exports = config