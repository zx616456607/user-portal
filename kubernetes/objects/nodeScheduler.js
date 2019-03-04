/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 * NODE Scheduler class for k8s
 *
 * @author lvjunfeng
 * @date 2019-03-04
 */

'use strict'

const utils = require('../utils')
const constants = require('../../constants')
const K8S_NODE_SELECTOR_KEY = constants.K8S_NODE_SELECTOR_KEY
const K8S_NODE_SELECTOR_OS_KEY = constants.K8S_NODE_SELECTOR_OS_KEY
const defaultStants = require('../../src/constants')
const SYSTEM_DEFAULT_SCHEDULE = defaultStants.SYSTEM_DEFAULT_SCHEDULE

class NodeScheduler {
  constructor(nodeSelector) {
    // 增量修改，只传修改部分
    this.spec = {
      template: {
        spec: {
          affinity: null,
          nodeSelector,
        }
      }
    }
  }

  // 主机设置 
  setNodeSelector(value, imageOs) {
    let delKey = K8S_NODE_SELECTOR_KEY
    let newKey = K8S_NODE_SELECTOR_OS_KEY
    if (value !== SYSTEM_DEFAULT_SCHEDULE && value !== imageOs) {
      delKey = K8S_NODE_SELECTOR_OS_KEY
      newKey = K8S_NODE_SELECTOR_KEY
    }
    Object.assign(this.spec.template.spec.nodeSelector, {
      [newKey]: value || SYSTEM_DEFAULT_SCHEDULE,
      [delKey]: null,
    })
  }

  // 设置服务与节点亲和性
  setNodeAffinity(nodeTag) {
    const affinity = this.spec.template.spec.affinity
    if (nodeTag && nodeTag.length) {
      affinity.nodeAffinity = {}
      const policy = affinity.nodeAffinity
      const requiredTag = []
      const preferredTag = []
      nodeTag.forEach(item=> {
        if (item.point === '必须') {
          requiredTag.push(item)
        }else if (item.point === '最好') {
          preferredTag.push(item)
        }
      })
      if (requiredTag && requiredTag.length) {
        policy.requiredDuringSchedulingIgnoredDuringExecution = policy.requiredDuringSchedulingIgnoredDuringExecution || {}
        const tagBox = policy.requiredDuringSchedulingIgnoredDuringExecution
        tagBox.nodeSelectorTerms = tagBox.nodeSelectorTerms || []
        const reqList = tagBox.nodeSelectorTerms
        if (reqList && !reqList.length) {
          reqList.push({
            matchExpressions: []
          })
        }
        reqList[0].matchExpressions = this.setMatchExpressionsTag(requiredTag)
      }
      if (preferredTag && preferredTag.length) {
        policy.preferredDuringSchedulingIgnoredDuringExecution = policy.preferredDuringSchedulingIgnoredDuringExecution || []
        const tagBox = policy.preferredDuringSchedulingIgnoredDuringExecution
        if (tagBox && !tagBox.length) {
          policy.preferredDuringSchedulingIgnoredDuringExecution.push({
            weight: 1,
            preference: {
              matchExpressions: [],
            }
          })
        }
        policy.preferredDuringSchedulingIgnoredDuringExecution[0].preference.matchExpressions
          = this.setMatchExpressionsTag(preferredTag)
        
      }
    }
  }

  // 设置服务与服务亲和性
  setPodAffinity(tagList) {
    if (tagList && tagList.length) {
      const requiredTag = []
      const preferredTag = []
      const antiRequiredTag = []
      const antiPreferredTag = []
      tagList.forEach(item => {
        switch (item.point) {
          case '必须':
            requiredTag.push(item)
            break
          case '最好':
            preferredTag.push(item)
            break
          case '必须不':
            antiRequiredTag.push(item)
            break
          case '最好不':
            antiPreferredTag.push(item)
            break
          default:
            break
        }
      })
      const affinity = this.spec.template.spec.affinity
      if (requiredTag.length || preferredTag.length) {
        affinity.podAffinity = {}
        const pod = affinity.podAffinity
        if (requiredTag && requiredTag.length) {
          pod.requiredDuringSchedulingIgnoredDuringExecution = pod.requiredDuringSchedulingIgnoredDuringExecution || []
          let reqMode = pod.requiredDuringSchedulingIgnoredDuringExecution
          if (reqMode && !reqMode.length) {
            pod.requiredDuringSchedulingIgnoredDuringExecution[0] = {
              labelSelector: {
                matchExpressions: [],
              },
              topologyKey: 'kubernetes.io/hostname',
            }
          }
          pod.requiredDuringSchedulingIgnoredDuringExecution[0].labelSelector.matchExpressions =
            this.setMatchExpressionsTag(requiredTag)
        }
        if (preferredTag && preferredTag.length) {
          pod.preferredDuringSchedulingIgnoredDuringExecution = pod.preferredDuringSchedulingIgnoredDuringExecution || []
          let preMode = pod.preferredDuringSchedulingIgnoredDuringExecution
          if (preMode && !preMode.length) {
            pod.preferredDuringSchedulingIgnoredDuringExecution[0] = {
              weight: 1,
              podAffinityTerm: {
                labelSelector: {
                  matchExpressions: [],
                },
                topologyKey: 'beta.kubernetes.io/os',
              }
            }
          }
          const tagArr = pod.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions
          pod.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions =
            this.setMatchExpressionsTag(preferredTag)
        }
        if (antiRequiredTag.length || antiPreferredTag.length) {
          affinity.podAntiAffinity =  affinity.podAntiAffinity || {}
          const antiPod = affinity.podAntiAffinity
          if (antiRequiredTag && antiRequiredTag.length) {
            antiPod.requiredDuringSchedulingIgnoredDuringExecution = antiPod.requiredDuringSchedulingIgnoredDuringExecution || []
            let antiReqMode = antiPod.requiredDuringSchedulingIgnoredDuringExecution
            if (antiRequiredTag && !antiRequiredTag.length) {
              antiPod.requiredDuringSchedulingIgnoredDuringExecution[0] = {
                labelSelector: {
                  matchExpressions: [],
                },
                topologyKey: 'kubernetes.io/hostname',
              }
            }
            antiPod.requiredDuringSchedulingIgnoredDuringExecution[0].labelSelector.matchExpressions =
              this.setMatchExpressionsTag(antiRequiredTag)
          }
          if (antiPreferredTag && antiPreferredTag.length) {
            antiPod.preferredDuringSchedulingIgnoredDuringExecution = antiPod.preferredDuringSchedulingIgnoredDuringExecution || []
            let antiPreMode = antiPod.preferredDuringSchedulingIgnoredDuringExecution
            if (antiPreMode && !antiPreMode.length) {
              antiPod.preferredDuringSchedulingIgnoredDuringExecution[0] = {
                weight: 1,
                podAffinityTerm: {
                  labelSelector: {
                    matchExpressions: [],
                  },
                  topologyKey: 'beta.kubernetes.io/os',
                }
              }
            }
            antiPod.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions =
              this.setMatchExpressionsTag(antiPreferredTag)
          }
        }
      }
    }
  }

  setMatchExpressionsTag(requiredTag) {
    const list = []
    requiredTag.forEach(ele => {
      if (ele.mark == 'Exists' || ele.mark == 'DoesNotExist') {
        list.push({
          key: ele.key,
          operator: ele.mark,
        })
      } else {
        let equalBegin = -1
        list.forEach((every, ind) => {
          if (every.key === ele.key && every.operator === ele.mark) {
            equalBegin = ind
          }
        })
        if (equalBegin > -1) {
          if (ele.value.indexOf(',') > -1) {
            const valArr = ele.value.split(',')
            list[equalBegin].values = list[equalBegin].values.concat(valArr)
          } else {
            list[equalBegin].values.push(ele.value)
          }
        } else {
          let values = [ ele.value ]
          if (ele.value.indexOf(',') > -1) {
            values = ele.value.split(',')
          }
          list.push({
            key: ele.key,
            operator: ele.mark,
            values,
          })
        }
      }
    })
    list.forEach(item => {
      if (item.values && item.values.length) {
        item.values = [...new Set(item.values)]
      }
    })
    return list
  }

}

module.exports = NodeScheduler
