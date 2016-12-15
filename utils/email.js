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
const moment = require('moment')
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
  
  const subject = `${teamName}团队动态通知（邀请新成员）`
  var mailOptions = {
    to: to, // list of receivers
    subject: subject, // Subject line
  }

  fs.readFile('templates/email/invite_user.html', 'utf8', function (err, data) {
    if (err) {
      logger.error(method, err)
      reject(err)
    }
    var systemEmail = config.mail_server.service_mail
    data = data.replace(/\${subject}/g, subject)
    data = data.replace(/\${invitorName}/g, invitorName)
    data = data.replace(/\${invitorEmail}/g, invitorEmail)
    data = data.replace(/\${systemEmail}/g, systemEmail)
    data = data.replace(/\${teamName}/g, teamName)
    data = data.replace(/\${inviteURL}/g, inviteURL)
    mailOptions.html = data
    self.sendEmail(mailOptions)
  });
}

//Calling sample: self.sendDismissTeamEmail("shouhong", "zhangsh@tenxcloud.com", "zhangsh@tenxcloud.com", "研发Team", true)
exports.sendDismissTeamEmail = function (teamAdminName, teamAdminEmail, teamMemberEmails, teamName, hasRefund) {
  const method = "sendDismissTeamEmail"

  const subject = `${teamName}团队动态通知（解散团队）`
  const emails = [teamAdminEmail, teamMemberEmails]
  const templateFiles = ['dismiss_team_admin.html', 'dismiss_team_user.html']
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  let showRefund = "table-cell"
  let showNoRefund = "none"
  if (!hasRefund) {
    showRefund = "none"
    showNoRefund = "table-cell"
  }

  for (let i = 0; i < 2; i++) {
    var mailOptions = {
      to: emails[i], // list of receivers
      subject: subject, // Subject line
    }

    fs.readFile('templates/email/' + templateFiles[i], 'utf8', function (err, data) {
      if (err) {
        logger.error(method, err)
        reject(err)
      }
      data = data.replace(/\${subject}/g, subject)
      data = data.replace(/\${teamAdminName}/g, teamAdminName)
      data = data.replace(/\${teamAdminEmail}/g, teamAdminEmail)
      data = data.replace(/\${teamName}/g, teamName)
      data = data.replace(/\${showRefund}/g, showRefund)
      data = data.replace(/\${showNoRefund}/g, showNoRefund)
      data = data.replace(/\${date}/g, date)
      data = data.replace(/\${systemEmail}/g, systemEmail)
      mailOptions.html = data
      self.sendEmail(mailOptions)
    });
  }
}
