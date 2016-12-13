/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Certificate controller: for Public Cloud Only
 *
 * v0.1 - 2016-12-13
 * @author Lei
*/
'use strict'

const apiFactory = require('../../services/api_factory')
const logger     = require('../../utils/logger.js').getLogger("certificate")
/*

*/
exports.listCertificates = function* () {
  const loginUser = this.session.loginUser

  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.certificates.get()

  this.body = {
    data: result
  }
}

/*
Create a new certificate
*/
exports.createCertificate = function* () {
  const loginUser = this.session.loginUser

  const spi = apiFactory.getSpi(loginUser)
  const certificate = this.request.body

  const result = yield spi.certificates.create(certificate)

  this.body = {
    data: result
  }
}
/*
Update an existing certificate
*/
exports.updateCertificate = function* () {
  const loginUser = this.session.loginUser
  const certId = this.params.id

  const spi = apiFactory.getSpi(loginUser)
  const newCertificate = this.request.body
  if ( !certId || !newCertificate) {
    const err = new Error('Certificate id/content is required.')
    err.status = 400
    throw err
  }
  const result = yield spi.certificates.update(certId, newCertificate)

  this.body = {
    data: result
  }
}
