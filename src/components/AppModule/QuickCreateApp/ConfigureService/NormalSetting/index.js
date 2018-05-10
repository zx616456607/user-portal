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

import React, { PropTypes, Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Form, InputNumber, Tooltip, Icon, Switch, Select, Radio, Tag,
     Button, Input, Checkbox, Collapse } from 'antd'
import ResourceSelect from '../../../../ResourceSelect'
import Title from '../../../../Title'
import Storage from './Storage'
import Ports from './Ports'
import AccessMethod from './AccessMethod'
import { getNodes, getClusterLabel, addLabels, getNodeLabels } from '../../../../../actions/cluster_node'
import {
  SYSTEM_DEFAULT_SCHEDULE,
  RESOURCES_DIY, RESOURCES_MEMORY_MIN,
  RESOURCES_CPU_MIN, RESOURCES_GPU_MIN,
  DEFAULT_ALGORITHM, GPU_ALGORITHM
 } from '../../../../../constants'
import './style/index.less'
import Notification from '../../../../../components/Notification'
import TagDropDown from '../../../../ClusterModule/TagDropdown'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import isEmpty from 'lodash/isEmpty'
import { SetCalamariUrl } from '../../../../../actions/storage';
import { NodeAffinity, PodAffinity } from './NodeAndPodAffinity'

const FormItem = Form.Item
const Panel = Collapse.Panel
const RadioGroup = Radio.Group

const Normal = React.createClass({
  getInitialState() {
    return {
      replicasInputDisabled: false,
      summary: [],
      createApp: true,
      memoryMin: RESOURCES_MEMORY_MIN,
      cpuMin: RESOURCES_CPU_MIN,
      allTag: [],
    }
  },
  componentWillMount() {
    const { fields, getNodes, currentCluster, getClusterLabel, getNodeLabels, form } = this.props
    const { setFieldsValue } = form
    const { listNodes } = currentCluster
    if (!fields || !fields.replicas) {
      this.setReplicasToDefault()
    }
    if (!fields || !fields.bindNode) {
      this.setBindNodeToDefault()
    }
    switch(listNodes){
      case 1:
        return
      case 2:
      case 3:
      case 4:
        return form.setFieldsValue({'bindNodeType': 'hostlabel'})
      case 5:
      case 6:
      case 7:
      case 8:
        return form.setFieldsValue({'bindNodeType': 'hostname'})
    }
  },
  componentDidMount(){
    const { allTag } = this.state
    const { fields, getNodes, getNodeLabels, form } = this.props
    form.setFieldsValue({ serverPoint : '最好', serverBottomPoint: '最好'})
    if(fields && fields.bindLabel){
      this.setState({
        summary: fields.bindLabel.value
      })
    }
    const { currentCluster } = this.props
    const { listNodes, clusterID } = currentCluster
    let tagArg = {}
    getNodes(clusterID).then( res=> {
      const nodeList = res.response.result.data
      nodeList.map( item=>{
        getNodeLabels(clusterID, item.name).then( res => {
          let resObj = res.response.result.raw
          resObj = JSON.parse( resObj )
          for (let key in resObj ) {
            if (tagArg.hasOwnProperty(key)) {
              tagArg[key].push(resObj[key])
              tagArg[key] = Array.from(new Set(tagArg[key]))
            }else if (!tagArg.hasOwnProperty(key)){
              tagArg[key] = []
              tagArg[key].push(resObj[key])
            }
          }
          this.dealDataSelectData(tagArg)
        })
      })
    })
  },
  dealDataSelectData(tagArg){
    let tagArr = []
    for ( let key in tagArg ) {
      tagArr.push({
        [key]: tagArg[key]
      })
    }
    this.setState({
      allTag: tagArr
    })
  },
  showServiceAffinity(num) {
    switch (num) {
      case 2:
      case 6:
        return this.showBetweenServiceAffinity()
      case 3:
      case 7:
        return this.showServicePointAffinity()
      case 4:
      case 8:
        return <div>
          {this.showServicePointAffinity()}
          {this.showBetweenServiceAffinity()}
        </div>
      default:
        return
    }
  },
  showServicePointAffinity() {
    const { currentCluster, fields } = this.props
    const { form } = this.props
    const { getFieldProps, setFieldsValue, getFieldValue } = form
    getFieldProps('serviceTag')
    const serviceTag = getFieldValue('serviceTag')
    return <div>
      <Title title="应用列表" />
      <div className="title">
        服务与节点亲和
        <Tooltip placement="top" title='决定服务实例可以部署在哪些主机上'>
          <Icon type="question-circle-o" />
        </Tooltip>
      </div>
      <NodeAffinity
        currentCluster={currentCluster}
        fields={fields}
        parentsForm={form}
        serviceTag={serviceTag}
        allTag={this.state.allTag}
        />
    </div>
  },
  showBetweenServiceAffinity() {
    const { form, fields } = this.props
    const { getFieldProps, setFieldsValue, getFieldValue } = form
    getFieldProps('serviceBottomTag')
    const serviceBottomTag = getFieldValue('serviceBottomTag')
    return <div>
      <Title title="应用列表" />
      <div className="title">
        服务与服务亲和
        <Tooltip placement="top" title='决定服务实例可以和那些服务实例部署在同一拓扑域 (具有相同的主机标签键) 上'>
          <Icon type="question-circle-o" />
        </Tooltip>
      </div>
      <PodAffinity
        fields={fields}
        serviceBottomTag={serviceBottomTag}
        parentsForm={form}
        />
    </div>
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
      bindNodeType: 'hostname',
    })
  },
  onResourceChange({ resourceType, DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU, resourceAlgorithm }) {
    const { form, id } = this.props
    const { setFieldsValue } = form
    const values = { resourceType }
    if (DIYMemory) {
      values.DIYMemory = DIYMemory
    }
    if (DIYCPU) {
      values.DIYCPU = DIYCPU
    }
    if (DIYMaxMemory) {
      values.DIYMaxMemory = DIYMaxMemory
    }
    if (DIYMaxCPU) {
      values.DIYMaxCPU = DIYMaxCPU
    }
    if (resourceAlgorithm) {
      values.resourceAlgorithm = resourceAlgorithm
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
  handledDropDownSetvalues(arr){
    const { form } = this.props
    form.setFieldsValue({'bindLabel': arr})
  },
  handleLabelTemplate(){
    const { labels, form, nodes, currentCluster } = this.props
    const { listNodes } = currentCluster
    const { getFieldProps } = form
    const { summary, } = this.state
    //const scope = this
    const bindLabelProps = getFieldProps('bindLabel')
    let nodesArray = this.matchedNodes(summary, nodes)
    let nodesNameList = nodesArray.map((item, index) => {
      return <span key={item.nodeName} style={{paddingRight:'5px'}}>{item.nodeName}</span>
    })
    return <div className='hostlabel'>
    { this.showServiceAffinity(listNodes) }
    {/*    <TagDropDown
        labels={labels}
        footer={false}
        scope={scope}
      />
     <div className='tips'>
        满足条件的节点：
        {
          summary.length
          ? <span>
            <Tooltip title={nodesNameList.length ? nodesNameList : '无'}>
              <span className='num'>{nodesArray.length}</span>
            </Tooltip>
            个
          </span>
          :<span>未选标签，使用系统调度</span>
        }
      </div>
      {
        this.state.summary.length > 0
        ? <div className='labelcontainer'>
          <Form.Item >
            <div>{ this.formTagContainer() }</div>
          </Form.Item>
        </div>
        : <span></span>
      }*/}

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
    const enabledNode = []
    const disabledNode = []
    clusterNodes.forEach((item, index) => {
      const { isMaster, schedulable } = item
      if (isMaster || !schedulable) {
        disabledNode.push(item)
      } else {
        enabledNode.push(item)
      }
    })
    const mapArray = enabledNode.concat(disabledNode)
    return <div>
      <FormItem className='hostname'>
        <Select
          size="large"
          placeholder="请选择绑定节点"
          showSearch
          optionFilterProp="children"
          {...bindNodeProps}
          style={{minWidth:'290px'}}
        >
          <Select.Option value={SYSTEM_DEFAULT_SCHEDULE}>使用系统默认调度</Select.Option>
          {
            mapArray.map(node => {
              const { name, ip, podCount, schedulable, isMaster } = node
              return (
                <Select.Option key={name} disabled={isMaster || !schedulable}>
                  {name} | {ip} (容器：{podCount}个)
                </Select.Option>
              )
            })
          }
        </Select>
      </FormItem>
    </div>
  },
  //listnodes -8-
  handleBindnodeTypeTemlate(listNodes){
    const { form } = this.props
    const { getFieldProps } = form
    const bindNodeTypeProps = getFieldProps('bindNodeType',{
      rules: [
        { required: true },
      ],
    })
    switch(listNodes){
      case 5:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostname">指定主机名及IP上运行</Radio>
        </Radio.Group>
      case 2:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostlabel">服务实例与服务实例的亲和性</Radio>
        </Radio.Group>
      case 3:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostlabel">定义服务实例与节点亲和性</Radio>
        </Radio.Group>
      case 4:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostlabel">定义服务实例与节点亲和性 & 服务实例与服务实例的亲和性</Radio>
        </Radio.Group>
      case 6:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostname" key="hostname">指定主机名及IP上运行</Radio>
          <Radio value="hostlabel" key="hostlabel">服务实例与服务实例的亲和性</Radio>
        </Radio.Group>
      case 7:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostname" key="hostname">指定主机名及IP上运行</Radio>
          <Radio value="hostlabel" key="hostlabel">定义服务实例与节点亲和性</Radio>
        </Radio.Group>
      case 8:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostname" key="hostname">指定主机名及IP上运行</Radio>
          <Radio value="hostlabel" key="hostlabel">定义服务实例与节点亲和性 & 服务实例与服务实例的亲和性</Radio>
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
      case 5:
        return <div>{this.handelhostnameTemplate()}</div>
      case 2:
      case 3:
      case 4:
        return <div>{this.handleLabelTemplate()}</div>
      case 6:
      case 7:
      case 8:
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
      case 5:
      case 6:
      case 7:
      case 8:
        return <div >
          <Row>
            <Col span={formItemLayout.labelCol.span} className="title">
              <span>节点调度</span>
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
  matchedNodes(labels, nodes) {
    const matched = []
    const multiMap = this.labelsToMultiMap(labels)
    const nodeNames = Object.getOwnPropertyNames(nodes)
    for (let i = 0; i < nodeNames.length; i++) {
      const name = nodeNames[i]
      const node = nodes[name]
      if (this.isNodeMatchLabels(node, multiMap)) {
        matched.push({
          nodeName: name,
          labels: node,
        })
      }
    }
    return matched
  },
  isNodeMatchLabels(node, multiMap) {
    const labelKeys = Object.getOwnPropertyNames(multiMap)
    for (let i = 0; i < labelKeys.length; i++) {
      const labelKey = labelKeys[i]
      if (!node.hasOwnProperty(labelKey)) {
        return false
      }
      const nodeValue = node[labelKey]
      const labelValues = multiMap[labelKey]
      if (labelValues.indexOf(nodeValue) === -1) {
        return false
      }
    }
    return true
  },
  labelsToMultiMap(labels) {
    const multiMap = {}
    labels.forEach(label => {
      const key = label.key
      const value = label.value
      if (multiMap.hasOwnProperty(key)) {
        multiMap[key].push(value)
      } else {
        multiMap[key] = [value]
      }
    })
    return multiMap
  },
  setResourceTypeToDIY() {
    this.props.form.setFieldsValue({
      resourceType: RESOURCES_DIY,
    })
  },
  setInputMin(type, min) {
    this.setState({
      [type]: min
    })
  },
  memoryChange(value) {
    const { getFieldsValue, setFieldsValue } = this.props.form
    this.setResourceTypeToDIY()
    const { DIYMaxMemory } = getFieldsValue()
    this.setInputMin('memoryMin', value)
    if (value > DIYMaxMemory) {
      setFieldsValue({
        DIYMaxMemory: value
      })
    }
  },
  cpuChange(value) {
    const { getFieldsValue, setFieldsValue } = this.props.form
    this.setResourceTypeToDIY()
    const { DIYMaxCPU } = getFieldsValue()
    this.setInputMin('cpuMin', value)
    if (value > DIYMaxCPU) {
      setFieldsValue({
        DIYMaxCPU: value
      })
    }
  },
  algorithmChange(e) {
    const { setFieldsValue } = this.props.form
    if (e.target.value === GPU_ALGORITHM) {
      this.setResourceTypeToDIY()
      setFieldsValue({
        GPULimits: RESOURCES_GPU_MIN
      })
    }
  },
  render() {
    const {
      formItemLayout, form, standardFlag,
      fields, currentCluster, clusterNodes,
      isCanCreateVolume, imageConfigs,
      id, isTemplate, location
    } = this.props
    const { replicasInputDisabled, memoryMin, cpuMin } = this.state
    const { getFieldProps, setFieldsValue } = form
    const { mountPath, containerPorts } = imageConfigs
    const { resourceType, DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU, accessType } = fields || {}
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
    const DIYMemoryProps = getFieldProps('DIYMemory', {
      onChange: this.memoryChange,
    })
    const DIYMaxMemoryProps = getFieldProps('DIYMaxMemory', {
      onChange: this.setResourceTypeToDIY,
    })
    const DIYCPUProps = getFieldProps('DIYCPU', {
      onChange: this.cpuChange,
    })
    const DIYMaxCPUProps = getFieldProps('DIYMaxCPU', {
      onChange: this.setResourceTypeToDIY,
    })
    const algorithmProps = getFieldProps('resourceAlgorithm', {
      initialValue: DEFAULT_ALGORITHM,
      onChange: this.algorithmChange
    })
    const GPULimitsProps = getFieldProps('GPULimits', {
      initialValue: RESOURCES_GPU_MIN
    })
    const schedulerHeader = (
      <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">节点调度</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">容器调度策略支持：指定主机名及IP上运行、服务实例与节点亲和性、服务实例与服务实例的亲和性
              </div>
          </Col>
        </Row>
    )
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
                {...{
                  DIYMemoryProps, DIYCPUProps, DIYMaxMemoryProps, DIYMaxCPUProps,
                  GPULimitsProps, algorithmProps, memoryMin, cpuMin
                }}
                standardFlag={standardFlag}
                onChange={this.onResourceChange}
                resourceType={resourceType && resourceType.value}
                DIYMemory={DIYMemory && DIYMemory.value}
                DIYCPU={DIYCPU && DIYCPU.value}
                DIYMaxMemory={DIYMaxMemory && DIYMaxMemory.value}
                DIYMaxCPU={DIYMaxCPU && DIYMaxCPU.value}
              />
            </Col>
          </Row>
          <Storage
            formItemLayout={formItemLayout}
            form={form}
            fields={fields}
            setReplicasToDefault={this.setReplicasToDefault}
            replicasInputDisabled={replicasInputDisabled}
            mountPath={mountPath}
            key="storage"
            id={id}
            isTemplate={isTemplate}
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
          <AccessMethod
            formItemLayout={formItemLayout}
            fields={fields}
            form={form}
            currentCluster={currentCluster}
            key="accessmethod"
            isTemplate={isTemplate}
            {...{location}}
          />
          {
            (!accessType || accessType.value !== 'loadBalance') &&
            <Ports
              formItemLayout={formItemLayout}
              form={form}
              fields={fields}
              containerPorts={containerPorts}
              currentCluster={currentCluster}
              isTemplate={isTemplate}
              key="ports"
            />
          }
          {/* // listNode   left IP   right class pod
                  1           0               0    0
                  2           0               0    1
                  3           0               1    0
                  4           0               1    1
                  5           1               0    0
                  6           1               0    1
                  7           1               1    0
                  8           1               1    1   */}
          <div id='nodeScheduler'>
            <Collapse>
              <Panel header={schedulerHeader}>
                <div className='bindNodes'>
                  { !isTemplate && this.handleBindNodeTempalte() }
                </div>
              </Panel>
            </Collapse>
          </div>
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
  let nodes = {}
  if(clusterLabel[cluster.clusterID] && clusterLabel[cluster.clusterID].result && clusterLabel[cluster.clusterID].result.summary){
    nodes = clusterLabel[cluster.clusterID].result.nodes
    let summary = clusterLabel[cluster.clusterID].result.summary
    labels = summary.filter(label => label.targets && label.targets.length && label.targets.length > 0)
  }
  return {
    currentCluster: cluster,
    clusterNodes: clusterNodes[cluster.clusterID] || [],
    labels,
    nodes,
  }
}

export default connect(mapStateToProps, {
  getNodes,
  getClusterLabel,
  addLabels,
  getNodeLabels
})(Normal)


