/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Index controller
 * 
 * v0.1 - 2016-09-22
 * @author YangYuBiao
 */

'use strict'

var data = { storageList: [{
    id:"1",
    name:"test1",
    status:"2",
    formet:"ext4",
    forin:"tenxlolud/volue/log",
    appName:"baiyusf",
    usedSize: 122,
    totalSize:1024,
    createTime:"2016-09-09 11:27:27"
  },
	{
    id:"13",
    name:"sfsd",
    status:"1",
    formet:"ext4",
    forin:"12",
    appName:"baiyusf",
        usedSize: 122,
    totalSize:1024,
    createTime:"2016-09-09 11:27:27"
  },
	{
    id:"12",
    name:"www",
    status:"2",
    formet:"ext4",
    forin:"tenxlolud/volue/log",
    appName:"baiyusf",
        usedSize: 122,
    totalSize:1024,
    createTime:"2016-09-09 11:27:27"
  },
	{
    id:"15",
    name:"tenxlolud",
    status:"1",
    formet:"ext4",
    forin:"12",
    appName:"baiyusf",
        usedSize: 122,
    totalSize:1024,
    createTime:"2016-09-09 11:27:27"
  },
	{
    id:"17",
    name:"wwwwwwwfs",
    status:"2",
    formet:"ext4",
    forin:"tenxlolud/volue/log",
    appName:"baiyusf",
        usedSize: 122,
    totalSize:1024,
    createTime:"2016-09-09 11:27:27"
  }]
  }
exports.getStorageListByPool = function*() {
  let pool = this.params.pool
  this.status = 200
  this.body = data
}

exports.deleteStorage = function*() {
  let storageNameArray = this.request.body
  if(!storageNameArray) {
    this.status = 400
    this.body = {
      message: 'error'
    }
    return
  }
  this.status = 200
  data = { storageList: [{
    id:"1",
    name:"test1",
    status:"2",
    formet:"ext4",
    forin:"tenxlolud/volue/log",
    appName:"baiyusf",
    usedSize: 122,
    totalSize:1024,
    createTime:"2016-09-09 11:27:27"
  },
	{
    id:"13",
    name:"sfsd",
    status:"1",
    formet:"ext4",
    forin:"12",
    appName:"baiyusf",
    usedSize: 122,
    totalSize:1024,
    createTime:"2016-09-09 11:27:27"
  },
	{
    id:"12",
    name:"www",
    status:"2",
    formet:"ext4",
    forin:"tenxlolud/volue/log",
    appName:"baiyusf",
    usedSize: 122,
    totalSize:1024,
    createTime:"2016-09-09 11:27:27"
  }]
  }
  this.body = {}
}


exports.createStorage = function*() {
  const pool = this.params.pool
  this.status = 201
  this.body = {
    message: 'success'
  }
}


exports.formateStorage = function*() {
  let pool = this.params.pool
  let reqData = this.request.body
  if(!reqData.type || !reqData.volumeName) {
    this.status = 400
    this.body = { message:　'error'}
  }
  this.status = 200
  this.body = {}
}

exports.resizeStorage = function*() {
  const pool = this.params.pool
  this.status = 200
  this.body = {} 
}
exports.getStorageDetail = function*() {
  this.status = 200
  this.body = {
    volumeName: 'dd',
    isUsed: true,
    create_time:new Date(),
    usedSize: 100,
    totalSize: 1024,
    mount_point: '/test'
  }
}

