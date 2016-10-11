'use strict'

const should = require('should')
const assert = require('assert')
const Service = require('../../../kubernetes/objects/service') 

describe('gitlab api', function () {
  this.timeout(1 * 1000)
  let service
  beforeEach(function() {
    service = new Service('test')
  })
  it('should add port', function (done) {
    service.addPort('test-1', 'HTTP', 15000, 3000)
    console.log(JSON.stringify(service, null, 2))
    done()
  })
  it('should add port', function (done) {
    service.addPort('test-2', 'UDP', 565655, 1080)
    service.addPort('test-3', 'HTTP', 234234, 234)
    console.log(JSON.stringify(service, null, 2))
    done()
  })
})