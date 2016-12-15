'use strict'

const https = require('https')
const os = require('os')

//var wsUrl = "wss://kubelet:kubelet@" + data['host'] + ":" + data['port'] + "/api/v1/namespaces/" + data['namespace'] + "/pods/" + data['pod'] + "/exec?stdout=1&stdin=1&stderr=1&tty=1&command=%2Fbin%2Fsh&command=-i";
module.exports = function (server, redis) {
  server.on('upgrade', (req, client, head) => {
    if (!/\/api\/v1\/namespaces\/.+\/pods\/.+\/exec/.test(req.url)) return
    //const redisClient = redis.client
    const path = req.url.split('/')
    const namespace = path[4]
    const podName = path[6]
    const headers = _getProxyHeader(req.headers)
    headers.headers.Authorization = 'bearer c0d7rQicMtZJkeFllBaCZSMjfaCbASDV'
    headers.rejectUnauthorized = false
    headers.hostname = '192.168.1.93'
    headers.path = `/api/v1/namespaces/${namespace}/pods/${podName}/exec?stdout=1&stdin=1&stderr=1&tty=1&command=%2Fbin%2Fsh&command=-i`
    headers.port = 6443
    const proxy = https.request(headers)
    proxy.on('upgrade', (res, socket, head) => {
      client.write(_formatProxyResponse(res))
      client.pipe(socket)
      socket.pipe(client)
    })
    proxy.on('error', (error) => {
      client.write("Sorry, cant't connect to this container ")
      return
    })
    proxy.end()
    function _getProxyHeader(headers) {
      const keys = Object.getOwnPropertyNames(headers)
      const proxyHeader = { headers: {} }
      keys.forEach(key => {
        if (key.indexOf('sec') >= 0 || key.indexOf('upgrade') >= 0 || key === 'connection') {
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
      const sys = os.type()
      let switchLine = '\n';
      // if (sys.toLowerCase().indexOf('windows') >= 0) {
      //   switchLine = '\r\n';
      // }
      let response = [`HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}${switchLine}`]
      keys.forEach(key => {
        response.push(`${key}: ${headers[key]}${switchLine}`)
      })
      response.push(switchLine)
      return response.join('')
    }
  })
}
