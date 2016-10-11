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

  addPort(name, protocol, port, targetPort) {
    protocol = (protocol === 'UDP' ? 'UDP' : 'TCP')
    this.spec.ports.push({
      name,
      protocol,
      port,
      targetPort
    })
    if (!this.metadata.annotations) {
      this.metadata.annotations = {}
    }
    this.metadata.annotations[name] = protocol
  }
}

module.exports = Service