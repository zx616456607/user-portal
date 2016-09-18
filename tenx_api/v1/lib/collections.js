/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * API function collections
 * 
 * v0.1 - 2016-09-14
 * @author Zhangpc
 */
'use strict'

module.exports = (request) => {
  const _getPaths = function {
    return [].slice.call(arguments).filter((each) => {
      return each !== null && typeof each !== undefined
    }).join('/')
  }

  const _getQuerys = (object) = {
    let querys = ''
    if (!object) {
      return querys
    }
    Object.keys(object).forEach((key) => {
      if (object.hasOwnProperty(key)) {
        querys += `$${key}=${object[key]}`
      }
    })
    return `?${querys.substring(1)}`
  }

  class Collections {
    constructor(collection) {
      this.collection = collection
    }

    get(querys, callback) {
      let endpoint = collection + _getQuerys(querys)
      request({
        endpoint,
        method: 'GET'
      }, callback)
    }

    getBy(paths, querys, callback) {
      let endpoint = collection + _getQuerys(querys)
      paths && (endpoint += `/${paths.join('/')}`)

    }
  }
}