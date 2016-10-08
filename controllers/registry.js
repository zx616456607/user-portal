/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Registry controller
 * 
 * v0.1 - 2016-10-08
 * @author Zhangpc
 */
'use strict'

const registryConfig = require('../configs/registry')

exports.getImages = function* () {
  const registry = this.params.registry
  const loginUser = this.session.loginUser
  const config = {
    protocol: registryConfig.ext_server.protocol,
    host: registryConfig.ext_server.host,
    auth: {
      type: 'basic',
      user: registryConfig.user,
      password: registryConfig.password,
    }
  }
  const api = apiFactory.getRegistryApi(config)
  // const result = yield api.getBy([registry])
  const result = [
    {
      "name": "myuantest/hello",
      imgUrl: "/img/test/github.jpg",
      description: "description"
    }, 
    {
      "name": "tenxcloud/mysql",
      "downloadNumber": 157,
      "starNumber": 0,
      "isPrivate": 0,
      "contributor": "tenxcloud",
      "description": "MySQL数据库",
      "icon": "mysql.png",
      "creationTime": "2016-06-25 06:47:53",
      "updateTime": "2016-07-27 02:42:36"
    }
  ];
  this.body = {
    registry,
    data: result
  }
}