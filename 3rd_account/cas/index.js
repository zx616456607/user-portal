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
const urllib = require('urllib')
const apiFactory = require('../../services/api_factory')
const logger = require('../../utils/logger').getLogger('3rd_account/cas')
const uuid = require('uuid')
const qs = require('query-string')
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

  getTicket(ticket) {
    const validateUrl = this.ssoBase + '/v1/tickets/' + ticket
    logger.info('validateUrl', validateUrl)
    return urllib.request(validateUrl, {
      dataType: 'text',
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

function* casLogin(next) {
  const service = this.origin + this.path
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
  // if (validateRes.authenticationsuccess)
  console.log('authenticationsuccess', validateRes.authenticationsuccess)
  const ticketRes = yield cas.getTicket(ticket)
  console.log('ticketRes', ticketRes.data)
  console.log('ticketRes', ticketRes.res.statusCode)
  // check if user exist
  /* const userName = validateRes.authenticationsuccess.user
  const userInfo = yield spi.users.getBy([ username, 'existence' ])
  if (userInfo.data) {
    //
  } */
  yield next
}
exports.casLogin = casLogin

function* casLogout() {
  this.redirect(`${cas.ssoBase}/logout`)
}
exports.casLogout = casLogout
