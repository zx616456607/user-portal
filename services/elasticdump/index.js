/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Elasticdump
 * v0.1 - 2017-11-07
 * @author Zhangpc
 */
'use strict'

const Elasticdump = require('elasticdump-tenx')
const moment = require('moment')
const endOfLine = require('os').EOL
const path = require('path')
const fs = require('fs')
const zlib = require('zlib')
const Readable = require('stream').Readable
const utils = require('../../utils')
const logger = require('../../utils/logger').getLogger('elasticdump')

function getTimestamp(options) {
  const defaultDay = 4
  let gte = options.gte
  let lte = options.lte
  if (gte && utils.getType(gte) !== 'date') {
    gte = new Date(gte)
    if (gte === lte) {
      gte.setDate(gte.getDate() - 1)
    }
  }
  if (lte && utils.getType(lte) !== 'date') {
    lte = new Date(lte)
  }
  if (!gte && !lte) {
    gte = new Date()
    lte = new Date()
    gte.setDate(gte.getDate() - defaultDay)
  } else if (!lte) {
    lte = new Date(gte.getTime())
    lte.setDate(lte.getDate() - defaultDay)
  } else if (!gte) {
    gte = new Date()
  }
  return { lte, gte }
}
exports.getTimestamp = getTimestamp

function formatDateToLogstash(date) {
  return `logstash-${moment(date).format('YYYY.MM.DD')}`
}

function getIndexByTimestamp(timestamp) {
  const gte = timestamp.gte
  const lte = timestamp.lte
  const index = [ formatDateToLogstash(gte) ]
  let i = new Date(gte.getTime())
  i.setDate(i.getDate() + 1)
  while (i < lte) {
    index.push(formatDateToLogstash(i))
    i.setDate(i.getDate() + 1)
  }
  const lteLogstash = formatDateToLogstash(lte)
  if (index.indexOf(lteLogstash) < 0) {
    index.push(lteLogstash)
  }
  return index
}
exports.getIndexByTimestamp = getIndexByTimestamp

function getSearchBody(namespace, options) {
  options = options || {}
  const isFile = options.isFile
  const containerName = options.containerName
  const podNames = options.podNames
  const from = options.from
  const size = options.size
  const timestamp = getTimestamp(options)
  const gte = timestamp.gte
  const lte = timestamp.lte
  const body = {
    from,
    size,
    "_source": [
      "log",
      "kubernetes.pod_name",
      "docker.container_id",
      "time_nano",
      "filename"
    ],
    "sort": [
      {
        "time_nano": {
          "order": "desc",
          "unmapped_type": "string"
        }
      }
    ],
    "query": {
      "bool": {
        "must": [
          {
            "terms": {
              "stream": [
                "stderr",
                "stdout"
              ]
            }
          },
          {
            "range": {
              "@timestamp": {
                gte,
                lte
              }
            }
          },
          {
            "term": {
              "kubernetes.namespace_name": namespace
            }
          },
          {
            "terms": {
              "kubernetes.pod_name": podNames
            }
          }
        ]
      }
    }
  }
  if (isFile) {
    body.query.bool.must[0].terms.stream = [ 'file' ]
  }
  if (containerName) {
    body.query.bool.must[3].terms = {
      "kubernetes.container_name": [
        containerName
      ]
    }
  }
  return body
}
exports.getSearchBody = getSearchBody

/**
 *
 *
 * @param {object} cluster
 * @param {any} output
 * @param {object} options
 * ```
 * {
 *   type,
 *   searchBody: { namespace, options }
 * }
 * ```
 * @return
 */
function getDumper(cluster, output, options) {
  const defaults = {
    limit: 100,
    offset: 0,
    debug: false,
    type: 'data',
    delete: false,
    maxSockets: null,
    input: null,
    'input-index': null,
    output: null,
    'output-index': null,
    inputTransport: null,
    outputTransport: null,
    searchBody: null,
    headers: null,
    sourceOnly: false,
    jsonLines: false,
    format: '',
    'ignore-errors': false,
    scrollTime: '10m',
    timeout: null,
    toLog: null,
    quiet: false,
    awsChain: false,
    awsAccessKeyId: null,
    awsSecretAccessKey: null,
    awsIniFileProfile: null,
    awsIniFileName: null,
    transform: null,
    httpAuthFile: null,
    ignoreUnavailable: false
  }
  // searchBody
  options.searchBody = getSearchBody(options.searchBody.namespace, options.searchBody.options)

  // input-index
  const index = getIndexByTimestamp(options.searchBody.query.bool.must[1].range['@timestamp'])
  options['input-index'] = index.join(',')

  // input/ouput
  const apiProtocol = cluster.apiProtocol
  const apiHost = cluster.apiHost
  const apiToken = cluster.apiToken
  const apiVersion = cluster.apiVersion
  const input = `${apiProtocol}://${apiHost}/api/${apiVersion}/proxy/namespaces/kube-system/services/elasticsearch-logging:9200`
  options.input = input
  options.output = output

  // headers
  const headers = {
    "Authorization": `Bearer ${apiToken}`
  }
  options.headers = headers

  const dumpOptions = Object.assign({}, defaults, options)
  return new Elasticdump(input, output, dumpOptions)
}
exports.getDumper = getDumper

function dump(cluster, searchBody, scope) {
  // ~ outputStream start ~
  const outputStream = function (parent, file, options) {
    this.options = options
    this.parent = parent
    this.file = file
    this.lineCounter = 0
  }
  const readStream = new Readable({
    read() {}
  })

  const gzipStream = zlib.createGzip()

  outputStream.prototype.set = function (data, limit, offset, _, callback) {
    const self = this
    let error = null
    let targetElem

    self.lineCounter = 0

    if (data.length === 0) {
      readStream.push(null)
      readStream.pipe(gzipStream).pipe(scope.res)
      logger.info(`dump got ${offset} objects from source elasticsearch`)
      return
    }
    data.forEach(function (elem) {
      // Select _source if sourceOnly
      if (self.parent.options.sourceOnly === true) {
        targetElem = elem._source
      } else {
        targetElem = elem
      }
      let _log

      if (self.parent.options.format && self.parent.options.format.toLowerCase() === 'human') {
        _log = util.inspect(targetElem, false, 10, true)
      } else {
        _log = JSON.stringify(targetElem)
      }

      let lineLog = ''
      try {
        const lineObj = JSON.parse(_log) || {}
        const podName = lineObj.kubernetes && lineObj.kubernetes.pod_name
        const timestamp = lineObj.time_nano
        if (podName) {
          lineLog += `[${podName}] `
        }
        if (timestamp) {
          lineLog += `[${utils.formatDate(timestamp / 1000000)}] `
        }
        lineLog += lineObj.log || lineObj._source.log
      } catch (error) {
        lineLog = _log + endOfLine
      }

      readStream.push(lineLog)

      self.lineCounter++
    })

    process.nextTick(function () {
      callback(error, self.lineCounter)
    })
  }
  // ~ outputStream end ~

  const method = 'dump'
  const options = {
    searchBody,
    limit: 100,
    sourceOnly: true,
    outputTransport: { outputStream },
    ignoreUnavailable: true,
  }
  const dumper = getDumper(cluster, 'outputStream', options)
  return new Promise((resolve, reject) => {
    dumper.on('log', function (message) {
      logger.debug(method, message)
    })
    dumper.on('error', function (error) {
      logger.error(method, 'Error Emitted => ' + (error.message || JSON.stringify(error)))
    })
    dumper.dump((error, result) => {
      if (error) {
        return reject(error)
      }
      resolve(result)
    }, null, null, null, null)
  })
}
exports.dump = dump
