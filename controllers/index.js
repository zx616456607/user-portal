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
const {
  url,
  tenx_api: { external_protocol, external_host },
} = config

exports.index = function* (next) {
  // skip static files
  // |-----html-----|---------image-------|-----font---|
  if (/\.html|js|css|jpe?g|png|gif|svg|ico|eot|ttf|woff$/.test(this.path)) {
    return yield next
  }
  const method = 'index'
  let title = this.t('common:console')
  if (this.path === '/login') {
    title = this.t('common:login')
  }
  const oemInfo = global.globalConfig.oemInfo || {}
  const productName = oemInfo.company && oemInfo.company.productName
  if (productName) {
    title = (this.title || title) + ' | ' + productName
  }
  const initialConfig = {
    showMoreLoginMethods: config.showMoreLoginMethods === 'true',
    keycloak: keycloakConfig,
    msaPortalUrl: globalConfig.msaConfig.url,
    paasApiUrl: `${external_protocol}://${external_host}/api/v2`,
    userPortalUrl: url,
  }
  yield this.render(global.indexHtml, {
    title,
    body: '',
    initialConfig: JSON.stringify(initialConfig),
  })
}

exports.getGlobalConfig = function* () {
  const {
    oemInfo, vmWrapConfig,
    billingConfig,
  } = global.globalConfig
  this.body = {
    oemInfo,
    vmWrapEnabled: vmWrapConfig && vmWrapConfig.enabled,
    billingEnabled: billingConfig && billingConfig.enabled,
  }
}
