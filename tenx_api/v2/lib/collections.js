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

module.exports = function (request) {
  const _getPaths = Symbol('_getPaths')
  const _getQuerys = Symbol('_getQuerys')

  class Collections {
    constructor(collection) {
      this[_getPaths] = function () {
        let endpoint = [].slice.call(arguments).filter((each) => {
          return each !== null && each !== undefined
        }).join('/')
        if (endpoint) {
          endpoint = '/' + endpoint
        }
        return `/${collection}${endpoint}`
      }
      this[_getQuerys] = (object, sep, eq) => {
        let querys = ''
        sep = sep || '&'
        eq = eq || '='
        if (!object) {
          return querys
        }
        Object.keys(object).forEach((key) => {
          if (Object.hasOwnProperty(key)) {
            querys += `&${key}=${object[key]}`
          }
        })
        querys = Object.keys(object).map(function (k) {
          let ks = encodeURIComponent(stringifyPrimitive(k)) + eq
          if (Array.isArray(object[k])) {
            return object[k].map(function (v) {
              return ks + encodeURIComponent(stringifyPrimitive(v))
            }).join(sep)
          } else {
            return ks + encodeURIComponent(stringifyPrimitive(object[k]))
          }
        }).join(sep)
        function stringifyPrimitive(v) {
          switch (typeof v) {
            case 'string':
              return v
            case 'boolean':
              return v ? 'true' : 'false'
            case 'number':
              return isFinite(v) ? v : ''
            default:
              return ''
          }
        }
        if (querys) {
          return `?${querys}`
        }
        return ``
      }
    }

    /**
     * get method with query
     *
     * @param {Object} querys
     * @param {Object} options
     * @param {Function|Object} callback
     * ```
     * {
     *   dataType: 'text|json|buffer',
     *   contentType: 'json',
     *   timeout: 5000, // ms
     *   headers: {}
     * }
     * ```
     * @returns
     *
     * @memberOf Collections
     */
    get(querys, options, callback) {
      let endpoint = this[_getPaths]() + this[_getQuerys](querys)
      let object = {
        endpoint,
        method: 'GET',
        options,
      }
      if (typeof callback === 'object') {
        object = Object.assign({}, callback, object)
        callback = null
      }
      return request(object, callback)
    }

    /**
     * get method with path and query
     *
     * @param {Object} querys
     * @param {Object} options
     * @param {Function|Object} callback
     * ```
     * {
     *   dataType: 'text|json|buffer',
     *   contentType: 'json',
     *   timeout: 5000, // ms
     *   headers: {}
     * }
     * ```
     * @returns
     *
     * @memberOf Collections
     */
    getBy(paths, querys, options, callback) {
      let endpoint = this[_getPaths].apply(null, paths) + this[_getQuerys](querys)
      let object = {
        endpoint,
        method: 'GET',
        options,
      }
      if (typeof callback === 'object') {
        object = Object.assign({}, callback, object)
        callback = null
      }
      return request(object, callback)
    }

    create(data, options, callback) {
      let endpoint = this[_getPaths]()
      return request({
        endpoint,
        data,
        method: 'POST',
        options,
      }, callback)
    }

    createBy(paths, querys, data, options, callback) {
      let endpoint = this[_getPaths].apply(null, paths) + this[_getQuerys](querys)
      return request({
        endpoint,
        data,
        method: 'POST',
        options,
      }, callback)
    }

    update(id, data, options, callback) {
      let endpoint = this[_getPaths](id)
      return request({
        endpoint,
        data,
        method: 'PUT',
        options,
      }, callback)
    }

    updateBy(paths, querys, data, options, callback) {
      let endpoint = this[_getPaths].apply(null, paths) + this[_getQuerys](querys)
      return request({
        endpoint,
        data,
        method: 'PUT',
        options,
      }, callback)
    }

    patch(id, data, options, callback) {
      let endpoint = this[_getPaths](id)
      return request({
        endpoint,
        data,
        method: 'PATCH',
        options,
      }, callback)
    }

    patchBy(paths, querys, data, options, callback) {
      let endpoint = this[_getPaths].apply(null, paths) + this[_getQuerys](querys)
      return request({
        endpoint,
        data,
        method: 'PATCH',
        options,
      }, callback)
    }

    delete(id, options, callback) {
      let endpoint = this[_getPaths](id)
      return request({
        endpoint,
        method: 'DELETE',
        options,
      }, callback)
    }

    deleteBy(paths, querys, options, callback) {
      let endpoint = this[_getPaths].apply(null, paths) + this[_getQuerys](querys)
      return request({
        endpoint,
        method: 'DELETE',
        options,
      }, callback)
    }

    batchDelete() {
      return this.create.apply(this, arguments)
    }

    batchDeleteBy() {
      return this.createBy.apply(this, Array.prototype.slice.apply(arguments))
    }

    uploadFile(paths, querys, stream, options, callback) {
      let endpoint = this[_getPaths].apply(null, paths) + this[_getQuerys](querys)
      return request({
        endpoint,
        stream,
        options,
        method: 'POST'
      })
    }

    downloadFile(paths, querys, options, callback) {
      let endpoint = this[_getPaths].apply(null, paths) + this[_getQuerys](querys)
      return request({
        endpoint,
        streaming: true,
        options,
        returnAll: true,
        method: 'GET',
        dataType: null,
        contentType: null,
      })
    }
  }

  this.create = (collection) => new Collections(collection)
}