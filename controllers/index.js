/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Index controller
 *
 * v0.1 - 2016-09-05
 * @author Zhangpc
 */
'use strict'

const logger = require('../utils/logger').getLogger('controller/index')

exports.index = function* () {
  let method = 'index'
  let title = `${this.t('common:console')} | ${this.t('common:tenxcloud')}`
  yield this.render(global.indexHtml, { title, body: '' })
}