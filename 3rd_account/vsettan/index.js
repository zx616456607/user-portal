/**
 * licensed materials - property of tenxcloud.com
 * (c) copyright 2017 tenxcloud. all rights reserved.
 */
/**
 * vsettan - enterprise
 * v0.1 - 2017-02-17
 * @author yangyubiao
 */
'use strict'
const vsettanConfig = require('../../configs/3rd_account/vsettan.js')
const urllib = require('urllib')
const apiFactory = require('../../services/api_factory.js')
const logger = require('../../utils/logger').getLogger('vsettan')
const uuid = require('node-uuid')

exports.vsettanLogin = function* (next) {
  const access_token = this.query.access_token
  const redirect_url = vsettanConfig.redirect_url
  if (!access_token) {
    this.redirect(redirect_url)
    return
  }
  const self = this
  try {
    //verify token and get user
    let user = yield urllib.request(`${vsettanConfig.usr_url}/o/token/`, {
      method: 'GET',
      data: {
        access_token,
        client_id: vsettanConfig.client_id,
        client_secret: vsettanConfig.client_secret,
      },
      dataType: 'json'
    }).then(result => {
      if (result.res.statusCode >= 300) {
        logger.error('verify user is faild access_token is ', access_token)
        self.redirect(redirect_url)
        return
      }
      return result.data
    })
    if (!user) return
    const spi = apiFactory.getTenxSysSignSpi({})
    // spi.user.get
    user.username = user.username.replace(/_/g, '-')
    user.userName = user.username
    user.password = uuid.v4()
    user.id = user.id.toString()
    user.is_3rd_account = 1
    //get project
    let project = yield urllib.request(`${vsettanConfig.project_url}/container/`, {
      method: 'GET',
      data: {
        token: access_token
      },
      dataType: 'json'
    }).then(result => {
      if (result.res.statusCode >= 300) {
        logger.error('get user project faile ', user, result)
        self.redirect(redirect_url)
        return
      }
      return result.data
    })
    if (user.username == 'admin') {
        project = {
          phone: '11111111111'
        }
    }
    if (!project) return
    user.phone = project.phone
    user.accountType = 'vsettan'
    user.accountID = user.id
    if (!user || !user.username || !user.email || !user.phone) {
      logger.error('username, email, phone is require')
      self.redirect(redirect_url)
      return
    }
    let userHaveProject = true
    if (!project.projects || project.projects.length <= 0) {
      userHaveProject = false
      logger.info('user have no project ', user)
    }
    this.request.body = {
      accountType: user.accountType,
      accountID: user.id
    }
    //verify is create or login
    const userInfo = yield spi.users.getBy([user.username, 'existence'])
    if (userInfo.data) {
      yield next
      self.redirect('/')
      return
    }
    //create user
    user.accountDetail = JSON.stringify(user)
    const createUser = yield spi.users.createBy(["vsettan"], null, user)
    //use userinfo login
    let api = apiFactory.getApi()
    api = yield api.users.createBy(['login'], null, { accountType: user.accountType, accountID: user.accountID }).then(result => {
      if (!userHaveProject) return
      api = apiFactory.getApi({
        user: result.userName,
        id: result.userID,
        namespace: result.namespace,
        email: result.email,
        phone: result.phone,
        token: result.apiToken,
        role: result.role,
        balance: result.balance,
      })
      return api
    })
    if (!api) {
      yield next
      self.redirect('/')
      return
    }
    const createProject = yield api.teams.createBy(['createbyproject'], null, project.projects)
    yield next
    self.redirect('/')
  } catch (error) {
    logger.error('vsettan login ', error)
    self.redirect('/')
  }
}
