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
  catch(e) {
    bindingDomain = []
  }
  let domains = []
  // parse external domain, item.ports is http/1234,tcp/321,udp/431
  console.log("aaaaaaaaaaaaaaaaaa",item)
  console.log("bindingDomain",bindingDomain)
  if (item && item.metadata
    && item.ports
    && bindingDomain.length > 0) {
    let schemaPort = item.ports
    schemaPort.split(',').map((pairStr) => {
      const pair = pairStr.split('/')
      if (pair.length == 2) {
        const schema = pair[0].toLowerCase()
        const port = pair[1]
        bindingDomain.map((bindingDomain) => {
          let domain = ''
          // 检查是bindingDomain是否是IP，（此正则并不精确但在此处够用了）
          if (/^(\d{1,3}\.){3}\d{1,3}$/.test(bindingDomain)) {
            // e.g. http://192.168.1.123:1234
            domain = schema+'://'+bindingDomain+':'+port
          }
          else {
            // e.g. http://servicename-mengyuan.test.tenxcloud.com:8080
            domain = schema+'://'+item.metadata.name+'-'+item.metadata.namespace+'.'+bindingDomain+':'+port
          }
          // if prefix is http://, remove suffix :80
          domain = domain.replace(/^(http:\/\/.*):80$/,'$1')
          // if prefix is https://, remove suffix :443
          domain = domain.replace(/^(https:\/\/.*):443$/,'$1')
          domains.push(domain)
        })
      } 
    })
  }
  // parse interanl domain item.portForInternal is ["1234", "4567", "5234"]
  if (item && item.metadata.name && item.portForInternal) {
    item.portForInternal.map((port) => domains.push(item.metadata.name + ":" + port))
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