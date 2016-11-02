/**
 * Licensed Materials - Property of tenxcloud.com

 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User manage controller
 *
 * v0.1 - 2016-11-02
 * @author meng yuan
 */

'use strict'

// get namespace and token from session
exports.getTokenInfo = function* () {
  this.body = {
    namespace: this.session.loginUser.namespace,
    token: this.session.loginUser.token,
  }
}