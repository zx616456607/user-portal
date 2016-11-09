/**
 * Licensed Materials - Property of tenxcloud.com

 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User manage controller
 *
 * v0.1 - 2016-11-09
 * @author meng yuan
 */

'use strict'
const crypto = require('crypto');
const apiFactory = require('../services/api_factory')

// TODO check license when user login
exports.getLicense = function* () {
  const reqBody = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getSpi(loginUser)
  const result = yield api.license.get()
  let plain = {}
  try {
    plain = JSON.parse(_decrypt(result.data.license))
  }
  catch(e) {
  }
  this.body = {
    license: result.data.license,
    plain: plain,
  }
}

function _decrypt(text){
  var algorithm = 'aes-192-cbc';
  var iv = new Buffer([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1])
  var pwd1 = 'T1X2C3D!'
  var pwd2 = 'F^I$G&H*'
  var pwd3 = 'T(E)R088'
  var pwd = pwd1 + pwd2 + pwd3
  var decipher = crypto.createDecipheriv(algorithm, pwd , iv)
  var dec = decipher.update(text,'base64','utf8')
  dec += decipher.final('utf8')
  return dec;
}