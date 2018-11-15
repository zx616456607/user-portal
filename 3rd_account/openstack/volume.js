
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 *
 * v0.1 - 2017-07-14
 * @author YangYuBiao
 */

'use strict'

const find = require('lodash/find')
const common = require('./common')
const wrapHandler = common.wrapHandler
const letterMap = 'abcdefghijklmnopqrstuvwxyz'
const baseURl = () => {
  let openstackConfig = globalConfig.openstack.config
  return `${openstackConfig.protocol}://${openstackConfig.host}:${openstackConfig.volumePort}/v3`
}
const getServerRequestUrl = (path) => {
  let openstackConfig = globalConfig.openstack.config
  return common.getRequestUrl(`${openstackConfig.protocol}://${openstackConfig.host}:${openstackConfig.nova}${path}`)
}
const defaultSize = 1024

exports.getVolumeTypes = wrapHandler(function* (send) {
  const { openstack } = this.session.loginUser
  const requestUrl = `${openstackConfig.protocol}://${openstackConfig.host}:${openstackConfig.volumePort}/v3/${openstack.withProject.currentProjectID}/types`
  const result = yield send(requestUrl, {
    data: this.query,
    dataAsQueryString: true,
    method: 'GET'
  })
  this.body = result
})

exports.getVolumes = wrapHandler(function* (send) {
  const { openstack } = this.session.loginUser
  const requestUrl = `${baseUrl()}/${openstack.withProject.currentProjectID}/volumes/detail`
  const result = yield send(requestUrl, {
    data: this.query,
    dataAsQueryString: true,
    method: 'GET'
  })
  const volumes = result.volumes
  let servers = yield send(getServerRequestUrl(`/v2/${openstack.withProject.currentProjectID}/servers/detail`))
  if (servers.servers) {
    servers = servers.servers
  } else {
    servers = []
  }
  if (volumes && volumes.length > 0) {
    volumes.forEach(volume => {
      if (volume.attachments.length > 0) {
        volume.attachments.forEach(item => {
          const server = find(servers, (i) => i.id == item.server_id)
          if (server) {
            item.server_name = server.name
            item.extend = server
          }
        })
      }
    })
  }
  this.body = result
})

exports.createVolumes = wrapHandler(function* (send) {
  const { openstack } = this.session.loginUser
  const body = this.request.body
  if (!body.size && body.size < 0) {
    const err = new Error('The size must more than 0')
    err.status = 401
    throw err
  }
  if (body.size > defaultSize) {
    const err = new Error('The size must less than 1024')
    err.status = 401
    throw err
  }
  const requestUrl = `${baseUrl()}/${openstack.withProject.currentProjectID}/volumes`
  const result = yield send(requestUrl, {
    data: {
      volume: this.request.body
    },
    method: 'POST'
  })
  this.body = result
})

exports.updateVolumes = wrapHandler(function* (send) {
  const { openstack } = this.session.loginUser
  const volumeID = this.params.volumeID
  const requestUrl = `${baseUrl()}/${openstack.withProject.currentProjectID}/volumes/${volumeID}`
  const result = yield send(requestUrl, {
    data: {
      volume: this.request.body
    },
    method: 'PUT'
  })
  this.body = result
})

exports.deleteVolumes = wrapHandler(function* (send) {
  const { openstack } = this.session.loginUser
  const volumeID = this.params.volumeID
  const requestUrl = `${baseUrl()}/${openstack.withProject.currentProjectID}/volumes/${volumeID}`
  const result = yield send(requestUrl, {
    method: 'DELETE'
  })
  this.body = result
})


exports.volumeAction = wrapHandler(function* (send) {
  const { openstack } = this.session.loginUser
  const actions = ['resize', 'detach', 'attach']
  const action = this.params.action
  const volumeID = this.params.volumeID
  const requestUrl = `${baseUrl()}/${openstack.withProject.currentProjectID}/volumes/${volumeID}/action`
  const body = this.request.body
  if (actions.indexOf(action) < 0) {
    const err = new Error(`The action ${actions} is not support`)
    err.status = 400
    throw err
  }
  if (action == 'resize') {
    if (!body.size && body.size < 0) {
      const err = new Error('The size must more than 0')
      err.status = 401
      throw err
    }
    if (body.size > defaultSize) {
      const err = new Error('The size must less than 1024')
      err.status = 401
      throw err
    }
    const resizeReuslt = yield send(requestUrl, {
      method: 'POST',
      data: {
        'os-extend': {
          'new_size': body.size
        }
      }
    })
    this.body = resizeReuslt
    return
  }
  if (action == 'attach') {
    const attachUrl = `${openstackConfig.protocol}://${openstackConfig.host}:${openstackConfig.serverPort}/v2/servers/${body.instance_uuid}/os-volume_attachments`
    if (!body.instance_uuid) {
      const err = new Error(`instance_uuid is require`)
      err.status = 400
      throw err
    }
    const serverAttach = yield send(attachUrl)
    const volumeAttachments = serverAttach.volumeAttachments
    let mountPoint = '/dev/vdb'
    let nextMount = 'b'
    const start = 97
    if (volumeAttachments.length > 0) {
      let lastMount = volumeAttachments[volumeAttachments.length - 1].device
      lastMount = lastMount.substr(lastMount.length - 1, 1).charCodeAt(0)
      nextMount = lastMount + 1 - start
      nextMount = letterMap.charAt(nextMount)
      mountPoint = `/dev/vd${nextMount}`
    }
    const attachResult = yield send(attachUrl, {
      method: 'POST',
      data: {
        'volumeAttachment': {
          instance_uuid: body.instance_uuid,
          device: mountPoint,
          volumeId: volumeID
        }
      }
    })
    this.body = attachResult
    return
  }
  if (action == 'detach') {
    if (!body.instance_uuid) {
      const err = new Error('instance_uuid is require')
      err.status = 400
      throw err
    }
    const attachUrl = `${openstackConfig.protocol}://${openstackConfig.host}:${openstackConfig.serverPort}/v2/servers/${body.instance_uuid}/os-volume_attachments/${volumeID}`
    const detachResult = yield send(attachUrl, {
      method: 'DELETE',
    })
    this.body = detachResult
    return
  }
})


exports.createVolumesSnapshot = wrapHandler(function* (send) {
  const { openstack } = this.session.loginUser
  const requestUrl = `${baseUrl()}/${openstack.withProject.currentProjectID}/snapshots`
  const body = this.request.body
  const result = yield send(requestUrl, {
    method: 'POST',
    data: {
      snapshot: {
        name: body.name,
        description: body.description,
        volume_id: body.volume_id
      }
    }
  })
  this.body = result
})


exports.getSnapshotList = wrapHandler(function* (send) {
  const { openstack } = this.session.loginUser
  let requestUrl = `${baseUrl()}/${openstack.withProject.currentProjectID}/snapshots/detail`
  const result = yield send(requestUrl, {
    method: 'GET',
    data: this.query,
    dataAsQueryString: true
  })
  if (result.snapshots && result.snapshots.length > 0) {
    requestUrl = `${baseUrl()}/${openstack.withProject.currentProjectID}/volumes/detail`
    let volumes = yield send(requestUrl)
    volumes = volumes.volumes || []
    result.snapshots.forEach(item => {
      item.volume = find(volumes, (e) => e.id == item.volume_id)
    })
  }
  this.body = result
})

exports.deleteSnapshot = wrapHandler(function* (send) {
  const { openstack } = this.session.loginUser
  const snapshotID = this.params.snapshotID
  const requestUrl = `${baseUrl()}/${openstack.withProject.currentProjectID}/snapshots/${snapshotID}`
  const result = yield send(requestUrl, {
    method: 'DELETE'
  })
  this.body = result
})
