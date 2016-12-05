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

exports.addPort =  function (deployment, serviceList) {
  if (!deployment || !serviceList) {
      retrun
  }
  deployment.portForInternal = []
  deployment.portsForExternal = []
  if (!Array.isArray(serviceList)) {
      serviceList = [serviceList]
  }
  for (let i = 0; i < serviceList.length; i++) {
    if (serviceList[i].metadata.name === deployment.metadata.name) {
      if (serviceList[i].spec.externalIPs && serviceList[i].spec.externalIPs.length > 0 && serviceList[i].spec.ports && serviceList[i].spec.ports.length > 0) {
        deployment.portsForExternal = serviceList[i].spec.ports
      }
      serviceList[i].spec.ports.map((svcPort) => deployment.portForInternal.push(svcPort.port))
      break
    }
  }
}