/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * App template controller
 *
 * v0.1 - 2016-10-28
 * @author Lei
*/
'use strict'

const apiFactory = require('../services/api_factory')
const logger     = require('../utils/logger.js').getLogger("app_template")

/*
List user templates based on router
filter=owned will list user/space templates
other value will only list public ones
*/
exports.listTemplates = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter

  const api = apiFactory.getTemplateApi(loginUser)
  const result = yield api.get({"filter": filter})

  this.body = {
    data: result
  }
}
/*
Create a new template
*/
exports.createTemplate = function* () {
  const loginUser = this.session.loginUser

  const api = apiFactory.getTemplateApi(loginUser)
  const template = this.request.body
  if (!template || !template.name || !template.content) {
    const err = new Error('Template name/content is required.')
    err.status = 400
    throw err
  }

  const result = yield api.create(template)

  this.body = {
    data: result
  }
}
/*
Update an existing template
*/
exports.updateTemplate = function* () {
  const loginUser = this.session.loginUser
  const templateid = this.params.templateid

  const api = apiFactory.getTemplateApi(loginUser)
  const template = this.request.body
  if (!template || !template.name || !template.content) {
    const err = new Error('Template name/content is required.')
    err.status = 400
    throw err 
  }
  const result = yield api.update(templateid, template)

  this.body = {
    data: result
  }
}

/*
Delete a template
*/
exports.deleteTemplate = function* () {
  const loginUser = this.session.loginUser
  const templateid = this.params.templateid

  const api = apiFactory.getTemplateApi(loginUser)
  const result = yield api.delete(templateid)

  this.body = {
    data: result
  }
}