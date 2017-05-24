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
import ResourceSelect from '../../../../ResourceSelect'
import Storage from './Storage'
import Ports from './Ports'
import { getNodes } from '../../../../../actions/cluster_node'
import {
  SYSTEM_DEFAULT_SCHEDULE,
 } from '../../../../../constants'
import './style/index.less'

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
        func: () => {
          //
        },
        isAsync: true
      }
    })
  },
  setReplicasToDefault(disabled) {
    this.props.form.setFieldsValue({
      replicas: 1,
    })
    this.setState({
      replicasInputDisabled: disabled,
    })
  },
  setBindNodeToDefault() {
    this.props.form.setFieldsValue({
      bindNode: SYSTEM_DEFAULT_SCHEDULE,
    })
  },
  onResourceChange({ resourceType, DIYMemory, DIYCPU }) {
    const { setFormFields, form, id } = this.props
    const { setFieldsValue } = form
    const values = { resourceType }
    if (DIYMemory) {
      values.DIYMemory = DIYMemory
    }
    if (DIYCPU) {
      values.DIYCPU = DIYCPU
    }
    setFieldsValue(values)
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
  render() {
    const {
      formItemLayout, form, standardFlag,
      fields, currentCluster, clusterNodes,
      isCanCreateVolume, imageConfigs,
    } = this.props
    const { replicasInputDisabled } = this.state
    const { getFieldProps } = form
    const { mountPath, containerPorts } = imageConfigs
    const { resourceType, DIYMemory, DIYCPU } = fields || {}
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
    return (
      <div id="normalConfigureService">
        <Row className="header" key="header">
          <Col span={3} className="left" key="left">
            <div className="line"></div>
            <span className="title">基本配置</span>
          </Col>
          <Col span={21} key="right">
            <div className="desc">服务的计算资源、服务类型、以及实例个数等设置</div>
          </Col>
        </Row>
        <div className="body" key="body">
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
            key="resource"
          >
            <ResourceSelect
              form={form}
              {...{DIYMemoryProps, DIYCPUProps}}
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
            currentCluster.listNodes > 1 && (
              <FormItem
                {...formItemLayout}
                wrapperCol={{ span: 6 }}
                label="绑定节点"
                key="bindNode"
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
                        <Option key={name} disabled={!schedulable}>
                          {name} | {ip} (容器：{podCount}个)
                        </Option>
                      )
                    })
                  }
                </Select>
              </FormItem>
            )
          }
          <Storage
            formItemLayout={formItemLayout}
            form={form}
            fields={fields}
            setReplicasToDefault={this.setReplicasToDefault}
            mountPath={mountPath}
            key="storage"
          />
          <FormItem
            {...formItemLayout}
            wrapperCol={{ span: 3 }}
            label="实例数量"
            className="replicasFormItem"
            key="replicas"
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
          <Ports
            formItemLayout={formItemLayout}
            form={form}
            fields={fields}
            containerPorts={containerPorts}
            currentCluster={currentCluster}
            key="ports"
          />
        </div>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const { entities, cluster_nodes } = state
  const { current } = entities
  const { cluster } = current
  const { clusterNodes } = cluster_nodes
  return {
    currentCluster: cluster,
    clusterNodes: clusterNodes[cluster.clusterID] || [],
  }
}

export default connect(mapStateToProps, {
  getNodes,
})(Normal)