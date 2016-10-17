/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  configGroup list
 *
 * v2.0 - 2016/9/28
 * @author Bai Yu
 */

'use strict'
const ConfigGroupsApi = require('../tenx_api/v2')
const configGroups = {
  protocol: 'http',
  host: '192.168.1.103:48000',
  version: 'v2',
  auth: {
    user: 'huangxin',
    token: 'vmrptixssqmwojepukeedbpkgujtypbklggnjazhsmrlfyef',
    namespace: 'huangxin'
  },
  timeout: 600
}
const configApi = new ConfigGroupsApi(configGroups)

exports.getConfigGroup = function* () {
  const cluster = this.params.cluster
  const data = [
    {
      groupId: '1',
      groupName: 'my_ConfigGroup1',
      date: '2016-09-12 15:12:30',
      configFile: [
        {
          fileId: '1', fileName: 'my_config_file1',
          container: [
            { containerId: '1', containerName: 'my_container1', pointPath: '/var/test/log1', },
            { containerId: '2', containerName: 'my_container2', pointPath: '/var/test/log2', },
            { containerId: '3', containerName: 'my_container3', pointPath: '/var/test/log3', },
            { containerId: '4', containerName: 'my_container4', pointPath: '/var/test/log4', },
            { containerId: '5', containerName: 'my_container5', pointPath: '/var/test/log5', },
            { containerId: '6', containerName: 'my_container6', pointPath: '/var/test/log6', },
            { containerId: '7', containerName: 'my_container7', pointPath: '/var/test/log7', },
            { containerId: '8', containerName: 'my_container8', pointPath: '/var/test/log8', },
            { containerId: '9', containerName: 'my_container9', pointPath: '/var/test/log9', },
            { containerId: '10', containerName: 'my_container10', pointPath: '/var/test/log10', },
          ]
        },
        {
          fileId: '2', fileName: 'my_config_file2',
          container: [
            { containerId: '1', containerName: 'my_container1', pointPath: '/var/test/log', },
            { containerId: '2', containerName: 'my_container2', pointPath: '/var/test/log', },
          ]
        },
        {
          fileId: '3', fileName: 'my_config_file3',
          container: [
            { containerId: '1', containerName: 'my_container1', pointPath: '/var/test/log', },
            { containerId: '2', containerName: 'my_container2', pointPath: '/var/test/log', },
            { containerId: '3', containerName: 'my_container3', pointPath: '/var/test/log', },
          ]
        },
        {
          fileId: '4', fileName: 'my_config_file4',
          container: [

          ]
        },
        {
          fileId: '5', fileName: 'my_config_file5',
          container: [
            { containerId: '1', containerName: 'my_container1', pointPath: '/var/test/log', },
            { containerId: '2', containerName: 'my_container2', pointPath: '/var/test/log', },
            { containerId: '3', containerName: 'my_container3', pointPath: '/var/test/log', },
            { containerId: '4', containerName: 'my_container4', pointPath: '/var/test/log', },
          ]
        },
      ],
    },
    {
      groupId: '2',
      groupName: 'my_ConfigGroup2',
      date: '2016-09-12 15:12:30',
      configFile: [
        {
          fileId: '1', fileName: 'my_config_file1',
          container: [
            { containerId: '1', containerName: 'my_container1', pointPath: '/var/test/log', },
            { containerId: '2', containerName: 'my_container2', pointPath: '/var/test/log', },
            { containerId: '3', containerName: 'my_container3', pointPath: '/var/test/log', },
            { containerId: '4', containerName: 'my_container4', pointPath: '/var/test/log', },
            { containerId: '5', containerName: 'my_container5', pointPath: '/var/test/log', },
            { containerId: '6', containerName: 'my_container6', pointPath: '/var/test/log', },
            { containerId: '7', containerName: 'my_container7', pointPath: '/var/test/log', },
            { containerId: '8', containerName: 'my_container8', pointPath: '/var/test/log', },
            { containerId: '9', containerName: 'my_container9', pointPath: '/var/test/log', },
            { containerId: '10', containerName: 'my_container10', pointPath: '/var/test/log', },
          ]
        },

      ],
    },
    {
      groupId: '3',
      groupName: 'my_ConfigGroup3',
      configFile: [
        {
          fileId: '1', fileName: 'my_config_file1',
          container: [
            { containerId: '1', containerName: 'my_container1', pointPath: '/var/test/log', },
            { containerId: '2', containerName: 'my_container2', pointPath: '/var/test/log', },
            { containerId: '3', containerName: 'my_container3', pointPath: '/var/test/log', },
            { containerId: '4', containerName: 'my_container4', pointPath: '/var/test/log', },
            { containerId: '5', containerName: 'my_container5', pointPath: '/var/test/log', },
            { containerId: '6', containerName: 'my_container6', pointPath: '/var/test/log', },
            { containerId: '7', containerName: 'my_container7', pointPath: '/var/test/log', },
            { containerId: '8', containerName: 'my_container8', pointPath: '/var/test/log', },
            { containerId: '9', containerName: 'my_container9', pointPath: '/var/test/log', },
            { containerId: '10', containerName: 'my_container10', pointPath: '/var/test/log', },
          ]
        },
        {
          fileId: '2', fileName: 'my_config_file2',
          container: [
            { containerId: '1', containerName: 'my_container1', pointPath: '/var/test/log', },
            { containerId: '2', containerName: 'my_container2', pointPath: '/var/test/log', },
            { containerId: '3', containerName: 'my_container3', pointPath: '/var/test/log', },
            { containerId: '4', containerName: 'my_container4', pointPath: '/var/test/log', },
            { containerId: '5', containerName: 'my_container5', pointPath: '/var/test/log', },
            { containerId: '6', containerName: 'my_container6', pointPath: '/var/test/log', },
            { containerId: '7', containerName: 'my_container7', pointPath: '/var/test/log', },
            { containerId: '8', containerName: 'my_container8', pointPath: '/var/test/log', },
            { containerId: '9', containerName: 'my_container9', pointPath: '/var/test/log', },
            { containerId: '10', containerName: 'my_container10', pointPath: '/var/test/log', },
          ]
        },
      ],
      date: '2016-09-12 15:12:30',
    },
    {
      groupId: '4',
      groupName: 'my_ConfigGroup4',
      configFile: [
        {
          fileId: '1', fileName: 'my_config_file1',
          container: [
            { containerId: '1', containerName: 'my_container1', pointPath: '/var/test/log', },
            { containerId: '2', containerName: 'my_container2', pointPath: '/var/test/log', },
            { containerId: '3', containerName: 'my_container3', pointPath: '/var/test/log', },
            { containerId: '4', containerName: 'my_container4', pointPath: '/var/test/log', },
            { containerId: '5', containerName: 'my_container5', pointPath: '/var/test/log', },
            { containerId: '6', containerName: 'my_container6', pointPath: '/var/test/log', },
            { containerId: '7', containerName: 'my_container7', pointPath: '/var/test/log', },
            { containerId: '8', containerName: 'my_container8', pointPath: '/var/test/log', },
            { containerId: '9', containerName: 'my_container9', pointPath: '/var/test/log', },
            { containerId: '10', containerName: 'my_container10', pointPath: '/var/test/log', },
          ]
        },
        {
          fileId: '2', fileName: 'my_config_file2',
          container: [
            { containerId: '1', containerName: 'my_container1', pointPath: '/var/test/log', },
            { containerId: '2', containerName: 'my_container2', pointPath: '/var/test/log', },
            { containerId: '3', containerName: 'my_container3', pointPath: '/var/test/log', },
            { containerId: '4', containerName: 'my_container4', pointPath: '/var/test/log', },
            { containerId: '5', containerName: 'my_container5', pointPath: '/var/test/log', },
            { containerId: '6', containerName: 'my_container6', pointPath: '/var/test/log', },
            { containerId: '7', containerName: 'my_container7', pointPath: '/var/test/log', },
            { containerId: '8', containerName: 'my_container8', pointPath: '/var/test/log', },
            { containerId: '9', containerName: 'my_container9', pointPath: '/var/test/log', },
            { containerId: '10', containerName: 'my_container10', pointPath: '/var/test/log', },
          ]
        },
      ],
      date: '2016-09-12 15:12:30',
    },
  ];

  // let pool = this.params.pool
  let response = yield configApi.configGroup.getBy([cluster, 'configgroups'])
  this.status = response.code
  this.body = {
    data: response.data,
    cluster
  }
}

exports.getConfigGroupName = function* () {
  const cluster = this.params.cluster
  let configName = this.params.name
  let response = yield configApi.configGroup.getBy([cluster, 'configgroups', configName])
  this.status = response.code
  this.body = {
    data: response.data.extended
  }
}

exports.createConfigGroup = function* () {
  const cluster = this.params.cluster
  let groupName = this.request.body.groupName
  if (!cluster || !groupName) {
    this.status = 400
    this.body = { message: 'error' }
  }
  let response = yield configApi.configGroup.createBy([cluster, 'configgroups', groupName])

  this.status = response.code
  this.body = {
    data: response.data
  }
}
exports.deleteConfigGroup = function* () {
  const cluster = this.params.cluster
  let groups = this.request.body
  console.log('delete group name ', groups)
  if (groups.groups.length == 0) {
    this.status = 400
    this.body = { message: 'Not Parameter' }
  }
  let response = yield configApi.configGroup.batchDeleteBy([cluster, 'configgroups', 'batch-delete'], null, groups)
  // go delete`
  this.status = response.code
  this.body = {
    message: '删除成功了'
  }
}

//  create config group files
exports.createConfigFiles = function* () {
  const cluster = this.params.cluster
  const fileName = this.params.name
  const group = this.params.group
  let data = this.request.body.groupFiles
  if (!cluster || !data) {
    this.status = 400
    this.body = { message: 'error' }
  }
  let response = yield configApi.configGroup.createBy([cluster, 'configgroups', group, 'configs', fileName], null, data)

  this.status = response.code
  this.body = {
    data: response.data
  }
}

exports.loadConfigFiles = function* () {
  const cluster = this.params.cluster
  const fileName = this.params.name
  const group = this.params.group
  let response = yield configApi.configGroup.getBy([cluster, 'configgroups', group, 'configs', fileName])

  this.status = response.code
  this.body = {
    data: response.data
  }
}

exports.updateConfigName = function* () {
  const cluster = this.params.cluster
  const fileName = this.params.name
  const group = this.params.group
  let data = this.request.body.desc
  console.log('update in ', data)
  let response = yield configApi.configGroup.updateBy([cluster, 'configgroups', group, 'configs', fileName], null, data)

  this.status = response.code
  this.body = {
    data: response.data
  }
}

exports.deleteConfigFiles = function* () {
  const cluster = this.params.cluster
  const group = this.params.group
  const data = this.request.body
  let response = yield configApi.configGroup.batchDeleteBy([cluster, 'configgroups', group, 'configs', 'batch-delete'], null, data)
  this.status = response.code
  this.body = {
    data: response.data
  }
}