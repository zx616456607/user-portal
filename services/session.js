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
exports.getAllSessions = getAllSessions

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
        res = JSON.parse(res) || {}
        res._key = key
      }
      resolve(res)
    })
  })
}

exports.getValueByKey = function (key, json) {
  return getValueByKey(`${sessionPrefix}${redisConfig.session_store_prefix}${key}`, json)
}

function delKey(key) {
  return new Promise((resolve, reject) => {
    redisClient.del(key, (err, res) => {
      if (err) {
        return reject(err)
      }
      resolve(res)
    })
  })
}

function removeKeyByUserID(userID) {
  return getAllSessions().then(sessions => {
    let delTargetKeys = []
    sessions.forEach(session => {
      const sessionUser = session.loginUser || {}
      if (userID == sessionUser.id) {
        delTargetKeys.push(delKey(session._key))
      }
    })
    return delTargetKeys
  })
}

exports.removeKeyByUserID = removeKeyByUserID

function removeKeyByOptionKeyValue(key, value) {
  return getAllSessions().then(sessions => {
    let delTargetKeys = []
    sessions.forEach(session => {
      const sessionUser = session.loginUser || {}
      if (value === sessionUser[key]) {
        delTargetKeys.push(delKey(session._key))
      }
    })
    return delTargetKeys
  })
}

exports.removeKeyByOptionKeyValue = removeKeyByOptionKeyValue