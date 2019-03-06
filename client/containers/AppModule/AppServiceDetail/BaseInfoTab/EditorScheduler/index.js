/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 * editor Scheduler
 *
 * @author lvjunfeng
 * @date 2019-02-28
 */

import React from 'react'
import { connect } from 'react-redux'
import { Form, Radio, Icon } from 'antd'
import * as serviceActions from '../../../../../../src/actions/services'
import Notification from '../../../../../../src/components/Notification'
import { NodeAffinity, PodAffinity } from '../../../../../../src/components/AppModule/QuickCreateApp/ConfigureService/NormalSetting/NodeAndPodAffinity'
import HostNameContent from './hostNameContent'
import { SYSTEM_DEFAULT_SCHEDULE } from '../../../../../../src/constants'
import cloneDeep from 'lodash/cloneDeep'
import SpecTemplate from '../../../../../../kubernetes/objects/nodeScheduler'
import yaml from 'js-yaml'
import './style/index.less'

const notify = new Notification()

const mapStateToProps = ({
  entities: { current: { cluster: { clusterID, listNodes } } },
}) => {
  return {
    clusterID,
    listNodes,
  }
}

@connect(mapStateToProps, {
  updateServiceStrategy: serviceActions.updateServiceStrategy,
})
class EditScheduler extends React.PureComponent {

  state = {
    hasHost: true, // 指定主机名及IP上运行
    hasNodeAffinity: true, // 服务与节点亲和性
    hasServiceAffinity: true, // 服务与服务的亲和性
    hostValue: SYSTEM_DEFAULT_SCHEDULE, // 主机
    nodeTag: [], // 服务与节点
    podTag: [], // 服务与服务
  }

  componentDidMount = () => {
    const { listNodes } = this.props
    let hasHost = true
    let hasNodeAffinity = true
    let hasServiceAffinity = true
    switch (Number(listNodes)) {
      case 2:
        hasHost = false
        hasNodeAffinity = false
        hasServiceAffinity = true
        break
      case 3:
        hasHost = false
        hasNodeAffinity = true
        hasServiceAffinity = false
        break
      case 4:
        hasHost = false
        hasNodeAffinity = true
        hasServiceAffinity = true
        break
      case 5:
        hasHost = true
        hasNodeAffinity = false
        hasServiceAffinity = false
        break
      case 6:
        hasHost = true
        hasNodeAffinity = false
        hasServiceAffinity = true
        break
      case 7:
        hasHost = true
        hasNodeAffinity = true
        hasServiceAffinity = false
        break
      case 8:
        hasHost = true
        hasNodeAffinity = true
        hasServiceAffinity = true
        break
      case 0:
      case 1:
      default:
        hasHost = false
        hasNodeAffinity = false
        hasServiceAffinity = false
        break
    }
    this.setState({
      hasHost,
      hasNodeAffinity,
      hasServiceAffinity,
    })
    this.setInitialStatus(hasHost, hasNodeAffinity, hasServiceAffinity)
  }

  setInitialStatus = (hasHost, hasNodeAffinity, hasServiceAffinity) => {
    const { form: { setFieldsValue }, schedulerInfo } = this.props
    const { nodeData, podAntiData, podData } = schedulerInfo.data || {}
    const podInfo = Object.assign({}, podData, podAntiData)
    if (hasHost) {
      setFieldsValue({
        schedulerType: 'hostname',
      })
    } else {
      setFieldsValue({
        schedulerType: 'affinity',
      })
    }
    switch (schedulerInfo.type) {
      case 'node':
      case 'pod':
      case 'all':
        if (hasNodeAffinity || hasServiceAffinity) {
          setFieldsValue({
            schedulerType: 'affinity',
          })
          this.setInitialNodeAffinityTag(nodeData)
          this.setInitialPodAffinityTag(podInfo)
        }
        break
      case 'ScheduleBySystem':
      case 'ScheduleByHostNameOrIP':
      default:
        if (hasHost) {
          setFieldsValue({
            schedulerType: 'hostname',
          })
          this.setHostValue(schedulerInfo.node || SYSTEM_DEFAULT_SCHEDULE)
        }
        break
    }
  }

  setInitialNodeAffinityTag = nodeData => {
    let nodeLabel = cloneDeep(this.state.nodeTag)
    Object.keys(nodeData).forEach(key => {
      nodeData[key].forEach(el => {
        if (!el.values) {
          nodeLabel.push({
            point: key === 'preferTag' ? '最好' : '必须',
            key: el.key,
            mark: el.operator,
          })
        } else {
          el.values.forEach(item => {
            nodeLabel.push({
              point: key === 'preferTag' ? '最好' : '必须',
              key: el.key,
              mark: el.operator,
              value: item,
            })
          })
        }
      })
    })
    if (!this.state.hasNodeAffinity) {
      nodeLabel = []
    }
    this.setNodeTag(nodeLabel)
  }

  setInitialPodAffinityTag = podInfo => {
    const serviceName = this.props.serviceDetail.metadata.name
    let podLabel = cloneDeep(this.state.podTag)
    Object.keys(podInfo).forEach(item => {
      podInfo[item].forEach(ele => {
        if (!ele.values) {
          podLabel.push({
            point: this.showPoint(item),
            key: ele.key,
            mark: ele.operator,
          })
        } else {
          ele.values.forEach(every => {
            let advantflag = false
            if (item === 'podReqList' && ele.key === 'name'
              && ele.operator === 'NotIn' && every === serviceName) {
              advantflag = true
              this.props.form.setFieldsValue({
                advanceSet: true,
              })
            }
            !advantflag && podLabel.push({
              point: this.showPoint(item),
              key: ele.key,
              mark: ele.operator,
              value: every,
            })
          })
        }
      })
    })
    if (!this.state.hasServiceAffinity) {
      podLabel = []
    }
    this.setPodTag(podLabel)
  }

  showPoint = key => {
    switch (key) {
      case 'podPreList':
        return '最好'
      case 'podReqList':
        return '必须'
      case 'preAntiData':
        return '最好不'
      case 'reqAntiData':
        return '必须不'
      default:
        return '最好'
    }
  }

  showAffinityText = (hasNodeAffinity, hasServiceAffinity) => {
    if (hasNodeAffinity && hasServiceAffinity) {
      return '定义服务与节点亲和性 & 服务与服务的亲和性'
    } else if (!hasNodeAffinity && hasServiceAffinity) {
      return '定义服务与服务的亲和性'
    } else if (hasNodeAffinity && !hasServiceAffinity) {
      return '定义服务与节点亲和性'
    } else if (!hasNodeAffinity && !hasServiceAffinity) {
      return null
    }
  }

  componentWillReceiveProps(nextProps) {
    const { saveInfo: newStatus } = nextProps
    const { saveInfo: oldStatus } = this.props
    if (newStatus && !oldStatus) {
      this.handleSaveForm()
    }
  }

  handleSaveForm = () => {
    const { form: { validateFields }, clusterID, serviceDetail,
      toggleEditorSchedulerStatus, updateServiceStrategy, loadServiceDetail,
    } = this.props
    validateFields((err, values) => {
      if (err) return
      const nodeSelector = serviceDetail.spec.template.spec.nodeSelector || {}
      const specTemplate = new SpecTemplate(nodeSelector)
      const { schedulerType } = values
      const name = serviceDetail.metadata.name
      const imagetagOs = serviceDetail.spec.template.metadata.annotations.imagetag_os
      if (schedulerType === 'hostname') {
        const { hostValue } = this.state
        specTemplate.setNodeSelector(hostValue, imagetagOs)
        // 清空亲和性
        specTemplate.setNodeAffinity([])
        specTemplate.setPodAffinity([])
      } else if (schedulerType === 'affinity') {
        const { nodeTag, podTag, hasNodeAffinity, hasServiceAffinity } = this.state
        // 重置调度节点内容
        specTemplate.setNodeSelector(imagetagOs, imagetagOs)
        if (hasNodeAffinity && !hasServiceAffinity && !nodeTag.length) {
          return notify.warn('至少添加一个服务与节点标签')
        } else if (!hasNodeAffinity && hasServiceAffinity && !podTag.length && !values.advanceSet) {
          return notify.warn('至少添加一个服务与服务标签')
        } else if (!nodeTag.length && !podTag.length && !values.advanceSet) {
          return notify.warn('至少添加一个标签')
        }
        const newPodList = cloneDeep(podTag)
        if (values.advanceSet) {
          newPodList.push({
            key: 'name',
            mark: 'NotIn',
            point: '必须',
            value: name,
          })
        }
        specTemplate.setNodeAffinity(nodeTag)
        specTemplate.setPodAffinity(newPodList)
      }
      const reqBody = yaml.dump(specTemplate)
      updateServiceStrategy(clusterID, name, reqBody, {
        success: {
          func: () => {
            loadServiceDetail()
            notify.close()
            notify.success('更新节点调度成功')
            toggleEditorSchedulerStatus()
          },
          isAsync: true,
        },
        failed: {
          func: error => {
            const { statusCode } = error
            notify.close()
            if (statusCode !== 403) {
              notify.warn('更新节点调度失败')
            }
          },
        },
      })
    })
  }

  setHostValue = hostValue => {
    this.setState({
      hostValue,
    })
  }

  setNodeTag = nodeTag => {
    this.setState({
      nodeTag,
    })
  }

  setPodTag = podTag => {
    this.setState({
      podTag,
    })
  }

  render() {
    const { hasHost, hasNodeAffinity, hasServiceAffinity,
      hostValue, nodeTag, podTag,
    } = this.state
    const { form } = this.props
    const { getFieldProps, getFieldValue } = form
    const schedulerTypeProps = getFieldProps('schedulerType')
    getFieldProps('advanceSet', {
      initialValue: false,
    })
    const schedulerType = getFieldValue('schedulerType')
    const advanceSet = getFieldValue('advanceSet')
    return <div className="editContent-Scheduler">
      <div className="scheduler-type">
        <Radio.Group {...schedulerTypeProps}>
          {
            (hasHost || !hasHost && !hasNodeAffinity && !hasServiceAffinity)
              && <Radio value="hostname" key="hostname">
                指定主机名及IP上运行
              </Radio>
          }
          {
            (hasNodeAffinity || hasServiceAffinity)
              && <Radio value="affinity" key="affinity">
                {this.showAffinityText(hasNodeAffinity, hasServiceAffinity)}
              </Radio>
              || null
          }
        </Radio.Group>
      </div>
      {
        schedulerType === 'hostname'
          && <div>
            <HostNameContent
              hostValue={hostValue}
              setHostValue={this.setHostValue}
            />
          </div>
      }
      {
        schedulerType === 'affinity' ?
          <span>
            {
              hasNodeAffinity && schedulerType === 'affinity'
                && <div className="affinity-type">
                  <span className="img-title">
                    <Icon type="right" />
                  </span>
                  服务与节点亲和性
                  <NodeAffinity
                    isEdit={true}
                    parentsForm={form}
                    serviceTag={nodeTag}
                    setParentsServiceTag={this.setNodeTag}
                  />
                </div>
            }
            {
              hasServiceAffinity && schedulerType === 'affinity'
                && <div className="affinity-type">
                  <span className="img-title">
                    <Icon type="right" />
                  </span>
                  服务与服务的亲和性
                  <PodAffinity
                    isEdit={true}
                    parentsForm={form}
                    serviceBottomTag={podTag}
                    setParentsServiceBottomTag={this.setPodTag}
                    advanceSet={advanceSet}
                  />
                </div>
            }
          </span>
          : null
      }
    </div>
  }
}

export default Form.create()(EditScheduler)
