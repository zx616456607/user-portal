/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Service manage controller
 * 
 * v0.1 - 2016-09-23
 * @author Zhangpc
 */
'use strict'

exports.startServices = function* () {
  const cluster = this.params.cluster
  this.body = {
    cluster
  }
}

exports.stopServices = function* () {
  const cluster = this.params.cluster
  this.body = {
    cluster
  }
}

exports.restartServices = function* () {
  const cluster = this.params.cluster
  this.body = {
    cluster
  }
}

exports.getServicesStatus = function* () {
  const cluster = this.params.cluster
  this.body = {
    cluster
  }
}

exports.getServiceDetail = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  this.body = {
    cluster,
    serviceName
  }
}

exports.getServiceContainers = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const data = [{
    id: "1",
    name: "test1",
    status: "1",
    imageName: "Linux",
    serviceIPInput: "192.168.1.1",
    serviceIPOutput: "www.tenxcloud.com",
    createTime: "2016-09-09 11:27:27",
  }, {
      id: "2",
      name: "test2",
      status: "1",
      imageName: "Linux",
      serviceIPInput: "192.168.1.1",
      serviceIPOutput: "www.tenxcloud.com",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "3",
      name: "test3",
      status: "0",
      imageName: "Linux",
      serviceIPInput: "192.168.1.1",
      serviceIPOutput: "www.tenxcloud.com",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "4",
      name: "test4",
      status: "0",
      imageName: "Linux",
      serviceIPInput: "192.168.1.1",
      serviceIPOutput: "www.tenxcloud.com",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "5",
      name: "test5",
      status: "0",
      imageName: "Linux",
      serviceIPInput: "192.168.1.1",
      serviceIPOutput: "www.tenxcloud.com",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "6",
      name: "test6",
      status: "1",
      imageName: "Linux",
      serviceIPInput: "192.168.1.1",
      serviceIPOutput: "www.tenxcloud.com",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "7",
      name: "test7",
      status: "1",
      imageName: "Linux",
      serviceIPInput: "192.168.1.1",
      serviceIPOutput: "www.tenxcloud.com",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "8",
      name: "test8",
      status: "0",
      imageName: "Linux",
      serviceIPInput: "192.168.1.1/tenxcloud_2.0/instanceList",
      serviceIPOutput: "www.tenxcloud.com/tenxcloud_2.0",
      createTime: "2016-09-09 11:27:27",
    }];
  this.body = {
    cluster,
    serviceName,
    data
  }
}

exports.manualScaleService = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  this.body = {
    cluster,
    serviceName
  }
}

exports.autoScaleService = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  this.body = {
    cluster,
    serviceName
  }
}

exports.changeServiceQuota = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  this.body = {
    cluster,
    serviceName
  }
}

exports.changeServiceHa = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  this.body = {
    cluster,
    serviceName
  }
}

exports.bindServiceDomain = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  this.body = {
    cluster,
    serviceName
  }
}