/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/*
 * Permission controller
 *
 * v0.1 - 2017-06-07
 * @author lijunbao
*/

'use strict'

const apiFactory = require('../services/api_factory')
const logger = require('../utils/logger.js').getLogger("permission")

exports.list = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter
  const api = apiFactory.getPermissionApi(loginUser)
  const result = yield api.get(query)
  this.body = {
    data: result
  }
}
exports.get = function* () {
  const id = this.params.id
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter
  const api = apiFactory.getPermissionApi(loginUser)
  const result = yield api.getBy([id, 'retrieve'], query)
  this.body = {
    data: result
  }
}

exports.listWithCount = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter
  const api = apiFactory.getPermissionApi(loginUser)
  const result = yield api.getBy(['withCount'], query)
  this.body = {
    data: result
  }
}

exports.getAllDependent = function* () {
  const id = this.params.id
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter
  const api = apiFactory.getPermissionApi(loginUser)
  const result = yield api.getBy([id, 'dependent'], query)
  this.body = {
    data: result
  }
}

exports.listResourceOperations = function* () {
  const api = apiFactory.getPermissionApi(this.session.loginUser)
  const result = yield api.getBy(['resource-operations'])
  this.body = {
    data: result.data
  }
}

exports.getAccessControlsOfRole = function* () {
  const api = apiFactory.getPermissionApi(this.session.loginUser)
  const result = yield api.getBy(['access-controls'], this.query)
  this.body = {
    data: result.data
  }
}

exports.setAccessControlsForRole = function* () {
  const api = apiFactory.getPermissionApi(this.session.loginUser)
  const result = yield api.createBy(['access-controls'], null, this.request.body)
  this.body = {
    data: result.data
  }
}

exports.removeAccessControlsFromRole = function* () {
  const api = apiFactory.getPermissionApi(this.session.loginUser)
  const result = yield api.deleteBy(['access-controls', this.params.ruleIds])
  this.body = {
    data: result.data
  }
}

function* getAcls(roleId, clusterId, api, keys) {
  const length = keys.length
  const mapping = {}
  const requests = []
  for (let i = 0; i < length; ++i) {
    const key = keys[i]
    mapping[key] = i
    requests.push(api.getBy(['access-controls'], {roleId, clusterId, resourceType: key}))
  }
  const result = yield requests
  const acls = {}
  for (let i = 0; i < length; ++i) {
    const key = keys[i]
    const index = mapping[key]
    acls[key] = result[index].data
  }
  return acls
}

function groupByFilterType(acls) {
  const result = {
    fixed: [],
    regex: []
  }
  const length = acls.length
  for (let i = 0; i < length; ++i) {
    const acl = acls[i]
    const filterType = acl.filterType
    if (filterType === 'fixed') {
      result.fixed.push(acl)
    } else if (filterType === 'regex') {
      result.regex.push(acl)
    }
  }
  return result
}

function indexFixedByName(fixeds) {
  const result = {}
  const length = fixeds.length
  for (let i = 0; i < length; ++i) {
    const fixed = fixeds[i]
    const name = fixed.filter
    if (result.hasOwnProperty(name)) {
      result[name].push(fixed)
    } else {
      result[name] = [fixed]
    }
  }
  return result
}

function indexByPermissionId(operations) {
  const result = {}
  const length = operations.length
  for (let i = 0; i < length; ++i) {
    const operation = operations[i]
    result[operation.permissionId] = operation
  }
  return result
}

function handleOneResource(aclOfResource, operations) {
  const acl = groupByFilterType(aclOfResource)
  const resource = {
    operations: indexByPermissionId(operations),
    acls: {
      fixed: indexFixedByName(acl.fixed),
      regex: acl.regex
    }
  }
  const lengthOfAcl = aclOfResource.length
  const resourceOperations = resource.operations
  for (let j = 0; j < lengthOfAcl; ++j) {
    const oneAcl = aclOfResource[j]
    const onePermission = resourceOperations[oneAcl.permissionId]
    if (onePermission.hasOwnProperty('resources')) {
      onePermission.resources.push(oneAcl.filter)
    } else {
      onePermission.resources = [oneAcl.filter]
    }
  }
  return resource
}

exports.overview = function* () {
  const api = apiFactory.getPermissionApi(this.session.loginUser)
  const roleId = this.query.roleId
  const clusterId = this.query.clusterId
  const operationsResponse = yield api.getBy(['resource-operations'])
  const operations = operationsResponse.data
  const keys = Object.getOwnPropertyNames(operations)
  const acls = yield getAcls(roleId, clusterId, api, keys)
  const result = {}
  const length = keys.length
  for (let i = 0; i < length; ++i) {
    const key = keys[i]
    const aclOfResource = acls[key]
    const operationOfResource = operations[key]
    result[key] = handleOneResource(aclOfResource, operationOfResource);
  }
  this.body = result
}
