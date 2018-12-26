/**
 * licensed materials - property of tenxcloud.com
 * (c) copyright 2017 tenxcloud. all rights reserved.
 */
/**
 * keycloak - enterprise
 * v0.1 - 2018-12-24
 * @author zhangpc
 */

const env = process.env

const config = {
  url: env.KEYCLOAK_URL || 'http://192.168.1.242:8080/auth',
  realm: env.KEYCLOAK_REALM || 'cmp',
  clientId: env.KEYCLOAK_CLIENT_ID || 'cmp-client',
}

module.exports = config
