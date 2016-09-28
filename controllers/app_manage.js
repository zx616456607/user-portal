/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * App manage controller
 * 
 * v0.1 - 2016-09-23
 * @author Zhangpc
 */
'use strict'

exports.createApp = function* () {
  const cluster = this.params.cluster
  this.body = {
    cluster
  }
}

exports.getApps = function* () {
  const cluster = this.params.cluster
  const data = [{
    id: "1",
    appName: "test1",
    appStatus: "1",
    serviceNum: "12",
    containerNum: "12",
    visitIp: "192.168.1.1",
    createTime: "2016-09-09 11:27:27",
  }, {
      id: "2",
      appName: "test2",
      appStatus: "1",
      serviceNum: "12",
      containerNum: "12",
      visitIp: "192.168.1.1",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "3",
      appName: "test3",
      appStatus: "0",
      serviceNum: "12",
      containerNum: "12",
      visitIp: "192.168.1.1",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "4",
      appName: "test4",
      appStatus: "0",
      serviceNum: "12",
      containerNum: "12",
      visitIp: "192.168.1.1",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "5",
      appName: "test5",
      appStatus: "0",
      serviceNum: "12",
      containerNum: "12",
      visitIp: "192.168.1.1",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "6",
      appName: "test6",
      appStatus: "1",
      serviceNum: "12",
      containerNum: "12",
      visitIp: "192.168.1.1",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "7",
      appName: "test7",
      appStatus: "1",
      serviceNum: "12",
      containerNum: "12",
      visitIp: "192.168.1.1",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "8",
      appName: "test8",
      appStatus: "0",
      serviceNum: "12",
      containerNum: "12",
      visitIp: "192.168.1.1",
      createTime: "2016-09-09 11:27:27",
    }];
  this.body = {
    cluster,
    data
  }
}

exports.deleteApps = function* () {
  const cluster = this.params.cluster
  this.body = {
    cluster
  }
}

exports.stopApps = function* () {
  const cluster = this.params.cluster
  this.body = {
    cluster
  }
}

exports.startApps = function* () {
  const cluster = this.params.cluster
  this.body = {
    cluster
  }
}

exports.restartApps = function* () {
  const cluster = this.params.cluster
  this.body = {
    cluster
  }
}

exports.getAppsStatus = function* () {
  const cluster = this.params.cluster
  this.body = {
    cluster
  }
}

exports.addService = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  this.body = {
    cluster,
    appName
  }
}

exports.deleteServices = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  const data = []
  this.body = {
    cluster,
    appName,
    data
  }
}

exports.getAppServices = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  const data = [{
    id: "1",
    name: "test1",
    status: "1",
    imageName: "Linux",
    serviceIP: "192.168.1.1",
    createTime: "2016-09-09 11:27:27",
  }, {
      id: "2",
      name: "test2",
      status: "1",
      imageName: "Linux",
      serviceIP: "192.168.1.1",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "3",
      name: "test3",
      status: "0",
      imageName: "Linux",
      serviceIP: "192.168.1.1",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "4",
      name: "test4",
      status: "0",
      imageName: "Linux",
      serviceIP: "192.168.1.1",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "5",
      name: "test5",
      status: "0",
      imageName: "Linux",
      serviceIP: "192.168.1.1",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "6",
      name: "test6",
      status: "1",
      imageName: "Linux",
      serviceIP: "192.168.1.1",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "7",
      name: "test7",
      status: "1",
      imageName: "Linux",
      serviceIP: "192.168.1.1",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "8",
      name: "test8",
      status: "0",
      imageName: "Linux",
      serviceIP: "192.168.1.1",
      createTime: "2016-09-09 11:27:27",
    }];
  this.body = {
    cluster,
    appName,
    data
  }
}

exports.getAppOrchfile = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  const data = []
  this.body = {
    cluster,
    appName,
    data
  }
}

exports.getAppLogs = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  const data = []
  this.body = {
    cluster,
    appName,
    data
  }
}