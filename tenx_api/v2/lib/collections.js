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
  const _getPaths = Symbol('_getPaths')
  const _getQuerys = Symbol('_getQuerys')

  class Collections {
    constructor(collection) {
      this[_getPaths] = function() {
        let endpoint = [].slice.call(arguments).filter((each) => {
          return each !== null && each !== undefined && each.trim() !== ''
        }).join('/')
        if (endpoint) {
          endpoint = '/' + endpoint
        }
        return `/${collection}${endpoint}`
      }
      this[_getQuerys] = (object) => {
        let querys = ''
        if (!object) {
          return querys
        }
        Object.keys(object).forEach((key) => {
          if (object.hasOwnProperty(key)) {
            querys += `&${key}=${object[key]}`
          }
        })
        return `?${querys.substring(1)}`
      }
    }

    get(querys, callback) {
      let endpoint = this[_getPaths]() + this[_getQuerys](querys)
      return request({
        endpoint,
        method: 'GET'
      }, callback)
    }

    getBy(paths, querys, callback) {
      let endpoint = this[_getPaths].apply(null, paths) + this[_getQuerys](querys)
      return request({
        endpoint,
        method: 'GET'
      }, callback)
    }

    create(data, callback) {
      let endpoint = this[_getPaths]()
      return request({
        endpoint,
        data,
        method: 'POST'
      }, callback)
    }

    createBy(paths, querys, data, callback) {
      let endpoint = this[_getPaths].apply(null, paths) + this[_getQuerys](querys)
      return request({
        endpoint,
        data,
        method: 'POST'
      }, callback)
    }

    update(id, data, callback) {
      let endpoint = this[_getPaths](id)
      return request({
        endpoint,
        data,
        method: 'PUT'
      }, callback)
    }

    updateBy(paths, querys, data, callback) {
      let endpoint = this[_getPaths].apply(null, paths) + this[_getQuerys](querys)
      return request({
        endpoint,
        data,
        method: 'PUT'
      }, callback)
    }

    delete(id, callback) {
      let endpoint = this[_getPaths](id)
      return request({
        endpoint,
        method: 'DELETE'
      }, callback)
    }

    deleteBy(paths, querys, callback) {
      let endpoint = this[_getPaths].apply(null, paths) + this[_getQuerys](querys)
      return request({
        endpoint,
        method: 'DELETE'
      }, callback)
    }

    batchDelete() {
      return this.create.apply(this, arguments)
    }

    batchDeleteBy() {
      return this.createBy.apply(this, Array.prototype.slice.apply(arguments))
    }

    uploadFile(paths, querys, stream, callback) {
      let endpoint = this[_getPaths].apply(null, paths) + this[_getQuerys](querys)
      console.log(endpoint)
      return request({
        endpoint,
        stream,
        method: 'POST'
      })
    }
  }
  
  this.create = (collection) => new Collections(collection)
}