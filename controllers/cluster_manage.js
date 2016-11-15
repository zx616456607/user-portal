/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Cluster manage controller
 *
 * v0.1 - 2016-11-12
 * @author Zhangpc
 */
'use strict'

const apiFactory = require('../services/api_factory')
const constants = require('../constants')
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE

exports.getClusters = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let filter = query.filter
  if (isNaN(page) || page < DEFAULT_PAGE) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  let from = size * (page - 1)
  if (size == -1) {
    from == -1
  }
  let queryObj = { from, size }
  if (from == 0 && size == 0) {
    queryObj = {}
  }
  if (filter) {
    queryObj.filter = filter
  }
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.get(queryObj)
  const clusters = result.clusters || []
  this.body = {
    data: clusters,
    total: result.listMeta.total,
    count: result.listMeta.size
  }
}
