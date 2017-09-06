/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Service for Session
 * v0.1 - 2017-09-06
 * @author Zhangpc
 */
'use strict'

const config = require('../configs')
const redisClient = require('../utils/redis').client
const redisConfig = config.redis || {}
const sessionPrefix = redisConfig.sessionPrefix
const sessionStore = config.session_store

function getAllSessions() {
  if (sessionStore === 'false') {
    return []
  }
  return getKeys(`${sessionPrefix}*`).then(keys => {
    if (!keys || keys.length === 0) {
      return []
    }
    const reqArray = keys.map(key => getValueByKey(key, true))
    return Promise.all(reqArray)
  })
}

function getKeys(param) {
  return new Promise((resolve, reject) => {
    redisClient.keys(param, (err, res) => {
      if (err) {
        return reject(err)
      }
      resolve(res)
    })
  })
}

function getValueByKey(key, json) {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, res) => {
      if (err) {
        return reject(err)
      }
      if (json) {
        res = JSON.parse(res)
      }
      resolve(res)
    })
  })
}

exports.getAllSessions = getAllSessions
