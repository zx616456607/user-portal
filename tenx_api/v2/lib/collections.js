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

module.exports = function (request){
  let _collection
  const _getPaths = function() {
    let endpoint = [].slice.call(arguments).filter((each) => {
      return each !== null && typeof each !== undefined && each.trim() !== ''
    }).join('/')
    if (endpoint) {
      endpoint = '/' + endpoint
    }
    return `/${_collection}${endpoint}`
  }

  const _getQuerys = (object) => {
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
      _collection = collection
    }

    get(querys, callback) {
      let endpoint = _getPaths() + _getQuerys(querys)
      return request({
        endpoint,
        method: 'GET'
      }, callback)
    }

    getBy(paths, querys, callback) {
      let endpoint = _getPaths.apply(null, paths) + _getQuerys(querys)
      return request({
        endpoint,
        method: 'GET'
      }, callback)
    }

    create(data, callback) {
      let endpoint = _getPaths()
      return request({
        endpoint,
        data,
        method: 'POST'
      }, callback)
    }

    createBy(path, querys, data, callback) {
      let endpoint = _getPaths.apply(null, paths) + _getQuerys(querys)
      return request({
        endpoint,
        data,
        method: 'POST'
      }, callback)
    }

    update(id, data, callback) {
      let endpoint = _getPaths(id)
      return request({
        endpoint,
        data,
        method: 'PUT'
      }, callback)
    }

    updateBy(paths, querys, data, callback) {
      let endpoint = _getPaths.apply(null, paths) + _getQuerys(querys)
      return request({
        endpoint,
        data,
        method: 'PUT'
      }, callback)
    }

    delete(id, callback) {
      let endpoint = _getPaths(id)
      return request({
        endpoint,
        method: 'DELETE'
      }, callback)
    }

    deleteBy(paths, querys, callback) {
      let endpoint = _getPaths.apply(null, paths) + _getQuerys(querys)
      return request({
        endpoint,
        method: 'DELETE'
      }, callback)
    }
  }
  
  this.create = (collection) => new Collections(collection)
}