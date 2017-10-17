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

const path = require('path')
const Elasticdump = require('elasticdump-tenx')
const moment = require('moment')
const utils = require('../../utils')

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

  console.log('options', JSON.stringify(options, null, 2))
  const dumpOptions = Object.assign({}, defaults, options)
  return new Elasticdump(input, output, dumpOptions)
}
exports.getDumper = getDumper

function dump(cluster, searchBody, scope) {
  const options = {
    searchBody,
    limit: 100,
    sourceOnly: true,
    outputTransport: path.join(__dirname, './transports/outputStream'),
    ignoreUnavailable: true,
  }
  const dumper = getDumper(cluster, './test.log', options)
  return new Promise((resolve, reject) => {
    dumper.on('log', function (message) { console.log('log', message) })
    dumper.on('error', function (error) {
      console.error('error', 'Error Emitted => ' + (error.message || JSON.stringify(error)))
    })
    dumper.dump((error, result) => {
      if (error) {
        return reject(error)
      }
      resolve(result)
    }, null, null, null, null, scope)
  })
}
exports.dump = dump
