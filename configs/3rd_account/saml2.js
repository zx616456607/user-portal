/**
 * licensed materials - property of tenxcloud.com
 * (c) copyright 2017 tenxcloud. all rights reserved.
 */

/**
 * saml2 - enterprise
 * v0.1 - 2018-08-08
 * @author Lihaorong
 */


const config = require('../index')
const env = process.env
const HOST_PATTERN = /(\w+:\/\/)([^/]+)/
const fs = require('fs')
const path = require('path')

const prikeyfile = path.join(__root__dirname, './configs/3rd_account/saml2_sslkey/private.pem')
const certfile = path.join(__root__dirname, './configs/3rd_account/saml2_sslkey/rsacert.crt')
const sslkeys = {
  private: fs.readFileSync(prikeyfile).toString(),
  cert: fs.readFileSync(certfile).toString()
}

exports.getOptions = function () {
  let userPortalUrl = config.url

  let matches = userPortalUrl.match(HOST_PATTERN)

  let protocol
  let host
  if (matches && Array.isArray(matches)) {
    if (matches.length === 3) {
      protocol = matches[1]
      host = matches[2]
    }
  } else {
    host = userPortalUrl
  }

  const options = {
    logoutUrl: env.SAML2_LOGOUT_URL || 'http://119.254.155.28:6789/sso/saml2.0/logout',
    issuer: userPortalUrl,
    additionalParams: {},
    additionalAuthorizeParams: {},
    decryptionPvk: sslkeys.private,
    privateCert: sslkeys.private,
    logoutCallbackUrl: `${userPortalUrl}/saml2/logout`,
    cacheProvider: '',
    protocol: protocol || '',
    host: host || '',
    path: '/saml2/consume',
    signatureAlgorithm: 'sha256',
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    entryPoint: env.SAML2_SSO_AUTH_URL || 'http://119.254.155.28:6789/sso/saml2.0/authn',
  }

  return options
}

exports.getCrtKey = function () {
  return sslkeys.cert
}