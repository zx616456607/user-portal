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

// Calling sample: self.sendUserCreationEmail("zhangsh@tenxcloud.com", "shouhong", "zhangsh@tenxcloud.com", "test_user", "11111111")
exports.sendUserCreationEmail = function (to, creatorName, creatorEmail, userName, userPassword) {
  const method = "sendUserCreationEmail"
  
  const subject = `已为您创建时速云账号`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  const loginURL = `http://tenxcluod.com`
  var mailOptions = {
    to: to, // list of receivers
    subject: subject, // Subject line
  }

  fs.readFile('templates/email/user_creation.html', 'utf8', function (err, data) {
    if (err) {
      logger.error(method, err)
      reject(err)
    }
    data = data.replace(/\${subject}/g, subject)
    data = data.replace(/\${creatorName}/g, creatorName)
    data = data.replace(/\${creatorEmail}/g, creatorEmail)
    data = data.replace(/\${systemEmail}/g, systemEmail)
    data = data.replace(/\${userName}/g, userName)
    data = data.replace(/\${userPassword}/g, userPassword)
    data = data.replace(/\${loginURL}/g, loginURL)
    data = data.replace(/\${date}/g, date)
    mailOptions.html = data
    self.sendEmail(mailOptions)
  });
}

//Calling sample: self.sendInviteTeamMemberEmail("zhangsh@tenxcloud.com", "shouhong", "zhangsh@tenxcloud.com", "研发Team", "http://tenxcloud.com")
exports.sendInviteTeamMemberEmail = function (to, invitorName, invitorEmail, teamName, inviteURL) {
  const method = "sendInviteTeamMemberEmail"
  
  const subject = `${teamName}团队动态通知（邀请新成员）`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  var mailOptions = {
    to: to, // list of receivers
    subject: subject, // Subject line
  }

  fs.readFile('templates/email/invite_team_member.html', 'utf8', function (err, data) {
    if (err) {
      logger.error(method, err)
      reject(err)
    }
    data = data.replace(/\${subject}/g, subject)
    data = data.replace(/\${invitorName}/g, invitorName)
    data = data.replace(/\${invitorEmail}/g, invitorEmail)
    data = data.replace(/\${systemEmail}/g, systemEmail)
    data = data.replace(/\${teamName}/g, teamName)
    data = data.replace(/\${inviteURL}/g, inviteURL)
    data = data.replace(/\${date}/g, date)
    mailOptions.html = data
    self.sendEmail(mailOptions)
  });
}

//Calling sample: self.sendCancelInvitationEmail("zhangsh@tenxcloud.com", "shouhong", "zhangsh@tenxcloud.com", "研发Team")
exports.sendCancelInvitationEmail = function (to, invitorName, invitorEmail, teamName) {
  const method = "sendCancelInvitationEmail"
  
  const subject = `${teamName}团队动态通知（取消邀请）`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  var mailOptions = {
    to: to, // list of receivers
    subject: subject, // Subject line
  }

  fs.readFile('templates/email/cancel_invitation.html', 'utf8', function (err, data) {
    if (err) {
      logger.error(method, err)
      reject(err)
    }
    data = data.replace(/\${subject}/g, subject)
    data = data.replace(/\${invitorName}/g, invitorName)
    data = data.replace(/\${invitorEmail}/g, invitorEmail)
    data = data.replace(/\${systemEmail}/g, systemEmail)
    data = data.replace(/\${teamName}/g, teamName)
    data = data.replace(/\${date}/g, date)
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

//Calling sample: self.sendExitTeamEmail("zhangsh@tenxcloud.com", "zhangsh@tenxcloud.com", "shouhong", "研发Team")
exports.sendExitTeamEmail = function (teamAdminEmail, teamMemberEmail, teamMemberName, teamName) {
  const method = "sendEixtTeamEmail"
  
  const subject = `${teamName}团队动态通知（${teamMemberName}退出团队）`
  const emails = [teamAdminEmail, teamMemberEmail]
  const contents = [`${teamMemberName}成员退出团队"${teamName}"`, `您已退出"${teamName}"`]
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")

  for (let i = 0; i < 2; i++) {
    var mailOptions = {
      to: emails[i], // list of receivers
      subject: subject, // Subject line
    }

    fs.readFile('templates/email/remove_team_user.html', 'utf8', function (err, data) {
      if (err) {
        logger.error(method, err)
        reject(err)
      }
      data = data.replace(/\${subject}/g, subject)
      data = data.replace(/\${content}/g, contents[i])
      data = data.replace(/\${date}/g, date)
      data = data.replace(/\${systemEmail}/g, systemEmail)
      mailOptions.html = data
      self.sendEmail(mailOptions)
    });
  }
}

//Calling sample: self.sendRemoveTeamMemberEmail("shouhong", "zhangsh@tenxcloud.com", "zhangsh@tenxcloud.com", "shouhong", "研发Team")
exports.sendRemoveTeamMemberEmail = function (teamAdminName, teamAdminEmail, teamMemberName, teamMemberEmail, teamName) {
  const method = "sendRemoveTeamMemberEmail"
  
  const subject = `${teamName}团队动态通知（移除成员${teamMemberName}）`
  const emails = [teamAdminEmail, teamMemberEmail]
  const contents = [`您已将团队“${teamName}”团队成员${teamMemberName}移除`, `${teamAdminName}将您移除团队"${teamName}"`]
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")

  for (let i = 0; i < 2; i++) {
    var mailOptions = {
      to: emails[i], // list of receivers
      subject: subject, // Subject line
    }

    fs.readFile('templates/email/remove_team_user.html', 'utf8', function (err, data) {
      if (err) {
        logger.error(method, err)
        reject(err)
      }
      data = data.replace(/\${subject}/g, subject)
      data = data.replace(/\${content}/g, contents[i])
      data = data.replace(/\${date}/g, date)
      data = data.replace(/\${systemEmail}/g, systemEmail)
      mailOptions.html = data
      self.sendEmail(mailOptions)
    });
  }
}