/**
 * licensed materials - property of tenxcloud.com
 * (c) copyright 2017 tenxcloud. all rights reserved.
 */
/**
 * cas - enterprise
 * v0.1 - 2017-12-21
 * @author zhangpc
 */

const env = process.env

const config = {
  ssoBase: env.CAS_SSO_BASE || 'http://192.168.1.58:9080/cas',
  validateUri: env.CAS_VALIDATE_URI || '/serviceValidate',
}

module.exports = config
