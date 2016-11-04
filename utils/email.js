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
const DEFAUL_TRANSPORT = {
  "host": "smtp.qq.com",
  "port": 465,
  "senderMail": "service@tenxcloud.com",
  "senderPassword": "TenxCloud009!!"
}

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
  if (!mailOptions) {
    mailOptions = transport
  }
  transport = DEFAUL_TRANSPORT
  const transportOpts = {
    host: transport.host,
    port: transport.port,
    secure: transport.port === 465, // use SSL
    auth: {
      user: transport.senderMail,
      pass: transport.senderPassword
    }
  }
  const smtpTransport = nodemailer.createTransport(transportOpts)
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