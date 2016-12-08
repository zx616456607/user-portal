/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App manage controller
 *
 * v0.1 - 2016-12-05
 * @author mengyuan
 */

'use strict'

const constants = require('../constants')

exports.addPort =  function (deployment, serviceList) {
  if (!deployment || !serviceList) {
      return
  }
  deployment.portForInternal = []
  deployment.portsForExternal = []
  if (!Array.isArray(serviceList)) {
      serviceList = [serviceList]
  }
  for (let i = 0; i < serviceList.length; i++) {
    if (serviceList[i].metadata.name === deployment.metadata.name) {
      if (serviceList[i].spec.externalIPs && serviceList[i].spec.externalIPs.length > 0 && serviceList[i].spec.ports && serviceList[i].spec.ports.length > 0) {
        serviceList[i].spec.ports.forEach(function(port) {
          let annotations = serviceList[i].metadata.annotations[constants.ANNOTATION_SVC_SCHEMA_PORTNAME]
          let portDef = annotations.split(",")
          for (let i = 0; i< portDef.length; i++) {
            let p = portDef[i].split('/')
            if (p && p.length > 1) {
              if (p[0] == port.name) {
                port.protocol = p[1]
                break
              }
            }
          }
        })
        deployment.portsForExternal = serviceList[i].spec.ports
        deployment.binding_domains = serviceList[i].metadata.annotations.binding_domains
        deployment.binding_port = serviceList[i].metadata.annotations.binding_port
      }
      serviceList[i].spec.ports.map((svcPort) => deployment.portForInternal.push(svcPort.port))
      break
    }
  }
}