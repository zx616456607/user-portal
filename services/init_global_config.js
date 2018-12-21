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
    external_host: devops.external_host,
    external_protocol: devops.external_protocol,
    statusPath: devops.statusPath,
    logPath: devops.logPath
  },
  tenx_api: {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    external_host: config.tenx_api.external_host,
    external_protocol: config.tenx_api.external_protocol
  },
  storageConfig: [],
  vmWrapConfig: {
    host: config.vm_api.host,
    protocol: config.vm_api.protocol,
  },
  msaConfig: {},
  ftpConfig: {},
  billingConfig: {},
  chartRepoConfig: {},
  aiopsConfig: {},
  loadbalanceConfig: {},
  openstack: {},
  oauthConfig: {},
  vmTermConfig: {
    host: config.vm_term_api.host,
    protocol: config.vm_term_api.protocol,
    version: config.vm_term_api.version,
  },
}

const apiFactory = require('./api_factory.js')

exports.initGlobalConfig = function* () {
  const method = 'initGlobalConfig'
  const spi = apiFactory.getTenxSysSignSpi()
  const result = yield spi.configs.get()
  const configs = result.data
  if (!configs) {
    logger.error(method, '未找到可用配置信息')
    return
  }
  let globalConfig = global.globalConfig
  const ConfigArray = {}
  globalConfig.storageConfig = []
  configs.forEach(item => {
    const configType = item.ConfigType
    let configDetail
    try {
      configDetail = JSON.parse(item.ConfigDetail)
    } catch (error) {
      logger.error(method, 'parse configDetail failed')
      configDetail = {}
    }
    if (configType == 'mail' && configDetail.mailServer) {
      let arr = configDetail.mailServer.split(':')
      let port = arr[1]
      let host = arr[0]
      //使用引用类型
      const secure = configDetail.secure
      const defaultPort = secure ? 465 : 25
      globalConfig.mail_server.secure = secure
      globalConfig.mail_server.host = host
      globalConfig.mail_server.port = port || defaultPort
      globalConfig.mail_server.auth.user = configDetail.senderMail
      globalConfig.mail_server.auth.pass = configDetail.senderPassword
      globalConfig.mail_server.service_mail = configDetail.senderMail
      ConfigArray.Mail = 'NotEmpty'
      return
    }
    if (configType == 'harbor') { // Use harbor from v2.6.0
      globalConfig.registryConfig.url = configDetail.url
      ConfigArray.Registry = 'NotEmpty'
      return
    }
    // Use db settings if env is empty
    if (configType == 'cicd' && globalConfig.cicdConfig.host == "") {
      let host
      let protocol
      if (devops.host) {
        host = devops.host
        protocol = devops.protocol
      }
      else if (configDetail.url) {
        host = configDetail.url
        const arr = host.split('://')
        protocol = arr[0]
        host = arr[1]
      } else if (configDetail.host) {
        host = configDetail.host
        protocol = configDetail.protocol
      }
      globalConfig.cicdConfig.protocol = protocol //configDetail.protocol
      globalConfig.cicdConfig.host = host //configDetail.host
      globalConfig.cicdConfig.external_protocol = devops.external_protocol
      if (!devops.external_protocol) {
        globalConfig.cicdConfig.external_protocol = protocol
      }
      globalConfig.cicdConfig.external_host = devops.external_host
      if (!devops.external_host) {
        globalConfig.cicdConfig.external_host = host
      }
      globalConfig.cicdConfig.statusPath = devops.statusPath //configDetail.statusPath,
      globalConfig.cicdConfig.logPath = devops.logPath //configDetail.logPath
      logger.info('devops config: ', protocol + '://' + host)
      ConfigArray.Cicd = 'NotEmpty'
      return
    }
    if (configType === 'rbd') {
      item.ConfigDetail = configDetail
      globalConfig.storageConfig.push(item)
      ConfigArray.Rbd = 'NotEmpty'
      return
    }
    // Use db settings if env is not set
    if (configType === 'vm') {
      globalConfig.vmWrapConfig.enabled = configDetail.enabled
      globalConfig.vmWrapConfig.configID = item.ConfigID
      let host
      let protocol
      if (configDetail.url) {
        host = configDetail.url
        const arr = host.split('://')
        protocol = arr[0]
        host = arr[1]
      } else if (configDetail.host) {
        host = configDetail.host
        protocol = configDetail.protocol
      }
      globalConfig.vmWrapConfig.protocol = protocol
      globalConfig.vmWrapConfig.host = host
      return
    }
    if (configType === 'chart_repo') {
      globalConfig.chartRepoConfig.url = configDetail.url
      return
    }
    if (configType === 'msa') {
      globalConfig.msaConfig.url = configDetail.url
      return
    }
    if (configType === 'ftp') {
      globalConfig.ftpConfig.addr = configDetail.addr
      globalConfig.ftpConfig.username = configDetail.username
      globalConfig.ftpConfig.password = configDetail.password
    }
    if (configType === 'billing') {
      globalConfig.billingConfig.enabled = configDetail.enabled
      globalConfig.billingConfig.configID = item.ConfigID
    }
    if (configType === 'ai') {
      globalConfig.aiopsConfig.protocol = configDetail.protocol
      globalConfig.aiopsConfig.host = configDetail.host
      globalConfig.aiopsConfig.apiVersion = configDetail.apiVersion
      return
    }
    if (configType === 'loadbalance') {
      globalConfig.loadbalanceConfig.enabled = configDetail.enabled
      globalConfig.loadbalanceConfig.configID = item.ConfigID
      return
    }
    if (configType === 'openstack') {
      globalConfig.openstack.config = configDetail
      globalConfig.openstack.configID = item.ConfigID
      return
    }
    if (configType === 'oauth') {
      globalConfig.oauth.config = configDetail
      globalConfig.oauth.configID = item.ConfigID
      return
    }
  })
  if (ConfigArray.Mail !== 'NotEmpty') {
    globalConfig.mail_server = {
      auth: {}
    }
  }
  if (ConfigArray.Registry !== 'NotEmpty') {
    globalConfig.registryConfig = {}
  }
  if (ConfigArray.Rbd !== 'NotEmpty') {
    globalConfig.storageConfig = []
  }
  logger.info('api-server config: ', globalConfig.tenx_api.protocol + '://' + globalConfig.tenx_api.host)
  logger.info('registry config: ', globalConfig.registryConfig.url)
  logger.info('devops config: ', globalConfig.cicdConfig.protocol + '://' + globalConfig.cicdConfig.host)
  logger.info('vm wrap api config: ', globalConfig.vmWrapConfig.protocol + '://' + globalConfig.vmWrapConfig.host)
  logger.info('mailbox config: ', globalConfig.mail_server.host)
  logger.info('msa config: ', globalConfig.msaConfig.url)
  logger.info('ftp config: ', globalConfig.ftpConfig.addr)
  logger.info('billing config: ', globalConfig.billingConfig.enabled)
  logger.info('loadbalance config: ', globalConfig.loadbalanceConfig.enabled)
}
