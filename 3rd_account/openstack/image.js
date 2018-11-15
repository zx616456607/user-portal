

/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 *
 * v0.1 - 2018-10-10
 * @author YangYuBiao
 */

'use strict'

const parse = require('co-busboy')
const common = require('./common')
const wrapHandler = common.wrapHandler
const imageUrl = () => {
  let openstackConfig = globalConfig.openstack.config
  return `${openstackConfig.protocol}://${openstackConfig.host}:${openstackConfig.glance}`
}

exports.uploadImage = wrapHandler(function* (send) {
  const requestBody = yield getFormData(this)
  const requestUrl = `${imageUrl()}/v2/images`
  const createImageResult = yield send(requestUrl, requestBody.field)
  yield send(requestUrl + `/${createImageResult.imageID}/file`, {
    stream: file,
    method: 'PUT',
    headers: {
      ['Content-Type']: 'application/octet-stream' //official doc recommends that content-type set application/octet-stream
    }
  })
  this.body = createImageResult
})

exports.getImageList = wrapHandler(function* (send) {
  const result = yield getImageList.call(this, send, '/v2/images', {
    images: []
  })
  this.body = result
})

exports.getImageDetail = wrapHandler(function* (send) {
  const imageID = this.params.imageID
  const requestUrl = `${imageUrl()}/v2/images` + `/${imageID}`
  const result = yield send(requestUrl)
  this.body = result
})

exports.deleteImage = wrapHandler(function* (send) {
  const imageID = this.params.imageID
  const requestUrl = `${imageUrl()}/v2/images` + `/${imageID}`
  const result = yield send(requestUrl, {
    method: 'DELETE'
  })
  this.body = result
})

function* getImageList(send, url, result) {
  const requestUrl = `${imageUrl()}` + url
  const tmp = yield send(requestUrl, {
    data: this.query,
    dataAsQueryString: true,
    method: 'GET'
  })
  if (tmp) {
    result.images = result.images.concat(tmp.images)
    if (tmp.next) {
      yield getImageList.call(this, send, tmp.next, result)
    }
  }
  return result
}


function* getFormData(ctx) {
  const requestBody = {
    field: {},
    stream: []
  }
  const stream = []
  const parts = parse(ctx, {
    autoFields: true,
    checkFile: function (fieldname, file, filename) {
      requestBody.stream.push(file)
    },
    checkField: function (name, value) {
      requestBody.field[name] = value
    }
  })
  yield parts
  return requestBody
}
