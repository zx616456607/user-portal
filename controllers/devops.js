/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * DevOps(CI/CD) controller
 *
 * v0.1 - 2016-11-04
 * @author Lei
*/
'use strict'

const apiFactory = require('../services/api_factory')
const logger     = require('../utils/logger.js').getLogger("devops")

/*
Add a new repository type
*/
exports.registerRepo = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  const api = apiFactory.getDevOpsApi(loginUser)

  const repoInfo = this.request.body
  switch (repoType) {
    case "gitlab":
      if (!repoInfo.url || !repoInfo.private_token) {
        const err = new Error("Missing url or private_token for gitlab repository")
        err.status = 400
        throw err
      }
      var RegExp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      if (!RegExp.test(repoInfo.url)) {
        const err = new Error("Invalid gitlab url")
        err.status = 400
        throw err
      }
      break;
    case "svn":
    default:
      const err = new Error('Only support gitlab for now')
      err.status = 400
      throw err
  }
  const result = yield api.createBy(["repos", repoType], null, repoInfo)

  this.body = {
    data: result
  }
}
