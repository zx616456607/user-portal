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
config.mail_server = global.globalConfig.mail_server
const constants = require('../configs/constants')
const fs = require('fs')
const EMAIL_TEMPLATES_DIR = `${__root__dirname}/templates/email`
const SendCloud = require('sendcloud')

/**
 * Send email use SMTP
 *
 * ```
 * mailOptions = {
 *   from: "service@tenxcloud.com", // sender address
 *   to: "zhangpc@tenxcloud.com" || [], // list of receivers
 *   subject: 'Hello ✔', // Subject line
 *   text: 'Hello world ?', // plaintext body
 *   html: '<b>Hello world ?</b>' // html body
 * }
 * ```
 * @param {Object} transport
 * @param {Object} mailOptions
 * @returns {Promise}
 */
function sendEmail(transport, mailOptions) {
  const method = 'sendEmail'
  // In case there is no mail options provided
  if (!mailOptions) {
    mailOptions = transport
    transport = config.mail_server
  }
  // Workaround for SMTP not configed(lite)
  if (!transport.auth.pass) {
    return Promise.resolve({skip: true})
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
exports.sendEmail = sendEmail

/**
 * Send email use sendcloud
 * 使用触发账号，发送邮件给某一个用户
 *
 * ```
 * mailOptions = {
 *   to: "zhangpc@tenxcloud.com" || [], // 邮件接收者
 *   subject: '个人账户充值到账通知', // 主题
 *   templateName: 'charge_success', // 模板名
 *   sub: {
 *     '%subject%': ['个人账户充值到账通知'],
 *     '%payMethod%': ['微信']
 *   } // 参数
 *   options: { } // 其他可选参数
 * }
 * ```
 * 当 to 为字符串时使用触发 API user 以及触发邮件接口，对应的邮件模板也必须是触发邮件
 * 当 to 为数组时使用批量API user 以及批量邮件接口，对应的邮件模板也必须是批量邮件
 *
 * @param {Object} mailOptions
 * @returns {Promise}
 */
function sendEmailBySendcloud(mailOptions) {
  // Standard mode use condfigs/_standard
  if (config.running_mode === constants.STANDARD_MODE) {
    config.sendcloud = require('../configs/_standard').sendcloud
  }
  const sendcloudConfig = config.sendcloud
  let apiUser
  let _send
  let sendcloud
  if (Array.isArray(mailOptions.to)) {
    // 批量邮件
    apiUser = sendcloudConfig.apiUserBatch
    sendcloud = new SendCloud(sendcloudConfig.apiUser,
                              sendcloudConfig.apiKey,
                              sendcloudConfig.from,
                              sendcloudConfig.fromname,
                              apiUser)
    _send = sendcloud.sendByTemplate.bind(sendcloud)
  } else {
    // 触发邮件
    apiUser = sendcloudConfig.apiUser
    sendcloud = new SendCloud(sendcloudConfig.apiUser,
                              sendcloudConfig.apiKey,
                              sendcloudConfig.from,
                              sendcloudConfig.fromname,
                              apiUser)
    _send = sendcloud.templateToOne.bind(sendcloud)
  }
  return _send(mailOptions.to,
               mailOptions.subject,
               mailOptions.templateName,
               mailOptions.sub,
               mailOptions.options).then(result => {
    if (result.message !== 'success') {
      logger.error(result.errors)
      throw new Error(result.errors || result.message)
    }
    return result
  })
}
exports.sendEmailBySendcloud = sendEmailBySendcloud

/**
 * Send ensure email
 * At first send email by sendcloud, if send failed use sendEmail
 * @param {Object} mailOptions
 * @param {String} htmlName (html template file name)
 * @returns {Promise}
 */
function sendEnsureEmail(mailOptions, htmlName) {
  return sendEmailBySendcloud(mailOptions).catch(err => {
    let html = fs.readFileSync(`${EMAIL_TEMPLATES_DIR}/${htmlName}`, 'utf8')
    const sub = mailOptions.sub
    for(let key in sub) {
      if (sub.hasOwnProperty(key)) {
        let regExp = new RegExp(key, 'g')
        html = html.replace(regExp, sub[key][0])
      }
    }
    mailOptions.html = html
    return sendEmail(mailOptions)
  })
}
exports.sendEnsureEmail = sendEnsureEmail

/**
 * Send email when user created
 *
 * Calling sample: `sendUserCreationEmail("zhangsh@tenxcloud.com", "shouhong", "zhangsh@tenxcloud.com", "test_user", "11111111")`
 * @param {String} to
 * @param {String} creatorName
 * @param {String} creatorEmail
 * @param {String} userName
 * @param {String} userPassword
 * @returns {Promise}
 */
exports.sendUserCreationEmail = function(to, creatorName, creatorEmail, userName, userPassword) {
  const method = "sendUserCreationEmail"
  const subject = `已为您创建时速云帐号`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  const loginURL = `${config.url}/login`
  const mailOptions = {
    to,
    subject,
    templateName: 'user_creation',
    sub: {
      '%subject%': [subject],
      '%creatorName%': [creatorName],
      '%creatorEmail%': [creatorEmail],
      '%systemEmail%': [systemEmail],
      '%userName%': [userName],
      '%userPassword%': [userPassword],
      '%loginURL%': [loginURL],
      '%date%': [date],
    }
  }
  return sendEnsureEmail(mailOptions, 'user_creation.html')
}

/**
 * Send invite team member email
 *
 * Calling sample: `sendInviteTeamMemberEmail("zhangsh@tenxcloud.com", "shouhong", "zhangsh@tenxcloud.com", "研发Team", "http://tenxcloud.com")`
 * @param {String} to
 * @param {String} invitorName
 * @param {String} invitorEmail
 * @param {String} teamName
 * @param {String} inviteURL
 * @returns {Promise}
 */
exports.sendInviteTeamMemberEmail = function(to, invitorName, invitorEmail, teamName, inviteURL) {
  const method = "sendInviteTeamMemberEmail"
  const subject = `${teamName} 团队动态通知（邀请新成员）`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  const mailOptions = {
    to,
    subject,
    templateName: 'invite_team_member',
    sub: {
      '%subject%': [subject],
      '%invitorName%': [invitorName],
      '%invitorEmail%': [invitorEmail],
      '%systemEmail%': [systemEmail],
      '%teamName%': [teamName],
      '%inviteURL%': [inviteURL],
      '%date%': [date],
    }
  }
  return sendEnsureEmail(mailOptions, 'invite_team_member.html')
}

/**
 * Send cancel invitation email
 *
 * Calling sample: `sendCancelInvitationEmail("zhangsh@tenxcloud.com", "shouhong", "zhangsh@tenxcloud.com", "研发Team")`
 * @param {String} to
 * @param {String} invitorName
 * @param {String} invitorEmail
 * @param {String} teamName
 * @returns {Promise}
 */
exports.sendCancelInvitationEmail = function(to, invitorName, invitorEmail, teamName) {
  const method = "sendCancelInvitationEmail"

  const subject = `${teamName} 团队动态通知（取消邀请）`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  var mailOptions = {
    to,
    subject,
    templateName: 'cancel_invitation',
    sub: {
      '%subject%': [subject],
      '%invitorName%': [invitorName],
      '%invitorEmail%': [invitorEmail],
      '%systemEmail%': [systemEmail],
      '%teamName%': [teamName],
      '%date%': [date],
    }
  }
  return sendEnsureEmail(mailOptions, 'cancel_invitation.html')
}

/**
 * Send dismiss team emails
 *
 * Calling sample: `sendDismissTeamEmail("shouhong", "zhangsh@tenxcloud.com", "zhangsh@tenxcloud.com", "研发Team", true)`
 * @param {String} teamAdminName
 * @param {String} teamAdminEmail
 * @param {Array} teamMemberEmails
 * @param {String} teamName
 * @param {Boolean} hasRefund
 * @returns {Promise}
 */
exports.sendDismissTeamEmail = function(teamAdminName, teamAdminEmail, teamMemberEmails, teamName, hasRefund) {
  const method = "sendDismissTeamEmail"
  const subject = `${teamName} 团队动态通知（解散团队）`
  const emails = [teamAdminEmail, teamMemberEmails]
  const templates = ['dismiss_team_admin', 'dismiss_team_user']
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  let showRefund = "table-cell"
  let showNoRefund = "none"
  if (!hasRefund) {
    showRefund = "none"
    showNoRefund = "table-cell"
  }
  const promiseArray = []
  for (let i = 0; i < 2; i++) {
    if (emails[i].length == 0) {
      continue
    }
    let emailsItem = emails[i]
    let templateName = templates[i]
    let mailOptions = {
      to: emailsItem,
      subject: subject,
      templateName,
      sub: {
        '%subject%': [],
        '%teamAdminName%': [],
        '%teamAdminEmail%': [],
        '%teamName%': [],
        '%showRefund%': [],
        '%showNoRefund%': [],
        '%date%': [],
        '%systemEmail%': [],
      }
    }
    if (!Array.isArray(emailsItem)) {
      emailsItem = [emailsItem]
    }
    emailsItem.map(email => {
      mailOptions.sub['%subject%'].push(subject)
      mailOptions.sub['%teamAdminName%'].push(teamAdminName)
      mailOptions.sub['%teamAdminEmail%'].push(teamAdminEmail)
      mailOptions.sub['%teamName%'].push(teamName)
      mailOptions.sub['%showRefund%'].push(showRefund)
      mailOptions.sub['%showNoRefund%'].push(showNoRefund)
      mailOptions.sub['%date%'].push(date)
      mailOptions.sub['%systemEmail%'].push(systemEmail)
    })
    promiseArray.push(sendEnsureEmail(mailOptions, `${templateName}.html`))
  }
  return Promise.all(promiseArray)
}

/**
 * Send exit team emails
 *
 * Calling sample: `sendExitTeamEmail("zhangsh@tenxcloud.com", "zhangsh@tenxcloud.com", "shouhong", "研发Team")`
 * @param {String} teamAdminEmail
 * @param {String} teamMemberEmail
 * @param {String} teamMemberName
 * @param {String} teamName
 * @returns {Promise}
 */
exports.sendExitTeamEmail = function(teamAdminEmail, teamMemberEmail, teamMemberName, teamName) {
  const method = "sendEixtTeamEmail"

  const subject = `${teamName} 团队动态通知（${teamMemberName} 退出团队）`
  const emails = [teamAdminEmail, teamMemberEmail]
  const contents = [`${teamMemberName}成员退出团队"${teamName}"`, `您已退出"${teamName}"`]
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  const promiseArray = []
  for (let i = 0; i < 2; i++) {
    if (emails[i].length == 0) {
      continue
    }
    let mailOptions = {
      to: emails[i],
      subject,
      templateName: 'remove_team_member',
      sub: {
        '%subject%': [subject],
        '%content%': [contents[i]],
        '%date%': [date],
        '%systemEmail%': [systemEmail],
      }
    }
    promiseArray.push(sendEnsureEmail(mailOptions, `remove_team_member.html`))
  }
  return Promise.all(promiseArray)
}

/**
 * Send remove member emails
 *
 * Calling sample: `sendRemoveTeamMemberEmail("shouhong", "zhangsh@tenxcloud.com", "zhangsh@tenxcloud.com", "shouhong", "研发Team")`
 * @param {String} teamAdminName
 * @param {String} teamAdminEmail
 * @param {String} teamMemberName
 * @param {String} teamMemberEmail
 * @param {String} teamName
 * @returns {Promise}
 */
exports.sendRemoveTeamMemberEmail = function(teamAdminName, teamAdminEmail, teamMemberName, teamMemberEmail, teamName) {
  const method = "sendRemoveTeamMemberEmail"
  const subject = `${teamName} 团队动态通知（移除成员 ${teamMemberName}）`
  const emails = [teamAdminEmail, teamMemberEmail]
  const contents = [`您已将团队“${teamName}”团队成员${teamMemberName}移除`, `${teamAdminName}将您移除团队"${teamName}"`]
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  const promiseArray = []
  for (let i = 0; i < 2; i++) {
    if (emails[i].length == 0) {
      continue
    }
    let mailOptions = {
      to: emails[i],
      subject,
      templateName: 'remove_team_member',
      sub: {
        '%subject%': [subject],
        '%content%': [contents[i]],
        '%date%': [date],
        '%systemEmail%': [systemEmail],
      }
    }
    promiseArray.push(sendEnsureEmail(mailOptions, `remove_team_member.html`))
  }
  return Promise.all(promiseArray)
}

/**
 * Send reset password email
 *
 * Calling sample: `sendResetPasswordEmail("zhangsh@tenxcloud.com", "http://tenxcloud.com")`
 * @param {String} to
 * @param {String} resetPasswordURL
 * @returns {Promise}
 */
exports.sendResetPasswordEmail = function(to, resetPasswordURL) {
  const method = "sendResetPasswordEmail"
  const subject = `时速云用户重置密码`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  let mailOptions = {
    to,
    subject,
    templateName: 'reset_password',
    sub: {
      '%subject%': [subject],
      '%systemEmail%': [systemEmail],
      '%resetPasswordURL%': [resetPasswordURL],
      '%date%': [date],
    }
  }
  return sendEnsureEmail(mailOptions, 'reset_password.html')

  /*let data = fs.readFileSync(`${EMAIL_TEMPLATES_DIR}/reset_password.html`, 'utf8');

  data = data.replace(/\${subject}/g, subject)
  data = data.replace(/\${systemEmail}/g, systemEmail)
  data = data.replace(/\${resetPasswordURL}/g, resetPasswordURL)
  data = data.replace(/\${date}/g, date)
  mailOptions.html = data
  return sendEmail(mailOptions)*/
}

/**
 * 充值成功邮件通知函数
 *
 * @param {String} to
 * @param {String} payMethod
 * @param {String} payAmount
 * @param {String} payBalance
 * @param {String} paymentsHistoryUrl
 * @param {String} teamName
 * @returns {Promise}
 */
exports.sendChargeSuccessEmail = function (to, payMethod, payAmount, payBalance, paymentsHistoryUrl, teamName) {
  const method = 'sendChargeSuccessEmail'

  let subject = `个人帐户充值到帐通知`
  let payTarget = `个人帐户`
  if (teamName) {
    subject = `团队帐户充值到帐通知`
    payTarget = `团队 ${teamName} `
  }
  payMethod = switchPayTypeToText(payMethod)
  const date = moment(new Date()).format("YYYY-MM-DD")
  const mailOptions = {
    to,
    subject,
    templateName: 'charge_success',
    sub: {
      '%subject%': [subject],
      '%pay_method%': [payMethod],
      '%pay_target%': [payTarget],
      '%pay_amount%': [payAmount],
      '%pay_balance%': [payBalance],
      '%payments_history_url%': [paymentsHistoryUrl],
      '%date%': [date],
    }
  }

  return sendEnsureEmail(mailOptions, 'charge_success.html')
}

/**
 * Send user active email
 *
 * @param {String} to
 * @param {String} userActivationURL
 * @returns {Promise}
 */
exports.sendUserActivationEmail = function(to, userActivationURL) {
  const method = "sendUserActivationEmail"

  const subject = `时速云用户完成注册`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  let mailOptions = {
    to,
    subject,
    templateName: 'user_activation',
    sub: {
      '%subject%': [subject],
      '%systemEmail%': [systemEmail],
      '%userActivationURL%': [userActivationURL],
      '%date%': [date],
    }
  }
  return sendEnsureEmail(mailOptions, 'user_activation.html')

  /*fs.readFile(`${EMAIL_TEMPLATES_DIR}/user_activation.html`, 'utf8', function (err, data) {
    if (err) {
      logger.error(method, err)
        return
    }
    data = data.replace(/\${subject}/g, subject)
    data = data.replace(/\${systemEmail}/g, systemEmail)
    data = data.replace(/\${userActivationURL}/g, userActivationURL)
    data = data.replace(/\${date}/g, date)
    mailOptions.html = data
    sendEmail(mailOptions)
  });*/
}

/**
 * 将支付类型转换为文本
 *
 * @param {Number} type
 * @returns {String}
 */
function switchPayTypeToText(type) {
  type = parseInt(type)
  switch (type) {
    case 100:
      return '微信'
    case 101:
      return '支付宝'
    default:
      return '其他方式'
  }
}