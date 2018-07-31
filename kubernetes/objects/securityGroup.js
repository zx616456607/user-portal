/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * 2018-07-24  @author lizhen
 */

'use strict'

const RuleTypeCIDR = 'cidr'
const RuleTypeService = 'service'
const RuleTypeHAProxy = 'haproxy'
const RuleTypeIngress = 'ingress'
const RuleTypeNamespace = 'namespace'

function parseNetworkPolicy(policy) {
  const result = {
    name: policy.metadata && policy.metadata.annotations['policy-name'],
    targetServices: policy.spec && policy.spec.podSelector.matchExpressions[0].values,
  }
  if (policy.spec && policy.spec.ingress && policy.spec.ingress.length > 0 && policy.spec.ingress[0].from) {
    const from = policy.spec.ingress[0].from
    result.ingress = []
    for (let i = 0; i < from.length; ++i) {
      const peer = from[i]
      const rule = peerToRule(peer)
      result.ingress.push(rule)
    }
  }
  if (policy.spec.egress && policy.spec.egress.length > 0 && policy.spec.egress[0].to) {
    const to = policy.spec.egress[0].to
    result.egress = []
    for (let i = 0; i < to.length; ++i) {
      const peer = to[i]
      const rule = peerToRule(peer)
      result.egress.push(rule)
    }
  }
  return result
}

function buildNetworkPolicy(name, targetServices, ingress, egress) {
  const policy = {
    metadata: {
      annotations: {
        'policy-name': name,
      },
    },
    spec: {
      podSelector: {
        matchExpressions: [{
          key: 'tenxcloud.com/svcName',
          operator: 'In',
          values: targetServices,
        }],
      },
    },
  }
  const policyTypes = []
  if (ingress && ingress.length) {
    policyTypes.push('Ingress')
    policy.spec.ingress = [{
      from: [],
    }]
    const from = policy.spec.ingress[0].from
    for (let i = 0; i < ingress.length; ++i) {
      const rule = ingress[i]
      const peer = ruleToPeer(rule)
      from.push(peer)
    }
  }
  if (egress && egress.length) {
    policyTypes.push('Egress')
    policy.spec.egress = [{
      to: [],
    }]
    const to = policy.spec.egress[0].to
    for (let i = 0; i < egress.length; ++i) {
      const rule = egress[i]
      const peer = ruleToPeer(rule)
      to.push(peer)
    }
  }
  policy.spec.policyTypes = policyTypes
  return policy
}

function peerToRule(peer) {
  const rule = {}
  if (peer.ipBlock) {
    rule.type = RuleTypeCIDR
    rule.cidr = peer.ipBlock.cidr
    if (peer.ipBlock.except) {
      rule.except = peer.ipBlock.except
    }
  } else if (peer.podSelector && peer.podSelector.matchLabels) {
    let namespace = null
    if (peer.namespaceSelector && peer.namespaceSelector.matchLabels) {
      namespace = peer.namespaceSelector.matchLabels['system/namespace']
    }
    const matchLabels = peer.podSelector.matchLabels
    const serviceName = matchLabels['tenxcloud.com/svcName']
    if (serviceName) {
      rule.type = RuleTypeService
      rule.serviceName = serviceName
      if (namespace) {
        rule.namespace = namespace
      }
    }
    if (matchLabels.name === 'service-proxy' && namespace === 'kube-system') {
      rule.type = RuleTypeHAProxy
    }
    const lb = matchLabels['tenxcloud.com/lb']
    if (lb) {
      rule.type = RuleTypeIngress
      rule.ingressId = lb
    }
  } else if (peer.namespaceSelector && peer.namespaceSelector.matchLabels) {
    rule.type = RuleTypeNamespace
    rule.namespace = peer.namespaceSelector.matchLabels['system/namespace']
  }
  return rule
}

function ruleToPeer(rule) {
  const type = rule.type
  if (type === RuleTypeCIDR) {
    const peer = {
      ipBlock: {
        cidr: rule.cidr,
      },
    }
    if (rule.except) {
      peer.ipBlock.except = rule.except
    }
    return peer
  } else if (type === RuleTypeService) {
    const peer = {
      podSelector: {
        matchLabels: {
          'tenxcloud.com/svcName': rule.serviceName,
        },
      },
    }
    if (rule.namespace) {
      peer.namespaceSelector = {
        matchLabels: {
          'system/namespace': rule.namespace,
        },
      }
    }
    return peer
  } else if (type === RuleTypeNamespace) {
    return {
      namespaceSelector: {
        matchLabels: {
          'system/namespace': rule.namespace,
        },
      },
    }
  } else if (type === RuleTypeHAProxy) {
    return {
      podSelector: {
        matchLabels: {
          name: 'service-proxy',
        },
      },
      namespaceSelector: {
        matchLabels: {
          'system/namespace': 'kube-system',
        },
      },
    }
  } else if (type === RuleTypeIngress) {
    return {
      podSelector: {
        matchLabels: {
          'tenxcloud.com/lb': rule.ingressId,
        },
      },
    }
  }
}

// TODO:
// const RuleTypeCIDR = 'cidr'
// const RuleTypeService = 'service'
// const RuleTypeHAProxy = 'haproxy'
// const RuleTypeIngress = 'ingress'
// const RuleTypeNamespace = 'namespace'

// const policy = buildNetworkPolicy('时速云', ['svcA1', 'abc123Two', 'lalala456'], [{
//   type: RuleTypeService,
//   serviceName: 'longlonglong',
//   namespace: 'hello',
// }, {
//   type: RuleTypeService,
//   serviceName: 'lilili',
// }, {
//   type: RuleTypeCIDR,
//   cidr: '1.2.3.4/16',
//   except: ['1.2.3.5'],
// }, {
//   type: RuleTypeCIDR,
//   cidr: '1.2.3.4/24',
// }, {
//   type: RuleTypeNamespace,
//   namespace: 'richrichrich',
// }, {
//   type: RuleTypeIngress,
//   ingressId: 'ingress-eyrdfpxlme'
// }, {
//   type: RuleTypeHAProxy,
// }])

// console.log(JSON.stringify(policy, null, 2))

// const result = parseNetworkPolicy(policy)

// console.log(result)

export { buildNetworkPolicy, parseNetworkPolicy }
