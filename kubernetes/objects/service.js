/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Service class for k8s
 *
 * v0.1 - 2016-10-11
 * @author Zhangpc
 */
'use strict'

class Service {
  constructor(name) {
    this.kind = 'Service'
    this.apiVersion = 'v1'
    this.metadata = {
      name,
      labels: {
        name
      }
    }
    this.spec = {
      ports: [],
      selector: {
        name
      },
      externalIPs: []
    }
  }

  addPort(name, protocol, targetPort, port) {
    protocol = (protocol === 'UDP' ? 'UDP' : 'TCP')
    const portObj = {
      name,
      protocol,
      targetPort
    }
    if (port) {
      portObj.port = port
    }
    this.spec.ports.push(portObj)
    if (!this.metadata.annotations) {
      this.metadata.annotations = {}
    }
    this.metadata.annotations[name] = protocol
  }
}

module.exports = Service