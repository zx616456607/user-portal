/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Container class for k8s
 *
 * v0.1 - 2016-10-11
 * @author Zhangpc
 */
'use strict'

class Container {
  constructor(name, image) {
    this.name = name
    this.image = image
    this.ports = []
    this.env = []
    this.resources = {
      limits: {
        memory: "256M"
      },
      requests: {
        memory: "256Mi"
      }
    }
  }
}

module.exports = Container