
/**
* Licensed Materials - Property of tenxcloud.com
* (C) Copyright 2016 TenxCloud. All Rights Reserved.
*
* plugin_proxy controller
*
* v0.1 - 2017-05-19
* @author YangYuBiao
*/

const http = require('http')
const https = require('https')

const protocol = 'https'
const port = 6443
const host  = '192.168.1.163'
const prefix = '/api/v1/proxy/namespaces/kube-system/services/kubernetes-dashboard/'

const author = 'Bearer 814c5cd689b60ab5'
const reg = /\/proxy\/clusters\/[-a-zA-z0-9_]+\/plugins\/[-a-zA-z0-9_]+\/?/

exports.pluginsProxy = function* () {
  if(this.session.loginUser.role != 2 ) {
    const err = new Error('no admin user')
    err.status = 401
    throw err
  }
  const req = this.req
  yield new Promise((resolve, reject) => {
    asProxy(sendRequest({
      headers: Object.assign(req.headers, { Authorization: author }),
      path: prefix + req.url.replace(reg, ''),
      method: req.method
    }), this, resolve)
  })
}

function sendRequest(option) {
  const proxy  = protocol == 'https' ? https : http
  delete option.headers.host
  delete option.headers.port
  delete option.headers.protocol
  delete option.headers.cookie
  const defaultOptions = {
    port,
    host,
    rejectUnauthorized: false,
  }
  const proxyOption = Object.assign({}, defaultOptions, option)
  req = proxy.request(proxyOption)
  req.end()
  return req
}

function asProxy(socket, ctx, callback) {
  const res = ctx.res
  socket.on('response', (socketRes) => {
    const keyArr = Object.getOwnPropertyNames(socketRes.headers)
    ctx.status = socketRes.statusCode
    keyArr.forEach(key => {
      res.setHeader(key, socketRes.headers[key])
    })
    socketRes.pipe(res)
    socketRes.on('end', () => {
      if(callback) callback
    })
  })
}