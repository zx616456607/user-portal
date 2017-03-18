/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * initGlobalConfig services
 * v0.1 - 2017-03-13
 * @author Yangyubiao
 */

'use strict'

const url = require('url')
const config = require('../configs')
const devops = require('../configs/devops')
const logger = require('../utils/logger').getLogger('initGlobalConfig')

global.globalConfig = {
  mail_server: {
    auth: {}
  },
  registryConfig: {},
  cicdConfig: {
    host: devops.host,
    protocol: devops.protocol,
    statusPath: devops.statusPath,
    logPath: devops.logPath
  },
  tenx_api: {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host
  },
  storageConfig: []
}

const apiFactory = require('./api_factory.js')

exports.initGlobalConfig = function* () {
  const spi = apiFactory.getTenxSysSignSpi()
  const result = yield spi.configs.get()
  const configs = result.data
  if(!configs) {
    logger.error('未找到可用配置信息')
    return
  }
  let globalConfig = global.globalConfig
  globalConfig.storageConfig = []
  configs.forEach(item => {
    const configType = item.ConfigType
    let configDetail = JSON.parse(item.ConfigDetail)
    if (configType == 'mail') {
      let arr = configDetail.mailServer.split(':')
      let port = arr[1]
      let host = arr[0]
      //使用引用类型
      globalConfig.mail_server.secure = configDetail.secure
      globalConfig.mail_server.host = host
      globalConfig.mail_server.port = port || 25
      globalConfig.mail_server.auth.user = configDetail.senderMail
      globalConfig.mail_server.auth.pass = configDetail.senderPassword
      globalConfig.mail_server.service_mail = configDetail.senderMail
    }
    if (configType == 'registry') {
      globalConfig.registryConfig.protocol = configDetail.protocol
      globalConfig.registryConfig.host = configDetail.host
      globalConfig.registryConfig.port = configDetail.port
      globalConfig.registryConfig.v2Server = configDetail.v2Server
      globalConfig.registryConfig.v2AuthServer = configDetail.v2AuthServer
      globalConfig.registryConfig.user = configDetail.user
      globalConfig.registryConfig.password = configDetail.password
    }
    if (configType == 'cicd') {
      let host
      let protocol
      if(devops.host) {
        host = devops.host
        protocol = devops.protocol
      }
      else if(configDetail.url) {
        host = configDetail.url
        const arr = host.split('://')
        protocol = arr[0]
        host = arr[1]
      } else if(configDetail.host) {
        host = configDetail.host
        protocol = configDetail.protocol
      }
      globalConfig.cicdConfig.protocol = protocol //configDetail.protocol
      globalConfig.cicdConfig.host = host //configDetail.host
      globalConfig.cicdConfig.external_protocol = configDetail.external_protocol
      globalConfig.cicdConfig.external_host = configDetail.external_host,
      globalConfig.cicdConfig.statusPath = devops.statusPath //configDetail.statusPath,
      globalConfig.cicdConfig.logPath = devops.logPath //configDetail.logPath
    }
    if (configType == 'apiServer') {
      globalConfig.tenx_api.protocol = config.tenx_api.protocol //config.configDetail.protocol
      globalConfig.tenx_api.host = config.tenx_api.host //config.configDetail.host
      globalConfig.tenx_api.external_host = configDetail.external_host
      globalConfig.tenx_api.external_protocol = configDetail.external_protocol
    }
    if (configType === 'rbd') {
      item.ConfigDetail = configDetail
      globalConfig.storageConfig.push(item)
    }
  })
}
