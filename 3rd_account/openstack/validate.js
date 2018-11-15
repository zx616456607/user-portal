
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 *
 * v0.1 - 2018-11-14
 * @author YangYuBiao
 */

const common = require('./common')
const request = require('../request')('openstack')

exports.validateConfig = function* () {
  const body = this.request.body
  if (!body.configDetail) {
    this.body = {
      valid: false
    }
  }
  let detail = body.configDetail
  if (typeof detail == "string") {
    try {
      detail = JSON.parse(detail)
    } catch (error) {
      const err = new Error("The config of indispensable is missing")
      err.status = 400
      throw err
    }
  }
  const tokenUrl = `${detail.protocol}://${detail.host}:${detail.keystone}/v3/auth/tokens`
  if (detail.type == 0) {
    if (!detail.user || !detail.password || !detail.host || !detail.keystone || !detail.project || !detail.protocol) {
      const err = new Error("The config of indispensable is missing")
      err.status = 400
      throw err
    }
    try {
      const requestBody = {
        auth: {
          identity: {
            methods: ['password'],
            password: {
              user: {
                name: detail.user,
                domain: {
                  id: 'default'
                },
                password: detail.password
              }
            }
          },
          scope: {
            project: {
              name: detail.project,
              domain: {
                id: 'default'
              }
            }
          }
        }
      }
      yield request(tokenUrl, {
        data: requestBody,
        needHeaders: true,
        method: 'POST'
      })
    } catch (error) {
      this.body = {
        valid: false
      }
      return
    }
    this.body = {
      valid: true
    }
    return
  }
  if (detail.type == 1) {
    if (!detail.user || !detail.password || !detail.host || !detail.keystone || !detail.protocol) {
      const err = new Error("The config of indispensable is missing")
      err.status = 400
      throw err
    }
    try {
      const requestBody = {
        auth: {
          identity: {
            methods: [
              "password"
            ],
            password: {
              user: {
                name: detail.user,
                domain: {
                  name: "Default"
                },
                password: detail.password
              }
            }
          }
        }
      }
      yield request(tokenUrl, {
        data: requestBody,
        needHeaders: true,
        method: 'POST'
      })
    } catch (error) {
      this.body = {
        valid: false
      }
      return
    }
    this.body = {
      valid: true
    }
    return
  }
  this.body = {
    valid: false
  }
}