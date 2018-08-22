/**
 * licensed materials - property of tenxcloud.com
 * (c) copyright 2017 tenxcloud. all rights reserved.
 */

/**
 * SAML 2.0 - release - 3.0
 * v0.1 - 2018-08-03
 * @author Lihaorong
 */

const apiFactory = require('../../services/api_factory')
const config = require('../../configs/3rd_account/saml2')
const logger = require('../../utils/logger').getLogger('3rd_account/saml2')
const uuid = require('uuid')
const request = require('request')
const SAML = require('./passport-saml').SAML
const session = require('../../services/session')

const saml = new SAML(config.getOptions())

exports.login = function* () {
  let result = yield new Promise((resove, reject) => {
    saml.getAuthorizeUrl({}, (err, data) => {
      if (err) {
        reject({
          status: 500,
          message: err.message
        })
      }

      resove({
        status: 200,
        redirectUrl: data
      })
    })
  })

  if (result.status === 200) {
    this.redirect(result.redirectUrl)
  } else {
    this.status = result.status
    this.body = result
  }
}

exports.consume = function* (next) {
  let body = this.request.body

  let data = yield new Promise((resolve, reject) => {
    saml.validatePostResponse(body, (error, result) => {
      if (error) {
        reject({
          status: 500,
          message: error.message
        })
      }

      resolve(result)
    })
  })

  if (data.status === 500) {
    this.type = 'json'
    this.body = {
      status: data.status,
      message: `${JSON.stringify(data)}`
    }
    return
  }

  const user = {
    userName: data.uid,
    password: uuid.v4(),
    email: data.email,
    phone: data.phone,
    is_3rd_account: 1,
    accountType: 'saml2',
    accountID: data.uid,
    accountDetail: JSON.stringify(data),
  }
  this.request.body = {
    accountType: user.accountType,
    accountID: user.accountID,
    userName: user.userName,
    IDPClientId: data.IDPClientId,
    nameID: data.nameID,
    nameIDFormat: data.nameIDFormat
  }
  const spi = apiFactory.getTenxSysSignSpi()
  try {
    // check if user exist
    const userExistence = yield spi.users.getBy([ user.userName, 'existence' ])
    // user exist, login success
    if (userExistence.data) {
      yield next
      return this.redirect('/')
    }
    // user not exist, create a new user
    yield spi.users.createBy([ '3rdparty-account' ], null, user)
    yield next
    this.redirect('/')
  } catch (error) {
    logger.error('get or insert user to db failed: ', error.stack)
    this.redirect('/login')
  }
}

exports.logoutRedirect = function* () {
  let user = this.session.loginUser
  let logoutUrl = yield new Promise((resolve, reject) => {
    saml.getLogoutUrl({user}, (err, result) => {
      if (err) {
        reject(err)
      }
      resolve(result)
    })
  })

  yield new Promise((resolve, reject) => {
    request.get(logoutUrl, null, function(err, response, body) {
      if (err) {
        logger.error(err.message)
        reject(err)
      }
      logger.info(`IDP logout: ${body}`)
      resolve(response)
    })
  })

  session.removeKeyByOptionKeyValue('IDPClientId', user.IDPClientId)

  this.redirect('/login')
}

exports.logout = function* () {
  let requestData = this.request.body
  let data = yield new Promise((resolve, reject) => {
    saml.validatePostRequest(requestData, (error, result) => {
      if (error) {
        reject({
          status: 500,
          message: error.message
        })
      }

      resolve(result)
    })
  })

  if (data.status === 500) return

  session.removeKeyByOptionKeyValue('IDPClientId', user.IDPClientId)

  this.status = 200
  this.body = saml.getLogoutResponseBody(data)
}

exports.metadata = function* () {
  this.type = 'xml'
  this.status = 200
  this.body = saml.generateServiceProviderMetadata(config.getCrtKey())
}