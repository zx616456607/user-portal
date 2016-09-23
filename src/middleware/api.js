/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Middleware for request api
 * 
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

import { Schema, arrayOf, normalize } from 'normalizr'
import { camelizeKeys } from 'humps'
import 'isomorphic-fetch'

// Fetches an API response
function fetchApi(endpoint, options, schema) {
  if(!options) {
    options = {
      credentials: 'same-origin',
      method: 'GET'
    }
  }
  if(options.method === 'POST') {
    if(!options.headers) options.headers = {}
    if(options.headers['Content-Type']) {
      options.headers['Content-Type'] = 'application/json'
    }
  }
  return fetch(endpoint, options).then(response =>
      response.json().then(json => ({json, response}))
    ).then(({json, response}) =>  {
      if (!response.ok) {
        return Promise.reject(json)
      }
      const camelizedJson = camelizeKeys(json)
      return Object.assign({},
        normalize(camelizedJson, schema)
      )
    })
}

// We use this Normalizr schemas to transform API responses from a nested form
// to a flat form where repos and users are placed in `entities`, and nested
// JSON objects are replaced with their IDs. This is very convenient for
// consumption by reducers, because we can easily build a normalized tree
// and keep it updated as we fetch more data.

// Read more about Normalizr: https://github.com/gaearon/normalizr

const userSchema = new Schema('users', {
  idAttribute: 'namespace'
})

const rcSchema = new Schema('rcs', {
  idAttribute: 'rcName'
})

const storageSchema = new Schema('storage', {
  idAttribute: 'namespace'
})

rcSchema.define({
  owner: userSchema
})

// Schemas for API responses.
export const Schemas = {
  USER: userSchema,
  RC: rcSchema,
  RC_ARRAY: arrayOf(rcSchema),
  CONTAINERS: {
    rcList: arrayOf(rcSchema)
  },
  TRANSH_RCS: {
    rcList: arrayOf(rcSchema)
  },
  STORAGE: {
    storageList: arrayOf(storageSchema)
  }
}

// Action key that carries API call info interpreted by this Redux middleware.
export const FETCH_API = Symbol('FETCH API')

// A Redux middleware that interprets actions with FETCH_API info specified.
// Performs the call and promises when such actions are dispatched.
export default store => next => action => {
  const fetchAPI = action[FETCH_API]
  if (typeof fetchAPI === 'undefined') {
    return next(action)
  }

  let { endpoint } = fetchAPI
  const { schema, types } = fetchAPI

  if (typeof endpoint === 'function') {
    endpoint = endpoint(store.getState())
  }

  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.')
  }
  if (!schema) {
    throw new Error('Specify one of the exported Schemas.')
  }
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.')
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('Expected action types to be strings.')
  }

  function actionWith(data) {
    const finalAction = Object.assign({}, action, data)
    delete finalAction[FETCH_API]
    return finalAction
  }

  const [ requestType, successType, failureType ] = types
  next(actionWith({ type: requestType }))

  return fetchApi(endpoint, action.options || {}, schema).then(
    response => next(actionWith({
      response,
      type: successType
    })),
    error => next(actionWith({
      type: failureType,
      error: error.message || 'Something bad happened'
    }))
  )
}