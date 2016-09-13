/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Index app file
 *
 * v0.1 - 2016-09-02
 * @author Zhangpc
 */
'use strict'

const fs = require('fs')
const path = require('path')
const koa = require('koa')
const Router = require('koa-router')
const c2k = require('koa-connect')
const config = require('./configs')
const logger = require('./utils/logger').getLogger('app')
const app = koa()
global.Promise = require('bluebird')

/*
 * Koa middlewares
 */

// For koa logs
const koaLogger = require('koa-logger')
app.use(koaLogger())

// Webpack for debug
global.CONFIG_PROD = true
if (process.env.NODE_ENV === 'development') {
  global.CONFIG_PROD = false
}
global.indexHtml = global.CONFIG_PROD ? 'index' : 'index.debug'
if (!global.CONFIG_PROD) {
  const webpack = require('webpack')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const webpackConfig = require('./webpack.config')
  const compiler = webpack(webpackConfig)
  app.use(c2k(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
    watchOptions: {
      aggregateTimeout: 500,
      poll: true
    }
  })))
  app.use(c2k(webpackHotMiddleware(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
  })))
}

// Cookie & session
const session = require('koa-session')
const KeyGrip = require('keygrip')
app.keys = config.session_secret
app.keys = new KeyGrip(config.session_secret, 'sha256');
app.use(session(app))

// Serve files from ./public
const serve = require('koa-static')
app.use(serve(__dirname + '/static'))

// Website favicon
const favicon = require('koa-favicon')
app.use(favicon(__dirname + '/static/favicon.ico'))

// Parser content-Type applicationnd.docker.distribution.events.v1+json
/*app.use(function* (next) {
  let contentType = this.headers["content-type"]
  if (contentType) {
    if (contentType.indexOf('docker') >= 0) {
      this.headers['content-type'] = 'application/json'
    }
  }
  yield next
})*/

// For body parser
const koaBody = require('koa-body')({
  multipart: true,
  formidable: {
    keepExtensions: true,
    maxFieldsSize: 1024 * 1024 * 1024,
    // uploadDir: TEMP_DIR
  }
})
app.use(koaBody)

// For unexpected error handling
app.use(function* (next) {
  try {
    yield next
  } catch (err) {
    if (err.status < 100) {
      logger.error(`Unexpected status code: ${err.status}`)
      err.status = 500
    }
    this.status = err.status || 500
    this.body = err
    this.app.emit('error', err, this)
  }
})

// For views
const render = require('koa-ejs')
const viewOps = {
  root: __dirname,
  layout: false,
  viewExt: 'html',
  debug: false,
  cache: true
}
if (!global.CONFIG_PROD) {
  viewOps.debug = true
  viewOps.cache = false
}
render(app, viewOps)

// Auth by cookie csrftoken
/*const auth = require('./utils/auth')
app.use(auth.authCookieUser)*/

// Internationalization, include i18n backend and reat-intl frontend
const i18next = require('i18next')
const i18nBackend = require('i18next-node-fs-backend')
const i18Middleware = require('i18next-express-middleware')
const DEFAULT_LOCALE = 'zh'
const INTL_LOCALE_LIST = ['zh', 'en']
const nsFills = fs.readdirSync(path.resolve('./static/locales/backend/zh'))
let i18nNS = []
nsFills.forEach(function (name) {
  if (path.extname(name) === '.json') {
    i18nNS.push(path.basename(name, '.json'))
  }
})
const i18nOptions = {
  ns: i18nNS,
  load: "languageOnly",
  fallbackLng: DEFAULT_LOCALE,
  debug: false,
  backend: {
    loadPath: path.join(__dirname, './static/locales/backend/{{lng}}/{{ns}}.json')
  },
  detection: {
    order: ['cookie', 'header'],
    lookupCookie: config.intl_cookie_name,
    caches: false
  }
}
i18next
  .use(i18nBackend)
  .use(i18Middleware.LanguageDetector)
  .init(i18nOptions)
app.use(c2k(i18Middleware.handle(i18next)))
// Set cookie and state for internationalization
app.use(function* (next) {
  let t = i18next.t.bind(i18next)
  this.t = t
  this.state.t = t
  let localeCookie = this.cookies.get(config.intl_cookie_name)
  if (localeCookie && INTL_LOCALE_LIST.indexOf(localeCookie) > -1) {
    this.state.intl_locale = localeCookie
    return yield next
  }
  this.state.intl_locale = DEFAULT_LOCALE
  let expdate = new Date()
  expdate.setMonth(expdate.getMonth() + 3)
  this.cookies.set(config.intl_cookie_name, DEFAULT_LOCALE, { expires: expdate, signed: true, httpOnly: false })
  yield next
})

// Routes middleware
const indexRoutes = require('./routes')
app.use(indexRoutes(Router))

// For 404
app.use(function* pageNotFound(next) {
  yield next
  if (404 != this.status) return

  // we need to explicitly set 404 here
  // so that koa doesn't assign 200 on body=
  this.status = 404
  switch (this.accepts('html', 'json')) {
    case 'html':
      this.type = 'html'
      this.body = '<h3>Page Not Found</h3>'
      break
    case 'json':
      this.body = {
        statusCode: 404,
        message: 'Page Not Found'
      }
      break
    default:
      this.type = 'text'
      this.body = 'Page Not Found'
  }
})

// create http server
const http = require('http')
const server = http.createServer(app.callback()).listen(config.port, config.host, function () {
  setTimeout(function () {
    logger.info('Tenx Storage Server is listening on port ' + config.port)
    logger.info('Open up http://' + config.host + ':' + config.port + '/ in your browser.')
  }, 1500)
})

// For socket server
/*const io = require('socket.io')(server)
const socketController = require('./controllers/socket')
io.on('connection', function (socket) {
  socketController(socket)
})*/

// Create https server
/*const https = require('https')
const fs = require('fs')
const prikeyfile = './sslkey/private.key'
const certfile = './sslkey/certs.crt'
const httpsoptions = {
  key: fs.readFileSync(prikeyfile),
  cert: fs.readFileSync(certfile)
}
const server = https.createServer(httpsoptions, app.callback()).listen(config.port, config.host, function() {
  setTimeout(function() {
    logger.info('TenxCloud CI & CD Service is listening on port ' + config.port)
    logger.info('Open up ' + config.protocol + '://' + config.host + ':' + config.port +'/ in your browser.')
  }, 1500)
})*/

// Set server timeout to 5 mins
const serverTimeOut = 1000 * 60 * 5
logger.info('Set server timeout to ' + serverTimeOut + ' ms')
server.setTimeout(serverTimeOut, function (socket) {
  logger.warn('Server timeout occurs')
})

module.exports = server