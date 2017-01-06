/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * v0.1 - 2016/11/04
 * @author mengyuan
 */

export function parseServiceDomain(item, bindingDomainStr) {
  let bindingDomain = []
  try {
    bindingDomain = JSON.parse(bindingDomainStr)
  }
  catch (e) {
    bindingDomain = []
  }
  let domains = []
  // parse external domain, item.portsForExternal is array like [{name:"abasd",port:12345,protocol:"TCP",targetPort:1234},...]
  if (item && item.metadata
    && item.portsForExternal
    && bindingDomain.length > 0) {
    item.portsForExternal.map((port) => {
      let nameInfo = item.metadata.name
      let portInfo = ":" + port.proxyPort
      if (bindingDomain && port.protocol.toLowerCase() == 'http') {
        // Remove port number and use port name as url prefix
        portInfo = ''
        nameInfo = port.name
      }
      bindingDomain.map((bindingDomain) => {
        let domain = ''
        // 检查是bindingDomain是否是IP，（此正则并不精确但在此处够用了）
        if (/^(\d{1,3}\.){3}\d{1,3}$/.test(bindingDomain)) {
          // e.g. http://192.168.1.123:1234
          domain = bindingDomain + portInfo
        }
        else {
          // e.g. http://servicename-mengyuan.test.tenxcloud.com:8080
          domain = nameInfo+ '-' + item.metadata.namespace + '.' + bindingDomain + portInfo
        }
        // if prefix is http://, remove suffix :80
        domain = domain.replace(/^(http:\/\/.*):80$/, '$1')
        // if prefix is https://, remove suffix :443
        domain = domain.replace(/^(https:\/\/.*):443$/, '$1')
        domains.push({domain, isInternal: false, interPort: port.targetPort})
      })
    })
  }
  // parse interanl domain item.portForInternal is ["1234", "4567", "5234"]
  if (item && item.metadata.name && item.portForInternal) {
    item.portForInternal.map((port) => domains.push({domain: item.metadata.name + ":" + port, isInternal: true, interPort: port}))
  }
  return domains
}

export function parseAppDomain(app, bindingDomainStr) {
  let domains = []
  app.services.map((item) => {
    domains.push({
      name: item.metadata.name,
      data: parseServiceDomain(item, bindingDomainStr)
    })
  })
  return domains
}