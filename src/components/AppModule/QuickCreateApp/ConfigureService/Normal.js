/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: normal configure for service
 *
 * v0.1 - 2017-05-04
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Form, InputNumber, Tooltip, Icon, Switch, Select } from 'antd'
import ResourceSelect from '../../../ResourceSelect'
import { getNodes } from '../../../../actions/cluster_node'
import { loadFreeVolume, createStorage } from '../../../../actions/storage'
import {
  SYSTEM_DEFAULT_SCHEDULE,
 } from '../../../../constants'
import './style/Normal.less'

const FormItem = Form.Item

const Normal = React.createClass({
  getInitialState() {
    return {
      replicasInputDisabled: false,
    }
  },
  componentWillMount() {
    const { fields, getNodes, currentCluster } = this.props
    if (!fields || !fields.replicas) {
      this.setReplicasToDefault()
    }
    if (!fields || !fields.bindNode) {
      this.setBindNodeToDefault()
    }
    // get cluster nodes for bind
    getNodes(currentCluster.clusterID, {
      failed: {
        func: {
          //
        },
        isAsync: true
      }
    })
  },
  setReplicasToDefault() {
    this.props.form.setFieldsValue({
      replicas: 1,
    })
  },
  setBindNodeToDefault() {
    this.props.form.setFieldsValue({
      bindNode: SYSTEM_DEFAULT_SCHEDULE,
    })
  },
  onResourceChange({ resourceType, DIYMemory, DIYCPU }) {
    console.log(resourceType, DIYMemory, DIYCPU)
    const { setFieldsValue } = this.props.form
    setFieldsValue({ resourceType, DIYMemory, DIYCPU })
  },
  checkReplicas(rule, value, callback) {
    if (!value) {
      callback()
    }
    if (value < 1 || value > 10) {
      return callback('实例数量为 1~10 之间')
    }
    callback()
  },
  onServiceTypeChange(value) {
    if (value) {
      this.setReplicasToDefault()
      const { loadFreeVolume, currentCluster } = this.props
      loadFreeVolume(currentCluster.clusterID)
    }
    this.setState({
      replicasInputDisabled: !!value
    })
  },
  renderVolumes(serviceType) {
    const { avaliableVolume } = this.props
    const { volumes, isFetching } = avaliableVolume
    const serviceTypeValue = serviceType && serviceType.value
    let descContent
    let volumesContent
    if (!serviceTypeValue) {
      descContent = '无状态服务'
    } else {
      descContent = '有状态服务'
    }
    if (isFetching) {
      volumesContent = (
        <div><Icon type="loading" /> 加载存储卷中</div>
      )
    }
    if (volumes.length < 1) {
      volumesContent = (
        <div>点击创建</div>
      )
    }
    return [
      <span style={{marginLeft: '10px'}}>
        {descContent}
      </span>,
      <div className="volumes">
        {volumesContent}
      </div>
    ]
  },
  render() {
    const {
      formItemLayout, form, standardFlag,
      fields, currentCluster, clusterNodes,
      isCanCreateVolume,
    } = this.props
    const { replicasInputDisabled } = this.state
    const { getFieldProps } = form
    const { resourceType, DIYMemory, DIYCPU, serviceType } = fields || {}
    const replicasProps = getFieldProps('replicas', {
      rules: [
        { required: true, message: '实例数量为 1~10 之间' },
        { validator: this.checkReplicas }
      ],
    })
    const resourceTypeProps = getFieldProps('resourceType', {
      rules: [
        { required: true },
      ],
    })
    const DIYMemoryProps = getFieldProps('DIYMemory')
    const DIYCPUProps = getFieldProps('DIYCPU')
    const bindNodeProps = getFieldProps('bindNode', {
      rules: [
        { required: true },
      ],
    })
    const serviceTypeProps = getFieldProps('serviceType', {
      valuePropName: 'checked',
      onChange: this.onServiceTypeChange
    })
    return (
      <div id="normalConfigureService">
        <Row className="header">
          <Col span={3} className="left">
            <div className="line"></div>
            <span className="title">基本配置</span>
          </Col>
          <Col span={21}>
            <div className="desc">服务的计算资源、服务类型、以及实例个数等设置</div>
          </Col>
        </Row>
        <div className="body">
          <FormItem
            {...formItemLayout}
            label={
              <div>
                容器配置&nbsp;
                {
                  standardFlag && (
                    <Tooltip title="专业版及企业认证用户可申请扩大容器配置">
                      <a>
                        <Icon type="question-circle-o" />
                      </a>
                    </Tooltip>
                  )
                }
              </div>
            }
            hasFeedback
          >
            <ResourceSelect
              standardFlag={standardFlag}
              onChange={this.onResourceChange}
              resourceType={resourceType && resourceType.value}
              DIYMemory={DIYMemory && DIYMemory.value}
              DIYCPU={DIYCPU && DIYCPU.value}
            />
          </FormItem>
          {
            // listNode
            // 1 不可以
            // 2 通过IP
            // 3 通过labels
            // 4 通过IP或labels
          }
          {
            currentCluster.listNode > 1 && (
              <FormItem
                {...formItemLayout}
                wrapperCol={{ span: 6 }}
                label="绑定节点"
              >
                <Select
                  size="large"
                  placeholder="请选择绑定节点"
                  showSearch
                  optionFilterProp="children"
                  {...bindNodeProps}
                >
                  <Option value={SYSTEM_DEFAULT_SCHEDULE}>使用系统默认调度</Option>
                  {
                    clusterNodes.map(node => {
                      const { name, ip, podCount, schedulable } = node
                      return (
                        <Option value={name} disabled={!schedulable}>
                          {name} | {ip} (容器：{podCount}个)
                        </Option>
                      )
                    })
                  }
                </Select>
              </FormItem>
            )
          }
          <FormItem
            {...formItemLayout}
            wrapperCol={{ span: 6 }}
            label={
              <div>
                服务类型&nbsp;
                <a href="http://docs.tenxcloud.com/faq#you-zhuang-tai-fu-wu-yu-wu-zhuang-tai-fu-wu-de-qu-bie" target="_blank">
                  <Tooltip title="若需数据持久化，请使用有状态服务">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </a>
              </div>
            }
          >
            <Switch
              {...serviceTypeProps}
              disabled={!isCanCreateVolume}
            />
            {
              !isCanCreateVolume && (
                <span style={{marginLeft: '10px'}}>
                  <Tooltip title="无存储服务可用, 请配置存储服务">
                    <Icon type="question-circle-o"/>
                  </Tooltip>
                </span>
              )
            }
            {this.renderVolumes(serviceType)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            wrapperCol={{ span: 3 }}
            label="实例数量"
            className="replicasFormItem"
          >
            <InputNumber
              size="large"
              min={1}
              max={10}
              {...replicasProps}
              disabled={replicasInputDisabled}
            />
            <div className="unit">个</div>
          </FormItem>
          <FormItem
            {...formItemLayout}
            wrapperCol={{ span: 6 }}
            label="映射端口"
            hasFeedback
          >
            映射端口
          </FormItem>
        </div>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const { entities, cluster_nodes, storage } = state
  const { current } = entities
  const { cluster } = current
  const { clusterNodes } = cluster_nodes
  const { avaliableVolume } = storage
  const { storageTypes } = cluster
  let isCanCreateVolume = true
  if(!storageTypes || storageTypes.length <= 0) {
    isCanCreateVolume = false
  }
  return {
    currentCluster: cluster,
    isCanCreateVolume,
    clusterNodes: clusterNodes[cluster.clusterID] || [],
    avaliableVolume: {
      volumes: (avaliableVolume.data ? avaliableVolume.data.volumes : []),
      isFetching: avaliableVolume.isFetching,
    }
  }
}

export default connect(mapStateToProps, {
  getNodes,
  loadFreeVolume,
  createStorage,
})(Normal)