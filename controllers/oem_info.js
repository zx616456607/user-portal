/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

'use strict'

const parse = require('co-busboy')
const apiFactory = require('../services/api_factory')
const oemInfoSvc = require('../services/oem_info')

exports.getOEMInfo = function*() {
  const globalConfig = global.globalConfig
  this.body = globalConfig.oemInfo
}

exports.updateLogo = function*() {
  const loginUser = this.session.loginUser
  const content = yield parseForm(this)
  const format = this.field.format
  const key = this.field.key
  const api = apiFactory.getOemInfoApi(loginUser)
  const result = yield api.createBy(['logo', format], null, content)
  const id = result.data.id
  yield api.updateBy(['info'], null, {[key]: {type: 'blobs', id, format}})
  yield oemInfoSvc.updateOEMInfoImage(key, content, format)
  this.body = {id}
}

exports.updateText = function*() {
  const loginUser = this.session.loginUser
  const info = this.request.body
  const api = apiFactory.getOemInfoApi(loginUser)
  const result = yield api.updateBy(['info'], null, info)
  oemInfoSvc.updateOEMInfo(info)
  this.body = result.data
}

function* parseForm(ctx) {
  const parts = parse(ctx, {autoFields: true})
  const fileStream = yield parts
  return new Promise((resolve, reject) => {
    ctx.field = parts.field
    try {
      let buffer = []
      fileStream.on('data', chunk => buffer.push(chunk))
      fileStream.on('end', () => resolve(Buffer.concat(buffer)))
    } catch (err) {
      reject(err)
    }
  })
}