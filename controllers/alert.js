/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2017-03-23
 * @author mengyuan
 */
'use strict'

const apiFactory = require('../services/api_factory')
const email = require('../utils/email')
const logger = require('../utils/logger.js').getLogger('alert')
const initGlobalConfig = require('../services/init_global_config')
const co = require('co')
const _ = require('lodash')

exports.getResourceRecordFilters = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, "alerts/record-filters"], null)
  this.body = result
}
exports.getLogRecordFilters = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, "alerts/service-records/query"], null)
  this.body = result
}

exports.getLogRecord = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, "alerts/service-records"], null, body)
  this.body = result
}

exports.getRecords = function* () {
  const cluster = this.params.cluster
  let query = {}
  if (this.query) {
    query.strategyName = this.query.strategyName || ''
    query.targetType = this.query.targetType != undefined ? this.query.targetType : ''
    query.targetName = this.query.targetName
    query.status = this.query.status != undefined ? this.query.status : ''
    query.beginTime = this.query.beginTime || ''
    query.endTime = this.query.endTime || ''
    query.from = this.query.from != undefined ? this.query.from : ''
    query.size = this.query.size != undefined ? this.query.size : ''
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, "alerts/records"], query)
  this.body = result
}

exports.deleteRecords = function* () {
  const cluster = this.params.cluster
  const query = this.query
  if (this.query && this.query.strategyID) {
    query.strategyID = this.query.strategyID
  }

  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([cluster, "alerts/records"], query)
  this.body = result
}

exports.listNotifyGroups = function* () {
  const cluster = this.params.cluster
  let query = {
    name: '',
  }
  if (this.query) {
    query.name = this.query.name
    query.id = this.query.id
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, "alerts/groups"], query)
  this.body = result
}

exports.createNotifyGroup = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, "alerts/groups"], null, this.request.body)
  this.body = result
}

exports.modifyNotifyGroup = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, "alerts/groups", this.params.groupid], null, this.request.body)
  this.body = result
}

exports.batchDeleteNotifyGroups = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, "alerts/groups", 'batch-delete'], null, this.request.body)
  this.body = result
}

exports.sendInvitation = function* () {
  const method = 'alert.sendInvitation'
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.email.createBy(['invitations'], null, this.request.body)
  // get email addr and code, then send out the code
  const initConfig = yield initGlobalConfig.initGlobalConfig()
  const transport = _.cloneDeep(globalConfig.mail_server)
  yield result.data.emails.map(function (item) {
    return email.sendNotifyGroupInvitationEmail(item.addr, loginUser.user, loginUser.email, item.code,transport)
  })
  this.body = {}
}

exports.acceptInvitation = function* () {
  if (!this.query || !this.query.code) {
    const err = new Error('invalid parameter')
    err.status = 400
    throw err
  }

  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const body = {
    code: this.query.code
  }
  const result = yield spi.email.createBy(["invitations", 'join'], null, body)
  this.body = result
}

exports.checkEmailAcceptInvitation = function* () {
  if (!this.query || !this.query.emails) {
    const err = new Error('invalid parameter')
    err.status = 400
    throw err
  }

  const query = {
    emails: this.query.emails,
  }

  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.email.getBy(["invitations", 'status'], query)

  this.body = result
}



/*--------------alert setting--------------------*/

exports.checkExist = function* (){
  const cluster = this.params.cluster
  const strategyName = this.params.strategyName
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const result = yield api.getBy([cluster, 'alerts/strategies', strategyName, "existence"], null)
  this.body = result
}

// 判断该告警规则是否存在
exports.checkLogExist = function* (){
  const cluster = this.params.cluster
  const strategyName = this.params.strategyName
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const result = yield api.getBy([cluster, 'alerts/logsalert', strategyName, "existence"], null)
  this.body = result
}

exports.getAlertSetting = function* () {
  const cluster = this.params.cluster
  const user = this.session.loginUser
  let owner = user.user
  const body = this.query
  const api = apiFactory.getK8sApi(user)
  // if(teamspace){
  //   const teamID = this.query.teamID
  //   if(!teamID) {
  //     const err = new Error("teamID is require")
  //     err.status = 400
  //     throw err
  //   }
  //   const teamCreator = yield api.teams.getBy([teamID, 'creator'])
  //   owner = teamCreator.data.userName
  // }
  const response = yield api.getBy([cluster, 'alerts/strategy-rules'], body)
  const setting = response.data
  const keyArr = Object.getOwnPropertyNames(setting)
  if (keyArr.length == 0) {
    this.body = {
      data: {}
    }
    return
  }
  const rules = setting[keyArr[0]]
  const specs = []
  let strategyID
  let result = []
  if (!rules) {
    this.body = {
      data: {}
    }
    return
  }
  rules.forEach(rule => {
    let condition = rule.annotations.condition
    condition = condition.split(rule.annotations.operator)
    let item = {
      type: condition[0],
      operation: rule.annotations.operator,
      threshold: condition[condition.length - 1].trim(),
      createTime: rule.annotations.createTime,
      recordCount: 0,
      name: rule.alert,
      key: rule.alert
    }
    switchType(item)
    result.push(item)
    strategyID = rule.labels.tenxStrategyID
    specs.push({
      triggerRule: rule.annotations.condition,
      ruleName: rule.alert
    })
  })
  let recordCount = yield api.createBy([cluster, 'alerts/records', 'count'], null, {
    strategyID: strategyID,
    specs
  })
  recordCount = recordCount.data
  result.forEach(item => {
    item.recordCount = recordCount[item.name] || 0
  })
  this.body = {
    data: result
  }
}

exports.addAlertSetting = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const response = yield api.createBy([cluster, 'alerts/strategies'], null, body)
  this.body = response
}

exports.addAlertRegularSetting = function* () { // 增加告警规则
  const cluster = this.params.cluster
  const body = this.request.body
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const response = yield api.createBy([cluster, 'alerts/logsalert'], null, body)
  this.body = response
}

exports.modifyAlertSetting = function* () {
  const cluster = this.params.cluster
  const strategyID = this.params.strategyID
  const body = this.request.body
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const response = yield api.updateBy([cluster, 'alerts/strategies', strategyID], null, body)
  this.body = response
}

exports.getSettingList = function* () {
  const cluster = this.params.cluster
  const queryBody = this.query || {}
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.getBy([cluster, 'alerts/strategies'], queryBody)
  this.body = response
}
exports.getSettingLogList = function* () {
  const cluster = this.params.cluster
  const queryBody = this.query || {}
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.getBy([cluster, 'alerts/logsalert'], queryBody)
  this.body = response
}

exports.getSettingListfromserviceorapp = function* () {
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const queryBody = this.query
  const body = yield api.getBy([cluster, 'alerts/group-strategies'], queryBody)
  this.body = body
}

exports.deleteSetting = function* () {
  const cluster = this.params.cluster
  const strategyID = this.query.strategyID
  const strategyName = this.query.strategyName
  if (!strategyID) {
    const err = new Error('strategyID is require')
    err.status = 400
    throw err
  }
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const response = yield api.deleteBy([cluster, 'alerts/strategies'], {
    strategyIDs: strategyID,
    strategyName: strategyName
  })
  this.body = response
}

// 删除告警规则
exports.deleteRegularSetting = function* () {
  const cluster = this.params.cluster
  const name = this.params.name
  // const strategyID = this.query.strategyID
  // const strategyName = this.query.strategyName
  // if (!strategyID) {
  //   const err = new Error('strategyID is require')
  //   err.status = 400
  //   throw err
  // }
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const response = yield api.deleteBy([cluster, 'alerts/logsalert', name])
  this.body = response
}

exports.batchEnable = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  if (!body.strategies) {
    const err = new Error('strategies is require')
    err.status = 400
    throw err
  }
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const response = yield api.createBy([cluster, 'alerts/strategies/batch-enable'], null, body)
  this.body = response
}

exports.batchDisable = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  if (!body.strategies) {
    const err = new Error('strategies is require')
    err.status = 400
    throw err
  }
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const response = yield api.createBy([cluster, 'alerts/strategies/batch-disable'], null, body)
  this.body = response
}

exports.batchToggleRegular = function* () { // 开启/关闭告警规则
  const ruleName = this.params.rulename
  const cluster = this.params.cluster
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const response = yield api.getBy([cluster, `alerts/logsalert/${ruleName}/status`], null)
  this.body = response
}
exports.batchEnableEmail = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  if (!body.strategyIDs) {
    const err = new Error('strategyIDs is require')
    err.status = 400
    throw err
  }
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const response = yield api.createBy([cluster, 'alerts/strategies/batch-enable-email'], null, body)
  this.body = response
}

exports.batchDisableEmail = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  if (!body.strategyIDs) {
    const err = new Error('strategyIDs is require')
    err.status = 400
    throw err
  }
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const response = yield api.createBy([cluster, 'alerts/strategies/batch-disable-email'], null, body)
  this.body = response
}

exports.setIgnore = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  if (!body.strategies) {
    const err = new Error('strategies is require')
    err.status = 200
    throw err
  }
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const response = yield api.createBy([cluster, 'alerts/strategies/batch-ingore'], null, body)
  this.body = response
}


// host cpu and memory used
exports.getTargetInstant = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  //node or pod
  const type = this.params.type
  const name = this.query.name
  const strategyName = this.params.name
  if (!name) {
    const err = new Error('name is require')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi(loginUser)
  const reqArray = []
  let cpu = {
    targetType: type,
    type: 'cpu/usage_rate',
    source: 'prometheus'
  }
  let mem = {
    targetType: type,
    type: 'memory/usage',
    source: 'prometheus'
  }
  let tx_rage = {
    targetType: type,
    type: 'network/tx_rate',
    source: 'prometheus'
  }
  let rx_rate = {
    targetType: type,
    type: 'network/rx_rate',
    source: 'prometheus'
  }
  reqArray.push(api.getBy([cluster, 'metric', name, 'metric/instant'], cpu))
  reqArray.push(api.getBy([cluster, 'metric', name, 'metric/instant'], mem))
  reqArray.push(api.getBy([cluster, 'metric', name, 'metric/instant'], tx_rage))
  reqArray.push(api.getBy([cluster, 'metric', name, 'metric/instant'], rx_rate))
  if(type == 'node'){
    let disk = {
      targetType: type,
      type: 'disk/usage',
      source: 'prometheus'
    }

    let tcp_listen = {
      targetType: type,
      type: 'tcp/listen_state',
      source: 'prometheus'
    }
    let tcp_est = {
      targetType: type,
      type: 'tcp/est_state',
      source: 'prometheus'
    }
    let tcp_close = {
      targetType: type,
      type: 'tcp/close_wait_state',
      source: 'prometheus'
    }
    let tcp_time = {
      targetType: type,
      type: 'tcp/time_wait_state',
      source: 'prometheus'
    }
    reqArray.push(api.getBy([cluster, 'metric', name, 'metric/instant'], disk))
    reqArray.push(api.getBy([cluster, 'metric', name, 'metric/instant'], tcp_listen))
    reqArray.push(api.getBy([cluster, 'metric', name, 'metric/instant'], tcp_est))
    reqArray.push(api.getBy([cluster, 'metric', name, 'metric/instant'], tcp_close))
    reqArray.push(api.getBy([cluster, 'metric', name, 'metric/instant'], tcp_time))
  }
  const results = yield reqArray
  let totalMemoryByte = 0
  if (type == 'node') {
    const clusterSummary = yield api.getBy([cluster, 'nodes', name])
    if (clusterSummary.data.objectMeta) {
      totalMemoryByte = clusterSummary.data.memory_total_kb * 1024
    } else {
      const err = new Error('the node is not exist')
      err.status = 400
      throw err
    }
  }
  if (type == 'service') {
    const podSummary = yield api.getBy([cluster, 'services', name])
    if (podSummary.data[name]) {
      const deployment = podSummary.data[name].deployment
      const replicas = deployment.spec.replicas
      const containers = deployment.spec.template.spec.containers
      containers.forEach(container => {
        let memory = container.resources.requests.memory
        memory = memory.toLowerCase()
        if (memory.indexOf('gi') > 0) {
          memory = parseInt(memory) * 1024 * 1024 * 1024
        } else if (memory.indexOf('mi') > 0) {
          memory = parseInt(memory) * 1024 * 1024
        } else if (memory.indexOf('ki') > 0) {
          memory = parseInt(memory) * 1024
        }
        totalMemoryByte += memory
      })
      totalMemoryByte = replicas * totalMemoryByte
    } else {
      const err = new Error('the pod is not exist')
      err.status = 400
      throw err
    }
  }
  const memory = [
    results[1].data[name],
    totalMemoryByte,
    parseFloat(results[1].data[name] / totalMemoryByte).toFixed(4)
  ]

  this.body = {
    [strategyName]: {
      cpus: results[0].data[name],
      memory: memory,
      tx_rate: results[2].data[name],
      rx_rate: results[3].data[name],
      disk: results[4] ? results[4].data[name] : null,
      tcpListen: results[5] ? results[5].data[name] : null,
      tcpEst: results[6] ? results[6].data[name] : null,
      tcpClose: results[7] ? results[7].data[name] : null,
      tcpTime: results[8] ? results[8].data[name] : null
    }
  }
}

exports.deleteRule = function* () {
  const cluster = this.params.cluster
  const queryBody = this.query
  if (!queryBody.ruleNames || !queryBody.strategyID) {
    const err = new Error('ruleNames, strategyID is require')
    err.status = 400
    throw err
  }
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const response = yield api.deleteBy([cluster, 'alerts/rules'], queryBody)
  this.body = response
}


function switchType(item) {
  switch (item.type) {
    case 'cpu/usage_rate':
      item.type = 'CPU'
      return
    case 'memory/usage':
      item.type = '内存'
      return
    case 'network/tx_rate':
      item.type = '上传流量'
      return
    case 'network/rx_rate':
      item.type = '下载流量'
      return
    default:
      return
  }
}

// 未安装插件 --> 404
exports.getLogAlertPluginStatus = function* () {
  const user = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(user)
  const response = yield api.getBy([cluster, 'alerts', 'logsalert', 'checkplugin' ])
  this.body = response
}
