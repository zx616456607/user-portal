/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

'use strict'

// js version of istio.io/istio/pilot/pkg/model/validation.go

const wildcardPrefix = /^\*|(\*|\*-)?([a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?)$/
const dns1123Label = /^[a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?$/

function validateDomainName(name) {
  if (name !== '*' && name.indexOf('.') === -1) {
    return "short names (non FQDN) are not allowed in Gateway server hosts"
  }
  return validate(name)
}

function validateServiceName(name) {
  return validate(name)
}

function validate(host) {
  if (host.length > 255) {
    return "domain name too long (max 255)"
  }
  const parts = host.split(".")
  if (parts[0].length > 63) {
    return "wildcard DNS (RFC1123) label too long (max 63)"
  }
  if (!wildcardPrefix.test(parts[0])) {
    return "domain name invalid (label invalid)"
  }
  if (parts.length > 1) {
    for (let i = 1; i < parts.length; ++i) {
      const label = parts[i]
      if (label.length > 63) {
        return "wildcard DNS (RFC1123) label too long (max 63)"
      }
      if (!dns1123Label.test(label)) {
        return "domain name invalid (label invalid)"
      }
    }
  }
}

export {validateDomainName, validateServiceName}
