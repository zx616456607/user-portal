/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux actions for licenses
 *
 * v0.1 - 2017-02-09
 * @author shouhong.zhang
 */

'use strict'
const apiFactory = require('../services/api_factory')
const indexService = require('../services')

exports.getLicense = function* () {
  const loginUser = this.session.loginUser
  const result = yield indexService.getLicense(loginUser)
  this.body = result
}

// license_status: VALID, NO_LICENSE, EXPIRED
// left_license_days: xxxx
// left_trial_days: xxx
// UI behaviors baased on above information:
// scenario-1: license_status is VALID and left_license_days > 7, allow login
// scenario-2: license_status is VALID and left_license_days <= 7, show warning and allow login
// scenario-3: license_status is NO_LICENSE and left_trial_days > 0, show warning and allow login
// scenario-4: license_status is NO_LICENSE and left_trial_days <= 0, show error and not allow login
// scenario-5: license_status is EXPIRED, show error and not allow login
exports.checkLicense = function* () {
  const api = apiFactory.getApi()
  const license = this.request.body
  //const license_info = yield api.licenses.get("merged")
  //const trial_info = yield api.licenses.get("trial")
  const result = {
    status: 'Success',
    code: 200,
    data: {
      license_status: 'NO_LICENSE',
      left_license_days: 0,
      left_trial_days: 14
    }
  }
  this.body = result
}

// get all licenses 
// license info: key, start_time, end_time, add_time, add_user
exports.getLicenses = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  //const result = yield api.licenses.get()
  const result = {
    status: 'Success',
    code: 200,
    data: {
      merged: {
        max_nodes: 6,
        start: "2016-1-7 8:00:00",
        end: "2018-1-7 8:00:00",      
        short_key: "abcdeftg212",     
        add_time: "2017-1-8 10:00:00", 
        add_user: "未登录激活",
      },
      licenses: [
        {
          max_nodes: 6,
          start: "2017-1-7 8:00:00",
          end: "2018-1-7 8:00:00",      
          short_key: "abcdeftg2222",     
          add_time: "2017-1-8 10:00:00", 
          add_user: "未登录激活",
        },
         {
          max_nodes: 3,
          start: "2016-1-7 8:00:00",
          end: "2017-1-7 8:00:00",      
          short_key: "abcdeftg1111",     
          add_time: "2016-1-8 10:00:00", 
          add_user: "未登录激活",
        }
      ]
    }
  }
  this.body = result
}

// input: license key
// output: success, invalid_license
exports.addLicense = function* () {
  const api = apiFactory.getApi()
  const license = this.request.body
  if (!license || !license.rawlicense) {
    const err = new Error('rawlicense field is required.')
    err.status = 400
    throw err
  }
  //const result = yield api.licenses.create(license)
  const result = {
    status: 'Success',
    code: 200,
    data: {

    }
  }
  this.body = result
}

// get platform_id
exports.getPlatformID = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  //const result = yield api.license.get("platform")
  const result = {
    status: 'Success',
    code: 200,
    data: {
      platformid: "123456789abc"
    }
  }
  this.body = result
}