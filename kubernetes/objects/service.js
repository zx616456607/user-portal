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

  importFromK8SService(k8sService) {
    if (k8sService.metadata) {
      if (k8sService.metadata.name) {
        this.metadata.name = k8sService.metadata.name
      }
      if (k8sService.metadata.labels) {
        this.metadata.labels = k8sService.metadata.labels
      }
    }

    if (k8sService.spec) {
      if (k8sService.spec.ports) {
        this.spec.ports = k8sService.spec.ports
      }
      if (k8sService.spec.selector) {
        this.spec.selector = k8sService.spec.selector
      }
      if (k8sService.spec.externalIPs) {
        this.spec.externalIPs = k8sService.spec.externalIPs
      }
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