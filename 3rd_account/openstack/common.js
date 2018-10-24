
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 *
 * v0.1 - 2018-10-10
 * @author YangYuBiao
 */

'use strict'
const merge = require('lodash/merge')
const request = require('../request')('openstack')
const openstackConfig = require('../../configs/3rd_account/openstack')
const co = require('co')
const authBaseUrl = `${openstackConfig.protocol}://${openstackConfig.host}:${openstackConfig.authPort}/v3`

exports.getTokenWithProject = function* (username, password, projectName) {
  if(!username) username = openstackConfig.username
  if(!password) password = openstackConfig.password
  if(!projectName) projectName = openstackConfig.project
  const requestBody = {
    auth: {
      identity: {
        methods: ['password'],
        password: {
          user: {
            name: username,
            domain: {
              id: 'default'
            },
            password: password
          }
        }
      },
      scope: {
        project: {
          name: projectName,
          domain: {
            id:　'default'
          }
        }
      }
    }
  }
  const getRequestUrl = exports.getRequestUrl(authBaseUrl)
  const tokenUrl = getRequestUrl('/auth/tokens')
  const result = yield request(tokenUrl, {
    data: requestBody,
    needHeaders: true,
    method: 'POST'
  })

  const headers = result.headers || {}
  const data = result.data.token
  const keystoneToken = headers['x-subject-token']
  const expires_at = data.expires_at
  if(!keystoneToken) {
    const err = new Error("Could't get keystoneToken")
    err.status = 400
    throw err
  }
  const user = data.user
  const projectUrl = getRequestUrl(`/users/${user.id}/projects`)
  let projects = yield request(projectUrl, {
    headers: {
      ['X-Auth-Token']: keystoneToken
    }
  }) || {}
  projects = projects.projects || []
  if(projects.length == 0) {
    const err = new Error('User has not project')
    throw err
  }

  let currentProject = ''
  projects.some(project => {
    if(project.name == projectName) {
      currentProject = project
      return true
    }
  })

  const bak = this.session.loginUser.openstack
  this.session.loginUser.openstack = {
    withProject : {
      currentProject: projectName,
      expires_at,
      keystoneToken: keystoneToken,
      currentProjectID: currentProject.id,
    },
    username: username, 
    password: password,
    userID: user.id
  }
  if(bak) {
    this.session.loginUser.openstack.withoutProject = bak.withoutProject
  }
  return result
}

exports.getTokenWithoutProject = function* (username, password) {
  if(!username) username = openstackConfig.username
  if(!password) password = openstackConfig.vmPassword
  const requestBody = {
    auth: {
      identity: {
        methods: [
          "password"
        ],
        password: {
          user: {
            name: body.username,
            domain: {
              name: "Default"
            },
            password: body.password
          }
        }
      }
    }
  }
  const tokenUrl = authBaseUrl() + '/auth/tokens'
  const result = yield request(tokenUrl, {
    data: requestBody,
    needHeaders: true,
    method: 'POST'
  })
  const headers = result.headers || {}
  const data = result.data.token
  const user = data.user
  const keystoneToken = headers['x-subject-token']
  const expires_at = data.expires_at
  if(!keystoneToken) {
    const err = new Error("Could't get keystoneToken")
    err.status = 400
    throw err
  }
  const bak = this.session.loginUser.openstack
  this.session.loginUser.openstack = {
    withoutProject: {
      keystoneToken: keystoneToken,
      expires_at,
    },
    username: username, 
    password: password,
    userID: user.id
  }
  if(bak) {
    this.session.loginUser.openstack.withProject = bak.withProject
  }
  return result
}

// flag 为false，则需要projectname
exports.wrapHandler = function (callback, flag) {
  return function* sendRequest(){
    let { openstack }  = this.session.loginUser
    // if(!openstack) {
    //   let userManage = this.session.loginUser.role != 2 ? '联系管理员':''
    //     const err  = new Error(`请先${userManage}绑定openstack用户`)
    //     err.status = 424
    //     throw err
    // }
    if(!flag) {
      if(!openstack.project ) {
        const err = new Error("Project is essential")
        err.status = 400
      }
    }
    let keystoneToken = ""
    yield exports.validate.call(this , flag)
     openstack  = this.session.loginUser.openstack
    if(flag) {
      keystoneToken = openstack.withoutProject.keystoneToken
    } else {
      keystoneToken = openstack.withProject.keystoneToken
    }

    const defaultOptions = {
      headers: {
        ["X-Auth-Token"]: keystoneToken,
        Accept: 'application/json; charset=UTF-8'
      }
    }
    function* send(url, options) {
      if(!options) options = {}
      options = merge({}, defaultOptions, options)
      const self = this
      const result = yield request.call(this, url, options).catch(err => {
        if(err.statusCode == 401) {
          return new Promise(function (resolve, reject) {
            co(function* () {
              if(flag) {
                yield exports.getTokenWithoutProject.call(this, openstack.username, openstack.password)
              } else {
                yield exports.getTokenWithProject.call(this,openstack.username, openstack.password, openstack.currentProject)
              }
              return request.call(self, url, options)
            })
          })
        }
        throw err
      })
      return result
    }
    return yield callback.call(this, send.bind(this))
  }
}


exports.validate = function* (flag) {
  const { openstack } = this.session.loginUser
  var keystoneToken, expires_at = ''
  if(flag) {
    keystoneToken = openstack.withoutProject.keystoneToken
    expires_at = openstack.withoutProject.expires_at
  } else {
    keystoneToken = openstack.withProject.keystoneToken
    expires_at = openstack.withProject.expires_at
  }
  if(!keystoneToken) {
    if(flag) {
      yield yield exports.getTokenWithoutProject.call(this, openstack.username, openstack.password)
      return
    }
    yield exports.getTokenWithProject.call(this, openstack.username, openstack.password, openstack.currentProject)
    return
  }
  const expireTime = new Date(expires_at) - 0
  const newDate = new Date()
  if((expireTime - newDate) <= 0) {
    if(flag) {
      yield yield exports.getTokenWithoutProject.call(this, openstack.username, openstack.password)
      return
    }
    yield exports.getTokenWithProject.call(this,openstack.username, openstack.password, openstack.currentProject)
  }
}



exports.getRequestUrl = function(host) {
  return function(path) {
    return `${host}${path ? path : ''}`
  }
}

exports.thunkToPromise = function(ctx, fn) {
  return function () {
    const args = Array.prototype.splice.call(arguments, 0)
    return new Promise(function (resolve, reject) {
      args.push(function (err, value) {
        if (err) {
          reject(err)
          return
        }
        resolve(value)
      })
      fn.apply(ctx, args)
    })
  }
}
