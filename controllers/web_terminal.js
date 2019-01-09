'use strict'

const https = require('https')
const url = require('url')
const urllib = require('urllib')
const config = require('../configs')
config.tenx_api = global.globalConfig.tenx_api
const queryString = require('querystring')
const logger = require('../utils/logger').getLogger('web_terminal')
const sessions = require('../services/session')
const WebSocketServer = require('ws').Server

//var wsUrl = "wss://kubelet:kubelet@" + data['host'] + ":" + data['port'] + "/api/v1/namespaces/" + data['namespace'] + "/pods/" + data['pod'] + "/exec?stdout=1&stdin=1&stderr=1&tty=1&command=%2Fbin%2Fsh&command=-i";
module.exports = function webTerminal(server, redis) {
  const wss = new WebSocketServer({noServer: true})
  wss.on('connection', (ws, request, message) => {
    // only 401 or 403 reach here
    const b64 = ' ' + Buffer.from(message).toString('base64')
    ws.send(b64, () => ws.close())
  })
  server.on('upgrade', (req, client, head) => {
    if (!/\/api\/v1\/cluster\/.+\/namespaces\/.+\/pods\/.+\/exec/.test(req.url)) return

    client.on('error', error => logger.error('client error', error))

    const session = _getSessionFromHeaders(req.headers)
    if (!session || !session.id) {
      wss.handleUpgrade(req, client, head,
        ws => wss.emit('connection', ws, req, 'only logged in user with valid cookies can access pod'))
      return
    }
    const urlObj = url.parse(req.url)
    const path = urlObj.pathname.split('/')
    const query = queryString.parse(urlObj.query) || {}
    const cluster = path[4]
    const namespace = path[6]
    const podName = path[8]
    const container = query.container
    const rows = query.rows || 48
    const cols = query.cols || 150
    sessions.getValueByKey(session.id, true /* parse json */).then(
      sessionInfo => _handleSessionInfo(sessionInfo, {
        cluster,
        namespace,
        podName,
        container,
        rows,
        cols,
        session,
        req,
        head,
        client,
        wss
      }))
  })
}

function _handleSessionInfo(sessionInfo, context) {
  const loginUser = sessionInfo.loginUser
  const session = context.session
  context.loginUser = loginUser
  const headers = {
    'username': loginUser.user,
    'Authorization': `token ${loginUser.token}`,
  }
  if (session.project && session.project !== 'default') {
    headers['project'] = session.project
  }
  if (session.onbehalfuser && session.onbehalfuser !== 'default') {
    headers['onbehalfuser'] = session.onbehalfuser
  }
  const apiPath = `/api/v2/clusters/${context.cluster}/instances/${context.podName}/privilege`
  urllib.request(config.tenx_api.protocol + '://' + config.tenx_api.host + apiPath, {headers}).then(
    rawResponse => _handleClusterInfo(rawResponse, context))
}

function _handleClusterInfo(rawResponse, context) {
  const client = context.client
  const response = JSON.parse(rawResponse.data.toString())
  if (_isForbidden(response)) {
    const wss = context.wss
    logger.error('user has no permission to access pod, cluster id', context.cluster, 'user', context.loginUser.user, 'namespace', context.namespace, 'pod', context.podName)
    wss.handleUpgrade(context.req, context.client, context.head,
      ws => wss.emit('connection', ws, context.req, '[403 resource permission error] This operation has no permissions'))
    //   ws => wss.emit('connection', ws, context.req, JSON.stringify(response)))
    return
  }
  const clusterInfo = response.data
  const headers = _getProxyHeader(context.req.headers)
  headers.rejectUnauthorized = false
  headers.headers.Authorization = `bearer ${clusterInfo.apiToken}`
  let host = clusterInfo.apiHost.split(':')
  let port = host[1]
  host = host[0]
  headers.hostname = host
  headers.port = port
  const apiVersion = clusterInfo.apiVersion
  const cmd = queryString.escape(`export COLUMNS=${context.cols}; export LINES=${context.rows}; if [ -x "/bin/bash" ]; then /bin/bash;else /bin/sh;fi`)
  headers.path = `/api/${apiVersion}/namespaces/${context.namespace}/pods/${context.podName}/exec?stdout=1&stdin=1&stderr=1&tty=1&command=%2Fbin%2Fsh&command=-c&command=${cmd}`
  if (context.container) {
    headers.path = headers.path + `&container=${context.container}`
  }
  const proxy = https.request(headers, res => {
    let data = ''
    res.on('data', d => {
      data += d.toString()
    })
    res.on('end', () => {
      logger.error(data)
    })
  })
  proxy.on('upgrade', (res, socket, head) => {
    client.write(_formatProxyResponse(res))
    client.pipe(socket)
    socket.pipe(client)
  })
  proxy.on('error', (error) => {
    logger.error('webterminal error', error)
    client.write("Sorry, cant't connect to this container ")
  })
  proxy.end()
}

function _isForbidden(response) {
  return response.code && response.code === 403 &&
    response.status && response.status === 'Failure' &&
    response.reason && response.reason === 'Forbidden'
}

function _getSessionFromHeaders(headers) {
  if (headers && headers.cookie) {
    const parts = headers.cookie.split('; ')
    const length = parts.length
    const session = {}
    let found = 0
    for (let i = 0; i < length; ++i) {
      const part = parts[i]
      const keyValue = part.split('=')
      if (keyValue.length !== 2) continue
      if (keyValue[0] === 'tce') {
        found++
        session.id = keyValue[1]
      } else if (keyValue[0] === 'tce_user_current_config') {
        const spaces = keyValue[1].split(',')
        if (spaces.length === 4) {
          found++
          session.project = spaces[1]
          session.onbehalfuser = spaces[3]
        }
      }
      if (found > 2) {
        return session
      }
    }
    return session
  }
  return null
}

function _getProxyHeader(headers) {
  const keys = Object.getOwnPropertyNames(headers)
  const proxyHeader = {headers: {}}
  keys.forEach(key => {
    if (key.indexOf('sec') >= 0 || key === 'upgrade' || key === 'connection') {
      proxyHeader.headers[key] = headers[key]
      return
    }
    proxyHeader[key] = headers[key]
  })
  return proxyHeader
}

function _formatProxyResponse(res) {
  const headers = res.headers
  const keys = Object.getOwnPropertyNames(headers)
  let switchLine = '\n'
  let response = [`HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}${switchLine}`]
  keys.forEach(key => {
    response.push(`${key}: ${headers[key]}${switchLine}`)
  })
  response.push(switchLine)
  return response.join('')
}
