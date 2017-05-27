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
import { Row, Col, Form, InputNumber, Tooltip, Icon, Switch, Select, Radio, Tag } from 'antd'
import ResourceSelect from '../../../../ResourceSelect'
import Storage from './Storage'
import Ports from './Ports'
import { getNodes, getClusterLabel } from '../../../../../actions/cluster_node'
import {
  SYSTEM_DEFAULT_SCHEDULE,
 } from '../../../../../constants'
import './style/index.less'
import TagDropDown from '../../../../ClusterModule/TagDropdown'

const FormItem = Form.Item

const Normal = React.createClass({
  getInitialState() {
    return {
      replicasInputDisabled: false,
      summary: [],
    }
  },
  componentWillMount() {
    const { fields, getNodes, currentCluster, getClusterLabel } = this.props
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
      }
    })
    getClusterLabel(currentCluster.clusterID)
  },
  componentDidMount(){
    const { fields } = this.props
    if(fields.bindLabel){
      this.setState({
        summary: fields.bindLabel.value
      })
    }
    const { currentCluster, form } = this.props
    const { listNodes } = currentCluster
    switch(listNodes){
      case 1:
        return
      case 2:
      case 4:
        return form.setFieldsValue({'bindNodeType': 'hostname'})
      case 3:
        return form.setFieldsValue({'bindNodeType': 'hostlabel'})
    }
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
  formTagContainer(){
    const { summary } = this.state
    const arr = summary.map((item, index) => {
      return (
        <Tag closable color="blue" key={item.key + index} afterClose={() => this.handleClose(item)}
          style={{ width: '100%' }}>
          <span>{item.key}</span>
          <span className='point'>:</span>
          <span>{item.value}</span>
        </Tag>
      )
    })
    return arr
  },
  handleClose(item){
    const { summary } = this.state
    for(let i=0;i<summary.length;i++){
      if(summary[i].key == item.key && summary[i].value == item.value){
        summary.splice(i, 1)
      }
    }
    const { form } = this.props
    form.setFieldsValue({'bindLabel': summary})
  },
  handledDropDownSetvalues(arr){
    const { form } = this.props
    form.setFieldsValue({'bindLabel': arr})
  },
  handleLabelTemplate(){
    const { labels, form } = this.props
    const { getFieldProps } = form
    const scope = this
    const bindLabelProps = getFieldProps('bindLabel')
    return <div className='hostlabel'>
      <TagDropDown
        labels={labels}
        footer={false}
        scope={scope}
        appcallback={this.handledDropDownSetvalues}
      />
      <div className='labelcontainer'>
        <Form.Item {...bindLabelProps}>
          {
            this.state.summary.length > 0
              ? <div>{ this.formTagContainer() }</div>
              : null
          }
        </Form.Item>
      </div>
    </div>
  },
  handelhostnameTemplate(){
    const { form, clusterNodes } = this.props
    const { getFieldProps } = form
    const bindNodeProps = getFieldProps('bindNode',{
      rules: [
        { required: true },
      ],
    })
    return <div>
      <FormItem className='hostname'>
        <Select
          size="large"
          placeholder="请选择绑定节点"
          showSearch
          optionFilterProp="children"
          {...bindNodeProps}
        >
          <Select.Option value={SYSTEM_DEFAULT_SCHEDULE}>使用系统默认调度</Select.Option>
          {
            clusterNodes.map(node => {
              const { name,ip,podCount,schedulable } = node
              return (
                <Select.Option key={name} disabled={!schedulable}>
                  {name} | {ip} (容器：{podCount}个)
                </Select.Option>
              )
            })
          }
        </Select>
      </FormItem>
    </div>
  },
  handleBindnodeTypeTemlate(listNodes){
    const { form } = this.props
    const { getFieldProps } = form
    const bindNodeTypeProps = getFieldProps('bindNodeType',{
      rules: [
        { required: true },
      ],
    })
    switch(listNodes){
      case 2:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostname">主机名及IP</Radio>
        </Radio.Group>
      case 3:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostlabel">主机标签</Radio>
        </Radio.Group>
      case 4:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostname" key="hostname">主机名及IP</Radio>
          <Radio value="hostlabel" key="hostlabel">主机标签</Radio>
        </Radio.Group>
      default:
        return <span></span>
    }
  },
  handelBindnodeDetailTemplate(listNodes){
    const { form } = this.props
    const { getFieldValue } = form
    const values = getFieldValue('bindNodeType')
    switch(listNodes){
      case 2:
        return <div>{this.handelhostnameTemplate()}</div>
      case 3:
        return <div>{this.handleLabelTemplate()}</div>
      case 4:
        return <div>{
          values == 'hostname'
          ? <div>{this.handelhostnameTemplate()}</div>
          : <div>{this.handleLabelTemplate()}</div>
        }</div>
    }
  },
  handleBindNodeTempalte(){
    const { currentCluster,formItemLayout } = this.props
    const { listNodes } = currentCluster
    switch(listNodes){
      case 1:
      default:
        return <span></span>
      case 2:
      case 3:
      case 4:
        return <div >
          <Row>
            <Col span={formItemLayout.labelCol.span} className="title">
              <span>绑定节点</span>
            </Col>
            <Col span={formItemLayout.wrapperCol.span}>
              <Form.Item>
                { this.handleBindnodeTypeTemlate(listNodes) }
              </Form.Item>
            </Col>
          </Row>
          <Row className='content'>
            <Col span={formItemLayout.labelCol.span}>
            </Col>
            <Col span={formItemLayout.wrapperCol.span}>
              {this.handelBindnodeDetailTemplate(listNodes)}
            </Col>
          </Row>
        </div>
    }
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
    return (
      <div id="normalConfigureService">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">基本配置</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">服务的计算资源、服务类型、以及实例个数等设置</div>
          </Col>
        </Row>
        <div className="body" key="body">
          <Row>
            <Col span={formItemLayout.labelCol.span} className="formItemLabel label">
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
            </Col>
            <Col span={formItemLayout.wrapperCol.span}>
              <ResourceSelect
                form={form}
                {...{DIYMemoryProps, DIYCPUProps}}
                standardFlag={standardFlag}
                onChange={this.onResourceChange}
                resourceType={resourceType && resourceType.value}
                DIYMemory={DIYMemory && DIYMemory.value}
                DIYCPU={DIYCPU && DIYCPU.value}
              />
            </Col>
          </Row>
          {
            // listNode
            // 1 不可以
            // 2 通过IP
            // 3 通过labels
            // 4 通过IP或labels
          }
          <div className='bindNodes'>
            { this.handleBindNodeTempalte() }
          </div>
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
  const { clusterLabel } = cluster_nodes
  let labels = []
  if(clusterLabel[cluster.clusterID] && clusterLabel[cluster.clusterID].result && clusterLabel[cluster.clusterID].result.summary){
    labels = clusterLabel[cluster.clusterID].result.summary
  }
  return {
    currentCluster: cluster,
    clusterNodes: clusterNodes[cluster.clusterID] || [],
    labels,
  }
}

export default connect(mapStateToProps, {
  getNodes,
  getClusterLabel,
})(Normal)