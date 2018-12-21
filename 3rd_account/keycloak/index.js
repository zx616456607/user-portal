/**
 * licensed materials - property of tenxcloud.com
 * (c) copyright 2017 tenxcloud. all rights reserved.
 */
/**
 * keycloak
 * v0.1 - 2018-12-21
 * @author zhangpc
 */
'use strict'

const logger = require('../../utils/logger').getLogger('3rd_account/keycloak')

function* keycloakLogin(next) {
  const { bearerToken } = this.query
  if (!bearerToken) {
    logger.warn('keycloakLogin', 'bearerToken in query not found')
    return this.redirect('/login')
  }
  this.request.body = {
    accountType: 'keycloak',
    bearerToken,
  }
  yield next
  this.redirect('/')
}
exports.keycloakLogin = keycloakLogin
