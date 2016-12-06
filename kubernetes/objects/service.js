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
const TENXCLOUD_PREFIX = 'tenxcloud.com/'
const TENX_SCHEMA_PORTNAME = 'tenxcloud.com/schemaPortname'

class Service {
  constructor(name, cluster) {
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
    if (cluster && cluster.publicIPs) {
      this.spec.externalIPs = JSON.parse(cluster.publicIPs)
    }
  }

  importFromK8SService(k8sService) {
    if (k8sService.metadata) {
      if (k8sService.metadata.name) {
        this.metadata.name = k8sService.metadata.name
      }
      if (k8sService.metadata.labels) {
        for (let key in k8sService.metadata.labels) {
          //Remove tenxcloud added labels
          if (key.indexOf(TENXCLOUD_PREFIX) != 0) {
            this.metadata.labels[key] = k8sService.metadata.labels[key]
          }
        }
      }
      if (k8sService.metadata.annotations) {
        for (let key in k8sService.metadata.annotations) {
          if (key == TENX_SCHEMA_PORTNAME) {
            this.metadata.annotations = {}
            this.metadata.annotations[key] = k8sService.metadata.annotations[key]
            break;
          }
        }
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
    const k8sProtocol = (protocol === 'UDP' ? protocol : 'TCP')
    const portObj = {
      name,
      protocol: k8sProtocol,
      targetPort
    }
    if (port) {
      portObj.port = port
    }
    this.spec.ports.push(portObj)
    if (!this.metadata.annotations) {
      this.metadata.annotations = {}
    }
    if (!this.metadata.annotations[TENX_SCHEMA_PORTNAME]) {
      this.metadata.annotations[TENX_SCHEMA_PORTNAME] = `${name}/${protocol}`
    }
    else {
      this.metadata.annotations[TENX_SCHEMA_PORTNAME] += `,${name}/${protocol}`
    }
  }
}

module.exports = Service