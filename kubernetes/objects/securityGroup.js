/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * 2018-07-24  @author lizhen
 */
'use strict'

import Notification from '../../src/components/Notification'

const notification = new Notification()

const RuleTypeCIDR = 'cidr'
const RuleTypeService = 'service'
const RuleTypeHAProxy = 'haproxy'
const RuleTypeIngress = 'ingress'
const RuleTypeNamespace = 'namespace'
const RuleTypeDAAS = 'daas' // 数据库缓存 mysql redis
const RuleTypeKubeSystem = 'kube-system'
const RuleTypeInnerGroup = 'internal'
const RuleTypeIntermediate = 'intermediate'

const InClusterIngress = 'in-cluster-ingress'
const HAProxyPrefix = 'haproxy/'
const IngressPrefix = 'ingress/'

const IgnoreTypes = {
  [RuleTypeKubeSystem]: {},
  [RuleTypeInnerGroup]: {},
  [RuleTypeIntermediate]: {},
}

const Known = {known: true}

function isManagedPolicy(policy, result) {
  if (policy.spec
    && policy.spec.podSelector
    && policy.spec.podSelector.matchExpressions
    && policy.spec.podSelector.matchExpressions.length > 0) {
    const matchExpressions = policy.spec.podSelector.matchExpressions
    for (let i = 0; i < matchExpressions.length; ++i) {
      const matchExpression = matchExpressions[i]
      if (matchExpression.key === 'system/svcName') {
        result.targetServices = matchExpression.values
        return true
      } else if (matchExpression.key === 'should-not-exist-only-used-as-placeholder') {
        result.targetServices = []
        return true
      }
    }
  }
  return false
}

function nativeNetworkPolicy(policy) {
  return {message: "native network policy", name: policy.metadata.name}
}

function parseNetworkPolicy(policy) {
  const result = {
    name: policy.metadata && policy.metadata.annotations['policy-name'],
    targetServices: [],
  }
  if (!isManagedPolicy(policy, result)) {
    throw nativeNetworkPolicy(policy)
  }
  const annotations = indexAnnotations(policy.metadata && policy.metadata.annotations)
  if (policy.spec && policy.spec.ingress && policy.spec.ingress.length > 0 && policy.spec.ingress[0].from) {
    const from = policy.spec.ingress[0].from
    result.ingress = []
    const context = {}
    for (let i = 0; i < from.length; ++i) {
      const peer = from[i]
      const rule = peerToRule(peer, annotations, context, policy)
      if (ignoreThisRule(rule)) {
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
    const context = {}
    for (let i = 0; i < to.length; ++i) {
      const peer = to[i]
      const rule = peerToRule(peer, annotations, context, policy)
      if (ignoreThisRule(rule)) {
        continue
      }
      result.egress.push(rule)
    }
  }
  return result
}

function ignoreThisRule(rule) {
  return IgnoreTypes.hasOwnProperty(rule.type)
}

// data = {
//   haproxy: [  // api.js#141 router.get('/clusters/:cluster/proxies', clusterController.getProxy)
//   ],  // 结果是 { '集群ID': { data: [...] } }, 这里 haproxy 直接对 data 结构，把 data 对的数组直接给 haproxy 这个 key。
//   ingress: [  // api.js#878 router.get('/clusters/:cluster/loadbalances', loadBalanceController.getLBList)
//   ],  // 结果是 { data: [...] }，就是 data 这个 key 对一个数组，这里把 data 对的数组直接给 ingress 这个 key。
// }
//
function buildNetworkPolicy(name, targetServices, ingress, egress, data) {
  data = indexData(data)
  const policy = {
    metadata: {
      annotations: {
        'policy-name': name,
      },
    },
    spec: {},
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
  policy.spec.policyTypes = ['Egress']
  if (targetServices && targetServices.length > 0) {
    const selectThisGroup = {
      key: 'system/svcName',
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
    policy.spec.policyTypes.push('Ingress')
    policy.spec.egress[0].to.push(ruleAllowSameGroup)
  } else {
    policy.spec.podSelector = {
      matchExpressions: [{
        key: 'should-not-exist-only-used-as-placeholder',
        operator: 'Exists',
        values: [],
      }]
    }
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
      const peer = ruleToPeer(rule, data, policy.metadata && policy.metadata.annotations)
      if (Array.isArray(peer)) {
        peer.forEach(p => from.push(p))
      } else {
        from.push(peer)
      }
    }
  }
  policy.spec.egress[0].to.push({
    namespaceSelector: {
      matchLabels: {
        'system/namespace': 'kube-system',
      },
    },
  })
  if (egress && egress.length) {
    if (!policy.spec.policyTypes) {
      policy.spec.policyTypes = ['Egress']
    } else if (policy.spec.policyTypes.findIndex(t => t === 'Egress') === -1) {
      policy.spec.policyTypes.push('Egress')
    }
    const to = policy.spec.egress[0].to
    for (let i = 0; i < egress.length; ++i) {
      const rule = egress[i]
      const peer = ruleToPeer(rule, data, policy.metadata && policy.metadata.annotations)
      if (Array.isArray(peer)) {
        peer.forEach(p => to.push(p))
      } else {
        to.push(peer)
      }
    }
  }
  return policy
}

function indexAnnotations(annotations) {
  if (!annotations) {
    return
  }
  const index = {}
  const properties = Object.getOwnPropertyNames(annotations)
  for (let i = 0; i < properties.length; ++i) {
    const key = properties[i]
    const value = annotations[key]
    if (key.startsWith(HAProxyPrefix)) {
      const groupId = key.substring(HAProxyPrefix.length)
      const ips = JSON.parse(value)
      ips.forEach(ip => index[ip + '/32'] = {type: RuleTypeHAProxy, id: groupId})
    } else if (key.startsWith(IngressPrefix)) {
      const ingressId = key.substring(IngressPrefix.length)
      value.split(',').forEach(ip => index[`${ip}/32`] = {type: RuleTypeIngress, id: ingressId})
    }
  }
  return index
}

function peerToRule(peer, annotations, context, policy) {
  const rule = {}
  if (peer.ipBlock) {
    const cidr = peer.ipBlock.cidr
    const node = annotations[cidr]
    if (node) {
      const id = node.id
      if (context[id] === Known) {
        rule.type = RuleTypeIntermediate
      } else {
        rule.type = node.type
        if (rule.type === RuleTypeIngress) {
          rule.ingressId = id
        } else if (rule.type === RuleTypeHAProxy) {
          rule.groupId = id
        }
        context[id] = Known
      }
    } else {
      rule.type = RuleTypeCIDR
      rule.cidr = cidr
      if (peer.ipBlock.except) {
        rule.except = peer.ipBlock.except
      }
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
    const serviceName = matchLabels['system/svcName']
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
  } else {
    throw nativeNetworkPolicy(policy)
  }
  return rule
}

function indexData(data) {
  if (!data) {
    return
  }
  if (data.haproxy) {
    data.haproxy = indexHAProxy(data.haproxy)
  }
  if (data.ingress) {
    data.ingress = indexIngress(data.ingress)
  }
  return data
}

function indexHAProxy(data) {
  const indexed = {}
  for (let i = 0; i < data.length; ++i) {
    const group = data[i]
    const ips = []
    for (let j = 0; j < group.nodes.length; ++j) {
      const node = group.nodes[j]
      ips.push(node.address)
    }
    indexed[group.id] = ips
  }
  return indexed
}

function indexIngress(data) {
  const indexed = {}
  for (let i = 0; i < data.length; ++i) {
    const lb = data[i]
    const annotations = lb.metadata && lb.metadata.annotations
    const labels = lb.metadata.labels
    const ips = annotations['hostIPs']
    indexed[lb.metadata.labels['ingressLb']] =
      labels['agentType'] === "inside" && (annotations['hostIPs'] === undefined || annotations['hostIPs'] === "")
        ? InClusterIngress : ips
  }
  return indexed
}

function ruleToPeer(rule, data, annotations) {
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
          'system/svcName': rule.serviceName,
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
          key: 'system/svcName',
          operator: 'In',
          values: rule.serviceName,
        }],
      }
    }
    return peer
  } else if (type === RuleTypeHAProxy) {
    const ips = data.haproxy[rule.groupId]
    if (!ips) {
      const err = notification.warn(`集群网络出口 ${rule.groupId} 不存在`, '请输入存在的集群网络出口')
      err.groupId = rule.groupId
      throw err
    }
    const key = HAProxyPrefix + rule.groupId
    annotations[key] = JSON.stringify(ips)
    return ips.map(ip => ({ipBlock: {cidr: ip + '/32'}}))
  } else if (type === RuleTypeIngress) {
    const ips = data.ingress[rule.ingressId]
    if (!ips) {
      const err = notification.warn(`应用负载均衡 ${rule.ingressId} 不存在`, '请输入存在的应用负载均衡')
      err.ingressId = rule.ingressId
      throw err
    }
    if (ips === InClusterIngress) {
      return {
        podSelector: {
          matchLabels: {
            'ingress-lb': rule.ingressId,
          },
        },
      }
    }
    const key = IngressPrefix + rule.ingressId
    annotations[key] = ips
    return ips.split(',').map(ip => ({ipBlock: {cidr: `${ip}/32`}}))
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

// const lalala = buildNetworkPolicy(
//   'lalala',
//   ['one', 'two', 'three'],
//   [{type: RuleTypeHAProxy, groupId: 'group-ewfhf'}],
//   null,
//   {haproxy: [{"nodes":[{"host":"autoscaler-5y7d3h","address":"192.168.1.221"}],"id":"group-ewfhf","name":"gongwang_3","type":"public","address":"192.168.1.221","domain":""},{"nodes":[{"host":"k8s-node-4","address":"192.168.1.225"}],"id":"group-wmtwh","name":"225","type":"private","address":"192.168.1.225","domain":"","is_default":true}]})
// console.log('lalala', JSON.stringify(lalala, null, 4))
//
// const result = parseNetworkPolicy(lalala)
// console.log('parsed', JSON.stringify(result, null, 4))
