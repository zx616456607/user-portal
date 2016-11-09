/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * v0.1 - 2016/11/04
 * @author mengyuan
 */

export default function parseServiceDomain(item) {
  let domains = []
  // item.ports is http/1234,tcp/321,udp/431
  if (item && item.metadata
    && item.ports
    && item.bindingDomains) {
    let schemaPort = item.ports
    schemaPort.split(',').map((pairStr) => {
      const pair = pairStr.split('/')
      if (pair.length == 2) {
        const schema = pair[0].toLowerCase()
        const port = pair[1]
        // 检查是bindingDomain是否是IP，（此正则并不精确但在此处够用了）
        item.bindingDomains.map((bindingDomain) => {
          let domain = ''
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
  return domains
}