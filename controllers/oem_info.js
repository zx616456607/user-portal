'use strict'

const apiFactory = require('../services/api_factory')
const oemInfoSvc = require('../services/oem_info')

exports.getOEMInfo = function* () {
  const globalConfig = global.globalConfig
  this.body = globalConfig.oemInfo
}

exports.updateLogo = function* () {
  const loginUser = this.session.loginUser
  const format = this.query.format
  const key = this.query.key
  const media = this.request.body
  const api = apiFactory.getOemInfoApi(loginUser)
  const result = yield api.createBy(['logo', format], null, media)
  const id = result.data.id
  yield api.updateBy(['info'], null, {[key]: {type: 'blobs', id, format}})
  yield oemInfoSvc.updateOEMInfoImage(key, media, format)
  this.body = {id}
}

exports.updateText = function* () {
  const loginUser = this.session.loginUser
  const info = this.request.body
  const api = apiFactory.getOemInfoApi(loginUser)
  const result = yield api.updateBy(['info'], null, info)
  oemInfoSvc.updateOEMInfo(info)
  this.body = result.data
}
