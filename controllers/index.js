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
const config = require('../configs')
const keycloakConfig = require('../configs/3rd_account/keycloak')

exports.index = function* () {
  const method = 'index'
  let title = this.t('common:login')
  const oemInfo = global.globalConfig.oemInfo || {}
  const productName = oemInfo.company && oemInfo.company.productName
  if (productName) {
    title = (this.title || title) + ' | ' + productName
  }
  const initialConfig = {
    showMoreLoginMethods: config.showMoreLoginMethods === 'true',
    keycloak: keycloakConfig,
  }
  yield this.render(global.indexHtml, {
    title,
    body: '',
    initialConfig: JSON.stringify(initialConfig),
  })
}