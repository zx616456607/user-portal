
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 *
 * v0.1 - 2018-10-10
 * @author YangYuBiao
 */

'use strict'

const common = require('./common')
const wrapHandler = common.wrapHandler
const getRequestUrl = (path) => {
  let openstackConfig = globalConfig.openstack.config
  return `${openstackConfig.protocol}://${openstackConfig.host}:${openstackConfig.nova}${path}`
}
const find = require('lodash/find')
const baseUrl = () => {
  let openstackConfig = globalConfig.openstack.config
  return `${openstackConfig.protocol}://${openstackConfig.host}`
}

exports.getServerList = wrapHandler(function* (send) {
  const { openstack } = this.session.loginUser
  let requestUrl = getRequestUrl(`/v2/${openstack.withProject.currentProjectID}/servers/detail`)
  const options = {
    dataAsQueryString: true,
    method: 'GET'
  }
  options.data = this.query
  const result = yield send(requestUrl, options)
  if (result.servers && result.servers.length > 0) {
    requestUrl = getRequestUrl(`/v2/${openstack.withProject.currentProjectID}/flavors/detail`)
    let flavors = yield send(requestUrl, {
      method: 'GET'
    })
    flavors = flavors.flavors || []
    result.servers.forEach((element) => {
      element.flavor = find(flavors, (e) => e.id == element.flavor.id)
    });
  }
  this.body = result
})

exports.getFlavorList = wrapHandler(function* (send) {
  const requestUrl = getRequestUrl(`/v2/flavors/detail`)
  const result = yield send(requestUrl, {
    data: this.query,
    dataAsQueryString: true,
    method: 'GET'
  })
  this.body = result
})

exports.createFlavor = wrapHandler(function* () {
  const requestUrl = getRequestUrl(`/v2/flavors`)
  const result = yield send(requestUrl, {
    data: this.request.body,
    method: 'POST'
  })
  this.body = result
})

exports.deleteFlavor = wrapHandler(function* () {
  const requestUrl = getRequestUrl(`/v2/flavors/${this.params.falvorID}`)
  const result = yield send(requestUrl, {
    method: 'DELETE'
  })
  this.body = result
})



exports.getAZList = wrapHandler(function* (send) {
  const { openstack } = this.session.loginUser
  const requestUrl = getRequestUrl(`/v2/${openstack.withProject.currentProjectID}/os-availability-zone`)
  const result = yield send(requestUrl, {
    data: this.query,
    dataAsQueryString: true,
    method: 'GET'
  })
  this.body = result
})

exports.createServer = wrapHandler(function* (send) {
  const body = this.request.body
  const requestBody = {
    server: body
  }
  if (body.availability_zone) {
    requestBody.server.availability_zone = body.availability_zone
  }
  const { openstack } = this.session.loginUser
  const requestUrl = getRequestUrl(`/v2/${openstack.withProject.currentProjectID}/servers`)
  const result = yield send(requestUrl, {
    data: requestBody,
    method: 'POST'
  })
  this.body = result
})

exports.getServerByID = wrapHandler(function* (send) {
  const serverID = this.params.ID
  const { openstack } = this.session.loginUser
  const projectID = openstack.withProject.currentProjectID
  let requestUrl = getRequestUrl(`/v2/${projectID}/servers/${serverID}`)
  const result = yield send(requestUrl)
  if (result.server) {
    requestUrl = getRequestUrl(`/v2/${projectID}/flavors/detail`)
    let flavors = yield send(requestUrl, {
      method: 'GET'
    })
    flavors = flavors.flavors || []
    result.server.flavor = find(flavors, (e) => e.id == result.server.flavor.id)
  }
  this.body = result
})

exports.deleteByServerID = wrapHandler(function* (send) {
  const serverID = this.params.ID
  const { openstack } = this.session.loginUser
  const requestUrl = getRequestUrl(`/v2/${openstack.withProject.currentProjectID}/servers/${serverID}`)
  const result = yield send(requestUrl, {
    method: 'DELETE'
  })
  this.body = result
})

exports.renameServer = wrapHandler(function* (send) {
  const newName = this.params.newName
  const serverID = this.params.ID
  const { openstack } = this.session.loginUser
  const requestUrl = getRequestUrl(`/v2/${openstack.withProject.currentProjectID}/servers/${serverID}`)
  const result = yield send(requestUrl, {
    method: 'PUT',
    data: {
      server: {
        name: newName
      }
    }
  })
  this.body = result
})

exports.getCPUUsageByServerID = wrapHandler(function* (send) {
  const serverID = this.params.ID
  //period 目前仅支持 60 300 900 72000 86400
  const period = this.query.period || 60
  const requestUrl = `${baseUrl()}:${openstackConfig.metersPort}/v2/meters/cpu_util/statistics?q.field=resource_id&q.op=eq&q.type=&q.value=${serverID}&period=${period}`
  const result = yield send(requestUrl)
  this.body = { meters: result }
})

exports.getMemoryUsageByServerID = wrapHandler(function* (send) {
  const serverID = this.params.ID

  //period 目前仅支持 60 300 900 72000 86400
  const period = this.query.period || 60
  const requestUrl = `${baseUrl()}:${openstackConfig.metersPort}/v2/meters/memory.usage/statistics?q.field=resource_id&q.op=eq&q.type=&q.value=${serverID}&period=${period}`
  const result = yield send(requestUrl)
  this.body = { meters: result }
})

exports.getDiskReadBytesRateByServerID = wrapHandler(function* (send) {
  const serverID = this.params.ID

  //period 目前仅支持 60 300 900 72000 86400
  const period = this.query.period || 60
  const requestUrl = `${baseUrl()}:${openstackConfig.metersPort}/v2/meters/disk.read.bytes.rate/statistics?q.field=resource_id&q.op=eq&q.type=&q.value=${serverID}&period=${period}`
  const result = yield send(requestUrl)
  this.body = { meters: result }

})

exports.getDiskWriteBytesRateByServerID = wrapHandler(function* (send) {
  const serverID = this.params.ID

  //period 目前仅支持 60 300 900 72000 86400
  const period = this.query.period || 60
  const requestUrl = `${baseUrl()}:${openstackConfig.metersPort}/v2/meters/disk.write.bytes.rate/statistics?q.field=resource_id&q.op=eq&q.type=&q.value=${serverID}&period=${period}`
  const result = yield send(requestUrl)
  this.body = { meters: result }
})

exports.getIncomingBytesRateByVMID = wrapHandler(function* (send) {
  const { openstack } = this.session.loginUser
  const resourceUrl = `${baseUrl()}:${openstackConfig.metersPort}/v2/resources?q.field=project&q.op=eq&q.type=&q.value=${openstack.withProject.currentProjectID}&&q.field=metadata.instance_id&q.op=eq&q.value=${VMID}`

  const resource = yield send(resourceUrl)
  if (!resource) {
    this.body = { meters: [] }
    return
  }
  let instance = find(resource, (item) => item.metadata.vnic_name)
  if (!instance) {
    this.body = { meters: [] }
    return
  }
  //period 目前仅支持 60 300 900 72000 86400
  const period = this.query.period || 60
  const requestUrl = `${baseUrl()}:${openstackConfig.metersPort}/v2/meters/network.incoming.bytes.rate/statistics?q.field=resource_id&q.op=eq&q.type=&q.value=${instance.resource_id}&period=${period}`
  const result = yield send(requestUrl)
  this.body = { meters: result }
})

exports.getOutgoingBytesRateByVMID = wrapHandler(function* (send) {
  const { openstack } = this.session.loginUser
  const resourceUrl = `${baseUrl()}:${openstackConfig.metersPort}/v2/resources?q.field=project&q.op=eq&q.type=&q.value=${openstack.withProject.currentProjectID}&&q.field=metadata.instance_id&q.op=eq&q.value=${VMID}`

  const resource = yield send(resourceUrl)
  if (!resource) {
    this.body = { meters: [] }
    return
  }
  let instance = find(resource, (item) => item.metadata.vnic_name)
  if (!instance) {
    this.body = { meters: [] }
    return
  }
  //period 目前仅支持 60 300 900 72000 86400
  const period = this.query.period || 60
  const requestUrl = `${baseUrl()}:${openstackConfig.metersPort}/v2/meters/network.outgoing.bytes.rate/statistics?q.field=resource_id&q.op=eq&q.type=&q.value=${instance.resource_id}&period=${period}`
  const result = yield send(requestUrl)
  this.body = { meters: result }
})


exports.updateServer = wrapHandler(function* (send) {
  const actions = ['start', 'stop', 'resize', 'getvnc', 'migrate', 'migrateLive', 'confirm', 'revert']
  let action = this.params.action
  const serverID = this.params.ID
  const { openstack } = this.session.loginUser
  if (actions.indexOf(action) < 0) {
    const err = new Error("Doesn't support action")
    err.status = 400
    throw err
  }

  const requestUrl = getRequestUrl(`/v2/${openstack.withProject.currentProjectID}/servers/${serverID}/action`)
  if (action == 'resize') {
    const body = this.request.body
    if (!body || !body.resize) {
      const err = new Error('resize is require')
      err.status = 400
      throw err
    }
    let result = yield send(requestUrl, {
      method: 'POST',
      data: {
        resize: body.resize
      }
    })
    this.body = result
    return
  }
  if (action == 'getvnc') {
    const result = yield send(requestUrl, {
      method: 'POST',
      data: {
        'os-getVNCConsole': {
          type: 'novnc'
        }
      }
    })
    this.body = result
    return
  }
  if (action == 'migrate') {
    const body = this.request.body
    if (!body.migrate) {
      const err = new Error('migrate is require')
      err.status = 400
      throw err
    }
    const result = yield send(requestUrl, {
      method: 'POST',
      data: {
        migrate: body.migrate
      }
    })
    this.body = result
    return
  }
  if (action == 'migrateLive') {
    const body = this.request.body
    if (!body.migrate) {
      const err = new Error('migrate is require')
      err.status = 400
      throw err
    }
    const result = yield send(requestUrl, {
      method: 'POST',
      data: {
        'os-migrateLive': body.migrate
      }
    })
    this.body = result
    return

  }
  if (action == 'confirm') {
    const requestUrl = getRequestUrl(`/v2/${openstack.withProject.currentProjectID}/servers/${serverID}/action`)
    let result = yield send(requestUrl, {
      method: 'POST',
      data: {
        "confirmResize": null
      }
    })
    this.body = result
    return
  }
  if (action == 'revert') {
    const requestUrl = getRequestUrl(`/v2/${openstack.withProject.currentProjectID}/servers/${serverID}/action`)
    let result = yield send(requestUrl, {
      method: 'POST',
      data: {
        "revertResize": null
      }
    })
    this.body = result
    return
  }
  action = action == 'start' ? 'os-start' : 'os-stop'
  const result = yield send(requestUrl, {
    method: 'POST',
    data: {
      [action]: null
    }
  })
  this.body = result
})


exports.getResourceInfo = wrapHandler(function* (send) {
  const { openstack } = this.session.loginUser
  const requestUrl = getRequestUrl(`/v2/${openstack.withProject.currentProjectID}/os-hypervisors/statistics`)
  const result = yield send(requestUrl)
  this.body = result
})

