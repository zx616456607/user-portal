/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

'use strict'

const apiFactory = require('./api_factory.js')
const logger = require('../utils/logger').getLogger('loadOEMInfo')
const fs = require('fs')
const oem = apiFactory.getTenxSysSignSpi().oem

const naviExpand = 'naviExpand'
const naviShrink = 'naviShrink'
const loginLogo = 'loginLogo'
const favoriteIcon = 'favoriteIcon'
const root = global.__root__dirname
const staticRefPath = '/static'
const staticFullPath = `${root}${staticRefPath}`

exports.naviExpand = naviExpand
exports.naviShrink = naviShrink
exports.loginLogo = loginLogo
exports.favoriteIcon = favoriteIcon

const defaultMedias = {
  [naviExpand]: 'img/sider/logo.svg',
  [naviShrink]: 'img/sider/LogInLogo.svg',
  [loginLogo]: 'img/TopLogo.svg',
  [favoriteIcon]: 'favicon.ico',
}

exports.location = defaultMedias

let globalConfig = global.globalConfig
const medias = Object.getOwnPropertyNames(defaultMedias)

exports.initOEMInfo = initOEMInfo

function* initOEMInfo() {
  const result = yield oem.get()
  const info = result.data
  if (!info) {
    logger.error("oem info not found")
    return
  }
  let files = {}
  yield saveFiles(info, files)
  mergeToGlobalConfig(info, files)
}

function* doSaveOneFile(id, fullPath) {
  const content = yield oem.getBy(["media", id], null, {dataType: 'buffer'})
  yield writeFile(fullPath, content)
}

function* saveOneFile(file, media, files) {
  let path = ""
  if (file.type === 'blobs') {
    const name = mediaName(file.format, media)
    yield doSaveOneFile(file.id, fullPath(name))
    path = name
  } else if (file.type === 'static-file') {
    path = defaultMedias[media]
  }
  files[media] = path
}

function mediaName(format, media) {
  if (media === favoriteIcon) {
    return defaultMedias.favoriteIcon
  }
  return makeRandomName(format)
}

function* saveFiles(info, files) {
  yield medias.map(
    media => saveOneFile(info[media], media, files))
}

function mergeToGlobalConfig(info, files) {
  globalConfig.oemInfo = Object.assign({}, files, {company: info.company}, {colorThemeID: info.colorThemeID})
}

function makeRandomName(format) {
  const name = genRandomString(5)
  return `blob/${name}.${format}`
}

function fullPath(fileName) {
  return `${staticFullPath}/${fileName}`
}

exports.updateOEMInfoImage = updateOEMInfoImage

function* updateOEMInfoImage(key, content, format) {
  const old = globalConfig.oemInfo[key]
  const isDefault = old === defaultMedias[key]
  const name = mediaName(format, key)
  yield writeFile(fullPath(name), content)
  globalConfig.oemInfo[key] = name
  if (!isDefault) {
    yield deleteFile(fullPath(old))
  }
}

exports.updateOEMInfo = updateOEMInfo

function updateOEMInfo(info) {
  const old = globalConfig.oemInfo
  globalConfig.oemInfo = Object.assign({}, old, info)
}

function genRandomString(len) {
  const DEFAULT_TOKEN = '0123456789qwertyuioplkjhgfdsazxcvbnmABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&'
  const MAX_LEN = 64
  len = len > MAX_LEN ? MAX_LEN : len
  let randomStr = ''
  for (let i = 0; i < len; i++) {
    randomStr += DEFAULT_TOKEN.charAt(Math.ceil(Math.random() * 100000000) % DEFAULT_TOKEN.length)
  }
  return randomStr
}

function* writeFile(path, content) {
  return new Promise((resolve, reject) =>
    fs.writeFile(path, content, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    }))
}

function* deleteFile(path) {
  return new Promise((resolve, reject) =>
    fs.unlink(path, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  )
}
