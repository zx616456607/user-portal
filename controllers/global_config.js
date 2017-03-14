/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Setting manage controller
 *
 * v0.1 - 2017-03-09
 * @author Yangyubiao
 */

'use strict'

const apiFactory = require('../services/api_factory.js')
const config = require('../configs')
const devOps = require('../configs/devops')

exports.changeGlobalConfig = function* () {
  const cluster = this.params.cluster
  const type = this.params.type
  const entity = this.request.body
  entity.configDetail = JSON.stringify(entity.detail)
  const api = apiFactory.getApi(this.session.loginUser)
  if (entity.configID) {
    const response = yield api.config.updateBy(['type', type], null, entity)
    this.status = response.code
    this.body = response
  } else {
    if (type == 'cicd') {
      let body = {}
      let cicdEntity = {
        configID: entity.cicdID,
        configDetail: JSON.stringify(entity.cicdDetail)
      }
      let apiServerEntity = {
        configID: entity.apiServerID,
        configDetail: JSON.stringify(entity.apiServerDetail)
      }
      if (entity.cicdID) {
        body.cicd = yield api.config.updateBy(['type', type], null, cicdEntity)
      } else {
        body.cicd = yield api.config.createBy(['cluster', cluster, 'type', 'cicd'], null, cicdEntity)
      }
      if (entity.apiServerID) {
        body.apiServer = yield api.config.updateBy(['type', type], null, apiServerEntity)
      } else {
        body.apiServer = yield api.config.createBy(['cluster', cluster, 'type', 'apiServer'], null, apiServerEntity)
      }
      this.body = body
      return
    }
    const response = yield api.config.createBy(['cluster', cluster, 'type', type], null, entity)
    this.status = response.code
    this.body = response
  }
  // if (type == 'mail') {
  //   let port = 80
  //   let host = entity.detail.mailServer
  //   if (host.indexOf(':') >= 0) {
  //     let arr = host.split(':')
  //     host = arr[0]
  //     port = arr[1]
  //   }
  //   config.mail_server = Object.assign(config.mail_server, {
  //     host,
  //     port,
  //     auth: {
  //       user: entity.detail.senderMail,
  //       pass: entity.detail.senderPassword
  //     }
  //   })
  // }
  // if (type == 'cicd') {

  // }

  // const config = {
  //   "protocol": env.DEVOPS_PROTOCOL || "http",
  //   "host": env.DEVOPS_HOST || "192.168.1.103:38090",
  //   "external_protocol": env.DEVOPS_EXTERNAL_PROTOCOL || "https",
  //   "external_host": env.DEVOPS_EXTERNAL_HOST || "cicdv2.tenxcloud.com",
  //   "statusPath": "/stagebuild/status",
  //   "logPath": "/stagebuild/log"
  // }
}

exports.getGlobalConfig = function* () {
  const cluster = this.params.cluster
  const api = apiFactory.getApi(this.session.loginUser)
  const response = yield api.config.getBy(['cluster', cluster])
  this.status = response.code
  this.body = response
}
