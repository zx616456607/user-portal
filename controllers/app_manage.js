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

exports.getApps = function* () {
  const master = this.params.master
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
    master,
    data
  }
}