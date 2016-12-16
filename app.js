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
const constants = require('./configs/constants')
const middlewares = require('./services/middlewares')
const logger = require('./utils/logger').getLogger('app')
const app = koa()
const terminal = require('./controllers/web_terminal')


global.Promise = require('bluebird')
// Disabled reject unauthorized
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
/*
 * Koa middlewares
 */

// For koa logs
const koaLogger = require('koa-logger')
app.use(koaLogger())

// Set app config
const packageJSON = require('./package.json')
app.name = packageJSON.name
app.version = packageJSON.version

// For unexpected error handling
app.use(function* (next) {
  try {
    yield next
  } catch (err) {
    logger.error('catch-error', err.stack)
    logger.error('catch-error', JSON.stringify(err))
    let status = err.status || err.statusCode || err.code || 500
    let intStatus = parseInt(status)
    if (intStatus < 100 || isNaN(intStatus)) {
      logger.error(`Unexpected status code: ${status}`)
      intStatus = 500
    }
    this.status = intStatus
    this.body = {
      statusCode: intStatus,
      message: err.message || err
    }
    // this.app.emit('error', err, this)
  }
})

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
const session = require('koa-generic-session')
const KeyGrip = require('keygrip')
app.keys = config.session_secret
app.keys = new KeyGrip(config.session_secret, 'sha256')
const sessionOpts = {
  key: config.session_key,
  rolling: true,
  maxAge: 1800000
}
const sessionMiddleware = session(sessionOpts)

let sessionStore;
// Session store
// @important! server will pending here until the session store is connected
if (config.session_store.url && config.session_store.pass) {
  const redisStore = require('koa-redis')
  let sessionRedisConfig = config.session_store.url.split(':')
  sessionStore = new redisStore({
    host: sessionRedisConfig[0],
    port: sessionRedisConfig[1],
    pass: config.session_store.pass
  })
  sessionOpts.store = sessionStore
}
app.use(session(sessionOpts))

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
// const koaBody = require('koa-body')({
//   multipart: true,
//   formidable: {
//     keepExtensions: true,
//     maxFieldsSize: 1024 * 1024 * 1024,
//     // uploadDir: TEMP_DIR
//   }
// })

if (config.running_mode === constants.STANDARD_MODE) {
  app.use(function* (next) {
    if (this.request.url === '/payments/wechat_pay/notify') {
      this.request.headers['content-type'] = 'text/plain'
    }
    yield next
  })
}
const koaBody = require('koa-body')()
app.use(koaBody)

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

// Internationalization
const i18n = require('./services/i18n')
app.use(i18n.handle())
app.use(i18n.middleware)

// For test
app.use(function* (next) {
  this.session.loginUser = {
    user: "zhangpc",
    id: 104,
    namespace: "zhangpc",
    token: "jgokzgfitsewtmbpxsbhtggabvrnktepuzohnssqjnsirtot"
  }
  yield next
})

////////////////////////////////////////////////////////////////////////////////
//////////////// Only add routes for standard mode /////////////////////////////
////////////////////////////////////////////////////////////////////////////////
if (config.running_mode === constants.STANDARD_MODE) {
  const standardRoutes = require('./routes/_standard/api')
  const standardNoAuthRoutes = require('./routes/_standard/no_auth')
  app.use(standardRoutes(Router))
  app.use(standardNoAuthRoutes(Router))
}

// Routes middleware
// ~ No authentication required
const noAuthRoutes = require('./routes/no_auth')
app.use(noAuthRoutes(Router))
// ~ Authentication required
app.use(middlewares.auth)
// For set user current config
app.use(middlewares.setUserCurrentConfig)
const indexRoutes = require('./routes')
app.use(indexRoutes(Router))
const apiRoutes = require('./routes/api')
app.use(apiRoutes(Router))

// For 404
app.use(function* pageNotFound(next) {
  yield next
  if (404 != this.status) return

  // we need to explicitly set 404 here
  // so that koa doesn't assign 200 on body=
  this.status = 404
  switch (this.accepts('json', 'html')) {
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

logger.info(`Node env in '${config.node_env}'`)
logger.info(`Server started in '${config.running_mode}' running mode`)
// Create server
let server
if (config.protocol !== 'https') {
  // Http server
  const http = require('http')
  server = http.createServer(app.callback()).listen(config.port, config.hostname, function () {
    setTimeout(function () {
      logger.info(`${app.name}@${app.version} is listening on port ${config.port}`)
      logger.info(`Open up http://${config.hostname}:${config.port}/ in your browser`)
    }, 1500)
  })
} else {
  // Https server
  const https = require('https')
  const prikeyfile = './sslkey/private.key'
  const certfile = './sslkey/certs.crt'
  const httpsoptions = {
    key: fs.readFileSync(prikeyfile),
    cert: fs.readFileSync(certfile)
  }
  const server = https.createServer(httpsoptions, app.callback()).listen(config.port, config.host, function () {
    setTimeout(function () {
      logger.info(`${app.name}@${app.version} is listening on port ${config.port}`)
      logger.info(`Open up https://${config.hostname}:${config.port}/ in your browser`)
    }, 1500)
  })
}


// For socket server
/*const io = require('socket.io')(server)
const socketController = require('./controllers/socket')
io.on('connection', function (socket) {
  socketController(socket)
})*/

// Set server timeout to 5 mins
const serverTimeOut = 1000 * 60 * 5
logger.info('Set server timeout to ' + serverTimeOut + ' ms')
server.setTimeout(serverTimeOut, function (socket) {
  logger.warn('Server timeout occurs')
})

terminal(server, sessionStore)

module.exports = server