/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */
/**
* Email tools
*
* v0.1 - 2016-11-04
* @author Zhangpc
*/

'use strict'

const nodemailer = require('nodemailer')
const logger = require('./logger').getLogger('email')
const config = require('../configs')

/**
 * Send email use SMTP
 *
 * mailOptions = {
 *   from: "service@tenxcloud.com", // sender address
 *   to: "zhangpc@tenxcloud.com", // list of receivers
 *   subject: 'Hello ✔', // Subject line
 *   text: 'Hello world ?', // plaintext body
 *   html: '<b>Hello world ?</b>' // html body
 * }
 */
exports.sendEmail = function (transport, mailOptions) {
  const method = 'sendEmail'
  // In case there is no mail options provided
  if (!mailOptions) {
    mailOptions = transport
    transport = config.mail_server
  }
  // Force to use this 'from' user if using sendEmail method
  mailOptions.from = config.mail_server.auth.user

  const smtpTransport = nodemailer.createTransport(transport)
  return new Promise(function (resovle, reject) {
    logger.info(method, 'Send email to: ' + mailOptions.to)
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        logger.error(method, error)
        reject(error)
      } else {
        logger.info(method, 'Email sent: ' + response.response)
      }
      smtpTransport.close()
      resovle(response)
    })
  })
}