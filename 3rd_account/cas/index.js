/**
 * licensed materials - property of tenxcloud.com
 * (c) copyright 2017 tenxcloud. all rights reserved.
 */
/**
 * cas - enterprise
 * v0.1 - 2017-12-21
 * @author zhangpc
 */
'use strict'

const casConfig = require('../../configs/3rd_account/cas')
const indexConfig = require('../../configs/')
const urllib = require('urllib')
const apiFactory = require('../../services/api_factory')
const logger = require('../../utils/logger').getLogger('3rd_account/cas')
const uuid = require('uuid')
const qs = require('querystring')
const xml2js = require('xml2js')
const processors = require('xml2js/lib/processors')

class Cas {
  constructor(config) {
    if (!config) {
      config = casConfig
    }
    this.ssoBase = config.ssoBase
    this.validateUri = config.validateUri
  }

  verifyTicket(ticket, service) {
    const validateUrl = this.ssoBase + this.validateUri
    logger.info('validateUrl', validateUrl)
    return urllib.request(validateUrl, {
      dataType: 'text',
      dataAsQueryString: true,
      data: {
        ticket,
        service,
      }
    }).then(result => {
      return this.parseXml(result.data)
    })
  }

  parseXml(xml) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xml, {
        trim: true,
        normalize: true,
        explicitArray: false,
        tagNameProcessors: [ processors.normalize, processors.stripPrefix ],
      }, (err, json) => {
        let data
        if (err) {
          err.name = 'XMLParseError'
          err.xml = xml
          return reject(err)
        }
        data = json ? json.serviceresponse : {}
        resolve(data)
      })
    })
  }
}
exports.Cas = Cas

const cas = new Cas()

function getRandomPhone() {
  return Math.floor(Math.random() * 100000000000) + 10000000000
}
function* casLogin(next) {
  const service = indexConfig.url
  const query = this.query
  const ticket = query.ticket
  const authUrl = `${cas.ssoBase}/login?${qs.stringify({ service })}`
  if (!ticket) {
    return this.redirect(authUrl)
  }
  const validateRes = yield cas.verifyTicket(ticket, service)
  if (validateRes.authenticationfailure || !validateRes.authenticationsuccess) {
    logger.error('verify user faild, ticket is ', ticket)
    logger.error('verify user faild', JSON.stringify(validateRes.authenticationfailure))
    this.redirect(authUrl)
    return
  }
  const userAttributes = validateRes.authenticationsuccess.attributes || {}
  const user = {
    userName: userAttributes.account,
    password: userAttributes.password,
    email: userAttributes.emailaddress || `${userAttributes.account}@htkg.com`,
    phone: userAttributes.mobilephone || getRandomPhone().toString(),
    is_3rd_account: 1,
    accountType: 'cas',
    accountID: userAttributes.userid,
    accountDetail: JSON.stringify(userAttributes),
  }
  this.request.body = {
    accountType: user.accountType,
    accountID: user.accountID,
    userName: user.userName
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
    this.redirect(authUrl)
  }
}
exports.casLogin = casLogin

function casLogout() {
  this.redirect(`${cas.ssoBase}/logout`)
}
exports.casLogout = casLogout
