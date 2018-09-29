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
const RuleTypeDAAS = 'daas' // 数据库缓存 mysql redis
const RuleTypeKubeSystem = 'kube-system'
const RuleTypeInnerGroup = 'internal'

function parseNetworkPolicy(policy) {
  const result = {
    name: policy.metadata && policy.metadata.annotations['policy-name'],
    targetServices: [],
  }
  if (policy.spec
    && policy.spec.podSelector
    && policy.spec.podSelector.matchExpressions
    && policy.spec.podSelector.matchExpressions.length > 0
    && policy.spec.podSelector.matchExpressions[0].values) {
    result.targetServices = policy.spec.podSelector.matchExpressions[0].values
  }
  if (policy.spec && policy.spec.ingress && policy.spec.ingress.length > 0 && policy.spec.ingress[0].from) {
    const from = policy.spec.ingress[0].from
    result.ingress = []
    for (let i = 0; i < from.length; ++i) {
      const peer = from[i]
      const rule = peerToRule(peer)
      if (rule.type === RuleTypeKubeSystem || rule.type === RuleTypeInnerGroup) {
        continue
      }
      result.ingress.push(rule)
    }
  }
  if (policy.spec
    && policy.spec.egress
    && policy.spec.egress.length > 0
    && policy.spec.egress[0].to) {
    const to = policy.spec.egress[0].to
    result.egress = []
    for (let i = 0; i < to.length; ++i) {
      const peer = to[i]
      const rule = peerToRule(peer)
      if (rule.type === RuleTypeKubeSystem || rule.type === RuleTypeInnerGroup) {
        continue
      }
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
    spec: {},
  }
  if (targetServices && targetServices.length > 0) {
    const selectThisGroup = {
      key: 'tenxcloud.com/svcName',
      operator: 'In',
      values: targetServices,
    }
    policy.spec.podSelector = {
      matchExpressions: [selectThisGroup],
    }
    const ruleAllowSameGroup = {
      podSelector: {
        matchExpressions: [selectThisGroup],
      },
    }
    policy.spec.ingress = [{from: [ruleAllowSameGroup]}]
    policy.spec.egress = [{to: [ruleAllowSameGroup]}]
    policy.spec.policyTypes = ['Ingress', 'Egress']
  }
  if (ingress && ingress.length) {
    if (!policy.spec.ingress) {
      policy.spec.ingress = [{from: []}]
    }
    if (!policy.spec.policyTypes) {
      policy.spec.policyTypes = ['Ingress']
    } else if (policy.spec.policyTypes.findIndex(t => t === 'Ingress') === -1) {
      policy.spec.policyTypes.push('Ingress')
    }
    const from = policy.spec.ingress[0].from
    for (let i = 0; i < ingress.length; ++i) {
      const rule = ingress[i]
      const peer = ruleToPeer(rule)
      from.push(peer)
    }
  }
  policy.spec.egress = [{
    to: [{
      namespaceSelector: {
        matchLabels: {
          'system/namespace': 'kube-system',
        },
      },
    }]
  }]
  if (!policy.spec.policyTypes) {
    policy.spec.policyTypes = ['Egress']
  } else if (policy.spec.policyTypes.findIndex(t => t === 'Egress') === -1) {
    policy.spec.policyTypes.push('Egress')
  }
  if (egress && egress.length) {
    const to = policy.spec.egress[0].to
    for (let i = 0; i < egress.length; ++i) {
      const rule = egress[i]
      const peer = ruleToPeer(rule)
      to.push(peer)
    }
  }
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
  } else if (peer.namespaceSelector && peer.namespaceSelector.matchLabels) {
    if (peer.namespaceSelector.matchLabels['system/namespace'] === 'kube-system') {
      rule.type = RuleTypeKubeSystem
    } else {
      rule.type = RuleTypeNamespace
      rule.namespace = peer.namespaceSelector.matchLabels['system/namespace']
      if (peer.podSelector && peer.podSelector.matchExpressions) {
        rule.serivceName = peer.podSelector.matchExpressions[0].values
      }
    }
  } else if (peer.podSelector && peer.podSelector.matchExpressions) {
    // no namespace selector but had pod match expression
    // this is internal rule
    rule.type = RuleTypeInnerGroup
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
    }
    if (namespace) {
      // rule.type = RuleTypeNamespace
      rule.namespace = namespace
    }
    if (matchLabels.name === 'service-proxy' && namespace === 'kube-system') {
      rule.type = RuleTypeHAProxy
    }
    const lb = matchLabels['ingress-lb']
    if (lb) {
      rule.type = RuleTypeIngress
      rule.ingressId = lb
    }
    const daasType = matchLabels['system/daas-type']
    if (daasType) {
      rule.type = RuleTypeDAAS
      rule.namespace = namespace
      rule.daasName = matchLabels['system/daas-cluster']
      rule.daasType = daasType
    }
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
    return {
      podSelector: {
        matchLabels: {
          'tenxcloud.com/svcName': rule.serviceName,
        },
      },
    }
  } else if (type === RuleTypeNamespace) {
    const peer = {
      namespaceSelector: {
        matchLabels: {
          'system/namespace': rule.namespace,
        },
      },
    }
    if (rule.serviceName) {
      peer.podSelector = {
        matchExpressions: [{
          key: 'tenxcloud.com/svcName',
          operator: 'In',
          values: rule.serviceName,
        }],
      }
    }
    return peer
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
          'ingress-lb': rule.ingressId,
        },
      },
    }
  } else if (type === RuleTypeDAAS) {
    const peer = {
      podSelector: {
        matchLabels: {
          'system/daas-cluster': rule.daasName,
          'system/daas-type': rule.daasType,
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
  }
}

export {buildNetworkPolicy, parseNetworkPolicy}
