/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * outputStream
 * v0.1 - 2017-11-07
 * @author Zhangpc
 */

var endOfLine = require('os').EOL
var logger = require('../../../utils/logger').getLogger('elasticdump-outputStream')

var outputStream = function (parent, file, options) {
  this.options = options
  this.parent = parent
  this.file = file
  this.lineCounter = 0
}

// accept arr, callback where arr is an array of objects
// return (error, writes)
outputStream.prototype.set = function (data, limit, offset, scope, callback) {
  var self = this
  var error = null
  var targetElem

  self.lineCounter = 0

  if (data.length === 0) {
    scope && scope.res.end()
    logger.info(`dump got ${offset} objects from source elasticsearch`)
  } else {
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

      let lineLog
      try {
        const lineObj = JSON.parse(_log)
        lineLog = lineObj.log || lineObj._source.log
      } catch (error) {
        lineLog = _log + endOfLine
      }

      scope && scope.res.write(lineLog)

      self.lineCounter++
    })

    process.nextTick(function () {
      callback(error, self.lineCounter)
    })
  }
}

exports.outputStream = outputStream
