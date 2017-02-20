/**
 * licensed materials - property of tenxcloud.com
 * (c) copyright 2017 tenxcloud. all rights reserved.
 */
/**
 * vsettan - enterprise
 * v0.1 - 2017-02-17
 * @author yangyubiao
 */
const vsettanConfig = require('../../configs/3rd_account/vsettan.js')
const urllib = require('urllib')
const apiFactory = require('../../services/api_factory.js')
const logger = require('../../utils/logger').getLogger('vsettan')

exports.vsettanLogin = function* (next) {
  const access_token = this.query.access_token
  const redirect_url = vsettanConfig.base_url + vsettanConfig.redirect_url
  if (!access_token) {
    this.redirect(redirect_url)
    return
  }
  const self = this
  //verify token and get user
  let user = yield urllib.request(`${vsettanConfig.base_url}/o/token`, {
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
    const user = result.data
    return user
  })
  if (!user) return
  const spi = apiFactory.getTenxSysSignSpi({})
  // spi.user.get
  user.userName = user.username
  user.password = 'vsettan' + (new Date() - 0)
  user.is_3rd_account = 1
  //get project
  let project = yield urllib.request(`${vsettanConfig.base_url}/tenxcloud`, {
    method: 'GET',
    data: {
      access_token,
      client_id: vsettanConfig.client_id,
      client_secret: vsettanConfig.client_secret,
    },
    dataType: 'json'
  }).then(result => {
    if (result.res.statusCode >= 300) {
      logger.error('get user project faile ', user)
      self.redirect(redirect_url)
      return
    }
    const project = result.data
    return project
  })
  user.phone = project.phone
  if (!user || !user.username || !user.email || !user.phone) {
    logger.error('username, email, phone is require')
    self.redirect(redirect_url)
    return
  }
  let userHaveProject = true
  if (!project.projects || project.projects.length <= 0) {
    userHaveProject = false
    logger.inof('user have no project ', user)
  }
  this.request.body = user
  const userInfo = yield spi.users.getBy([user.username, 'existence'])
  if(userInfo.data) {
    yield next
    self.redirect('/')
    return
  }
  try {
    //verify is create or login
    const createUser = yield spi.users.create(user)
    //use userinfo login
    let api = apiFactory.getApi()
    api = yield api.users.createBy(['login'], null, { username: user.userName, password: user.password }).then(result => {
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
    if (!api) self.redirect('/')
    const createProject = yield api.teams.createBy(['createbyproject'], null, project.projects)
    
    yield next
    self.redirect('/')
  } catch(err){
     self.redirect('/')
  }
}
