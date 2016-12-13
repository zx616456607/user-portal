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
const fs = require('fs')
const self = this

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

//Calling sample: self.sendInviteUserEmail("zhangsh@tenxcloud.com", "shouhong", "zhangsh@tenxcloud.com", "研发Team", "http://tenxcloud.com")
exports.sendInviteUserEmail = function (to, invitorName, invitorEmail, teamName, inviteURL) {
  const method = "sendInviteUserEmail"
  var mailOptions = {
    from: config.mail_server.sender_mail, // sender address
    to: to, // list of receivers
    subject: '邀请加入团队', // Subject line
    html: ""
  }

  fs.readFile('../templates/email/invite_user.html', 'utf8', function (err, data) {
    if (err) {
      logger.error(method, err)
      reject(err)
    }
    var systemEmail = config.mail_server.service_mail
    data = data.replace(/\${invitorName}/g, invitorName)
    data = data.replace(/\${invitorEmail}/g, invitorEmail)
    data = data.replace(/\${systemEmail}/g, systemEmail)
    data = data.replace(/\${teamName}/g, teamName)
    data = data.replace(/\${inviteURL}/g, inviteURL)
    mailOptions.html = data
    self.sendEmail(mailOptions)
  });
}
