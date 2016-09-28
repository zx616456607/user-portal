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
exports.getContainers = function* () {
  const master = this.params.master
  const data = [{
    id: "1",
    name: "test1",
    appStatus: "1",
    serviceNum: "12",
    containerNum: "12",
    serviceIPInput: "192.168.1.1",
    serviceIPOutput: "www.tenxcloud.com",
    createTime: "2016-09-09 11:27:27",
  }, {
      id: "2",
      name: "test2",
      appStatus: "1",
      serviceNum: "12",
      containerNum: "12",
      serviceIPInput: "192.168.1.1",
      serviceIPOutput: "www.tenxcloud.com",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "3",
      name: "test3",
      appStatus: "0",
      serviceNum: "12",
      containerNum: "12",
      serviceIPInput: "192.168.1.1",
      serviceIPOutput: "www.tenxcloud.com",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "4",
      name: "test4",
      appStatus: "0",
      serviceNum: "12",
      containerNum: "12",
      serviceIPInput: "192.168.1.1",
      serviceIPOutput: "www.tenxcloud.com",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "5",
      name: "test5",
      appStatus: "0",
      serviceNum: "12",
      containerNum: "12",
      serviceIPInput: "192.168.1.1",
      serviceIPOutput: "www.tenxcloud.com",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "6",
      name: "test6",
      appStatus: "1",
      serviceNum: "12",
      containerNum: "12",
      serviceIPInput: "192.168.1.1",
      serviceIPOutput: "www.tenxcloud.com",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "7",
      name: "test7",
      appStatus: "1",
      serviceNum: "12",
      containerNum: "12",
      serviceIPInput: "192.168.1.1",
      serviceIPOutput: "www.tenxcloud.com",
      createTime: "2016-09-09 11:27:27",
    }, {
      id: "8",
      name: "test8",
      appStatus: "0",
      serviceNum: "12",
      containerNum: "12",
      serviceIPInput: "192.168.1.1",
      serviceIPOutput: "www.tenxcloud.com",
      createTime: "2016-09-09 11:27:27",
    }];
  this.body = {
    master,
    data
  }
}

exports.getContainerDetail = function* () {
  const cluster = this.params.cluster
  const containerName = this.params.container_name
  this.body = {
    cluster,
    containerName
  }
}