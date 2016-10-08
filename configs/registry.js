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

const config = {
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
}

module.exports = config