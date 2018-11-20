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
import ReplicasRestrictIP from '../../../../../../client/containers/AppModule/QuickCreateApp/NormalSetting/ReplicasRestrictIP'
import ContainerNetwork from '../../../../../../client/containers/AppModule/QuickCreateApp/ContainerNetwork'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../../../containers/Application/ServiceConfigIntl'
import * as IPPoolActions from '../../../../../../client/actions/ipPool'
import * as podAction from '../../../../../actions/app_manage'

const FormItem = Form.Item
const Panel = Collapse.Panel
const RadioGroup = Radio.Group
let notify = new Notification()

const Normal = React.createClass({
  getInitialState() {
    return {
      replicasInputDisabled: false,
      summary: [],
      createApp: true,
      memoryMin: RESOURCES_MEMORY_MIN,
      cpuMin: RESOURCES_CPU_MIN,
      allTag: [],
      replicasIP: false,
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
      case 0:
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
    const { fields, getNodes, getNodeLabels, form, getIPPoolList, getPodNetworkSegment } = this.props
    form.setFieldsValue({ serverPoint : '最好', serverBottomPoint: '最好'})
    if(fields && fields.bindLabel){
      this.setState({
        summary: fields.bindLabel.value
      })
    }
    const { currentCluster } = this.props
    const { listNodes, clusterID } = currentCluster
    let tagArg = {}
    if (listNodes === 0 || listNodes === 1) {
      return
    } else {
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
    }
    getIPPoolList(clusterID, { version: 'v1' }, {
      failed: {
        func: err => {
          const { statusCode } = err
          if (statusCode !== 403) {
            notification.warn('获取地址池列表失败')
          }
        },
      },
    })
    getPodNetworkSegment(clusterID, {
      success: {
        func: res => {
          form.setFieldsValue({
            ipPool: res.data,
          })
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode } = err
          if (statusCode !== 403) {
            notification.warn('获取集群默认地址池失败')
          }
        },
      },
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
    const { currentCluster, fields, intl } = this.props
    const { form } = this.props
    const { getFieldProps, setFieldsValue, getFieldValue } = form
    getFieldProps('serviceTag')
    const serviceTag = getFieldValue('serviceTag')
    return <div>
      <Title title={intl.formatMessage(IntlMessage.appList)} />
      <div className="title">
        <FormattedMessage {...IntlMessage.serviceAndNodeAffinity}/>
        <Tooltip placement="top" title={intl.formatMessage(IntlMessage.affinityTip)}>
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
    const { form, fields, intl } = this.props
    const { getFieldProps, setFieldsValue, getFieldValue } = form
    getFieldProps('serviceBottomTag')
    getFieldProps('advanceSet')
    const serviceBottomTag = getFieldValue('serviceBottomTag')
    return <div>
      <Title title={intl.formatMessage(IntlMessage.appList)} />
      <div className="title">
        {intl.formatMessage(IntlMessage.serviceAndServiceAffinity)}
        <Tooltip placement="top" title={intl.formatMessage(IntlMessage.serAndSerAffinityTip)}>
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
    const { intl } = this.props
    if (!value) {
      callback()
    }
    if (value < 1 || value > 10) {
      return callback(intl.formatMessage(IntlMessage.replicaLengthLimit))
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
    const { form, clusterNodes, intl } = this.props
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
      if (!item.taints) {
        if (isMaster || !schedulable) {
          disabledNode.push(item)
        } else {
          enabledNode.push(item)
        }
      }
    })
    const mapArray = enabledNode.concat(disabledNode)
    return <div>
      <FormItem className='hostname'>
        <Select
          size="large"
          placeholder={intl.formatMessage(IntlMessage.pleaseSelectBindNode)}
          showSearch
          optionFilterProp="children"
          {...bindNodeProps}
          style={{minWidth:'290px'}}
        >
          <Select.Option value={SYSTEM_DEFAULT_SCHEDULE}>
            <FormattedMessage {...IntlMessage.defaultScheduling}/>
          </Select.Option>
          {
            mapArray.map(node => {
              const { name, ip, podCount, schedulable, isMaster } = node
              return (
                <Select.Option key={name} disabled={isMaster || !schedulable}>
                  {name} | {ip} ({intl.formatMessage(IntlMessage.containerCount, {
                    count: podCount
                })})
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
    const { form, intl } = this.props
    const { getFieldProps } = form
    const bindNodeTypeProps = getFieldProps('bindNodeType',{
      rules: [
        { required: true },
      ],
    })
    switch(listNodes){
      case 5:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostname">{intl.formatMessage(IntlMessage.specifyHostAndIP)}</Radio>
        </Radio.Group>
      case 2:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostlabel">{intl.formatMessage(IntlMessage.serAndSerAffinityNature)}</Radio>
        </Radio.Group>
      case 3:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostlabel">{intl.formatMessage(IntlMessage.serAndNodeAffinityNature)}</Radio>
        </Radio.Group>
      case 4:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostlabel">
            {intl.formatMessage(IntlMessage.serAndNodeAffinityNature)} & {intl.formatMessage(IntlMessage.serAndSerAffinityNature)}
          </Radio>
        </Radio.Group>
      case 6:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostname" key="hostname">{intl.formatMessage(IntlMessage.specifyHostAndIP)}</Radio>
          <Radio value="hostlabel" key="hostlabel">{intl.formatMessage(IntlMessage.insAndInsAffinityNature)}</Radio>
        </Radio.Group>
      case 7:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostname" key="hostname">{intl.formatMessage(IntlMessage.specifyHostAndIP)}</Radio>
          <Radio value="hostlabel" key="hostlabel">{intl.formatMessage(IntlMessage.serAndNodeAffinityNature)}</Radio>
        </Radio.Group>
      case 8:
        return <Radio.Group {...bindNodeTypeProps}>
          <Radio value="hostname" key="hostname">{intl.formatMessage(IntlMessage.specifyHostAndIP)}</Radio>
          <Radio value="hostlabel" key="hostlabel">
            {intl.formatMessage(IntlMessage.serAndNodeAffinityNature)} & {intl.formatMessage(IntlMessage.serAndSerAffinityNature)}</Radio>
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
    const { currentCluster,formItemLayout, intl } = this.props
    const { listNodes } = currentCluster
    switch(listNodes){
      case 0:
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
              <span>{intl.formatMessage(IntlMessage.nodeScheduling)}</span>
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
    const { intl } = this.props
    const { getFieldsValue, setFieldsValue } = this.props.form
    if (!value) {
      notify.warn(intl.formatMessage(IntlMessage.pleaseEnter, {
        item: intl.formatMessage(IntlMessage.minMemory),
        end: '',
      }))
      return
    }
    this.setResourceTypeToDIY()
    const { DIYMaxMemory } = getFieldsValue()
    this.setInputMin('memoryMin', value)
    if (value > DIYMaxMemory) {
      setFieldsValue({
        DIYMaxMemory: value
      })
    }
  },
  maxMemoryChange(value) {
    const { intl } = this.props
    if (!value) {
      notify.warn(intl.formatMessage(IntlMessage.pleaseEnter, {
        item: intl.formatMessage(IntlMessage.maxMemory),
        end: '',
      }))
      return
    }
    this.setResourceTypeToDIY()
  },
  cpuChange(value) {
    const { intl } = this.props
    const { getFieldsValue, setFieldsValue } = this.props.form
    if (!value) {
      notify.warn(intl.formatMessage(IntlMessage.pleaseEnter, {
        item: intl.formatMessage(IntlMessage.minCpu),
        end: '',
      }))
      return
    }
    this.setResourceTypeToDIY()
    const { DIYMaxCPU } = getFieldsValue()
    this.setInputMin('cpuMin', value)
    if (value > DIYMaxCPU) {
      setFieldsValue({
        DIYMaxCPU: value
      })
    }
  },
  maxCpuChange(value) {
    const { intl } = this.props
    if (!value) {
      notify.warn(intl.formatMessage(IntlMessage.pleaseEnter, {
        item: intl.formatMessage(IntlMessage.maxCpu),
        end: '',
      }))
      return
    }
    this.setResourceTypeToDIY()
  },
  maxGpuChange(value) {
    if (!value) {
      notify.warn(intl.formatMessage(IntlMessage.pleaseEnter, {
        item: intl.formatMessage(IntlMessage.maxGpu),
        end: '',
      }))
      return
    }
  },
  algorithmChange(e) {
    const { setFieldsValue } = this.props.form
    if (e.target.value === GPU_ALGORITHM) {
      this.setResourceTypeToDIY()
      setFieldsValue({
        GPULimits: RESOURCES_GPU_MIN
      })
    } else {
      this.onResourceChange({ resourceType: 512 })
    }
  },
  handleReplicas(v) {
    this.props.form.getFieldValue('replicasCheck')
      && Events.emit('changeReplics', v)
  },
  handleReplicasCheck(e) {
    if (e.target.checked) {
      this.props.form.setFieldsValue({
        replicas: 1
      })
    }
    this.setState({
      replicasIP: !this.state.replicasIP,
    })
  },
  ipPoolChange(v) {
    const { setFieldsValue, getFieldValue } = this.props.form
    getFieldValue('replicasCheck') && setFieldsValue({
      replicasIP0: undefined,
    })
  },
  render() {
    const {
      formItemLayout, form, standardFlag,
      fields, currentCluster, clusterNodes,
      isCanCreateVolume, imageConfigs,
      id, isTemplate, location, intl,
      ipPoolList,
    } = this.props
    const { query } = location
    const { listNodes } = currentCluster
    const { replicasInputDisabled, memoryMin, cpuMin, replicasIP } = this.state
    const { getFieldProps, setFieldsValue, getFieldValue } = form
    const { mountPath, containerPorts } = imageConfigs
    const { resourceType, DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU, accessType } = fields || {}
    const replicasProps = getFieldProps('replicas', {
      rules: [
        { required: true, message: intl.formatMessage(IntlMessage.replicaLengthLimit) },
        { validator: this.checkReplicas }
      ],
      // onChange: this.handleReplicas
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
      onChange: this.maxMemoryChange,
    })
    const DIYCPUProps = getFieldProps('DIYCPU', {
      onChange: this.cpuChange,
    })
    const DIYMaxCPUProps = getFieldProps('DIYMaxCPU', {
      onChange: this.maxCpuChange,
    })
    const algorithmProps = getFieldProps('resourceAlgorithm', {
      initialValue: DEFAULT_ALGORITHM,
      onChange: this.algorithmChange
    })
    const GPULimitsProps = getFieldProps('GPULimits', {
      initialValue: RESOURCES_GPU_MIN,
      onChange: this.maxGpuChange
    })
    const schedulerHeader = (
      <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">{intl.formatMessage(IntlMessage.nodeScheduling)}</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">{intl.formatMessage(IntlMessage.nodeSchedulingTitle)}
              </div>
          </Col>
        </Row>
    )
    return (
      <div id="normalConfigureService">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">{intl.formatMessage(IntlMessage.baseConfig)}</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">{intl.formatMessage(IntlMessage.baseConfigTitle)}</div>
          </Col>
        </Row>

        <div className="body" key="body">
          <Row>
            <Col span={formItemLayout.labelCol.span} className="formItemLabel label">
              {intl.formatMessage(IntlMessage.containerConfig)}&nbsp;
              {
                standardFlag && (
                  <Tooltip title={intl.formatMessage(IntlMessage.expansionTip)}>
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
                  GPULimitsProps, algorithmProps, memoryMin, cpuMin, location,
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
            {...{location}}
          />
          {/* <FormItem
            {...formItemLayout}
            wrapperCol={{ span: 3 }}
            label={intl.formatMessage(IntlMessage.instanceNum)}
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

          </FormItem> */}
          <Row key="replicas">
            <Col span={4} className="formItemLabel label"> {intl.formatMessage(IntlMessage.instanceNum)} </Col>
            <Col span={3}>
              <FormItem className="replicasFormItem">
                <InputNumber
                  size="large"
                  min={1}
                  max={10}
                  {...replicasProps}
                  disabled={replicasInputDisabled || replicasIP}
                />
                <div className="unit">{intl.formatMessage(IntlMessage.one)}</div>
              </FormItem>
            </Col>
          </Row>
          <Row key="ippool">
            <Col span={4} className="formItemLabel label">
              实例地址池
            </Col>
            <Col span={6}>
              <FormItem className="replicasFormItem">
                <Select
                  size="large"
                  placeholder={'请选择地址池'}
                  showSearch
                  optionFilterProp="children"
                  {...getFieldProps('ipPool', {
                    onChange: this.ipPoolChange,
                    rules: [{
                      required: true,
                      whitespace: true,
                      message: '请选择地址池'
                    }],
                  })}
                >
                  {ipPoolList.map((k,ind) => <Select.Option key={k.cidr}>{k.cidr}</Select.Option>)}
                </Select>
              </FormItem>
            </Col>
            {
              !isTemplate &&
              <Col span={5} style={{ paddingLeft: 30 }}>
                <FormItem>
                  <Checkbox
                    {
                      ...getFieldProps('replicasCheck', {
                        initialValue: false,
                        valuePropName: 'checked',
                        onChange: this.handleReplicasCheck,
                      })
                    }
                  >
                    {intl.formatMessage(IntlMessage.fixedInstanceIP)}
                  </Checkbox>
                  <Tooltip
                    placement="top"
                    title={'如不固定实例 IP，则地址池中随机分配 '}
                  >
                    <Icon type="question-circle" style={{ marginLeft: 5 }} />
                  </Tooltip>
                </FormItem>
              </Col>
            }
          </Row>
          {
            getFieldValue('replicasCheck')
              ? <ReplicasRestrictIP
                  form={form}
                  // Events={Events}
                />
              : null
          }
          <AccessMethod
            formItemLayout={formItemLayout}
            fields={fields}
            form={form}
            currentCluster={currentCluster}
            key="accessmethod"
            isTemplate={isTemplate}
            flag={this.props.flag}
            {...{location}}
          />
          {
            (!accessType || accessType.value !== 'loadBalance') && !this.props.flag &&
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
          {// 应用模板暂不支持
            !isTemplate &&
            <ContainerNetwork
              formItemLayout={formItemLayout}
              form={form}
              intl={intl}
              key="containerNetwork"
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
          {/* listnodes  为0是老的数据 */}
          {
            listNodes === 0 || listNodes === 1 || isTemplate ?
              null:
              <div id='nodeScheduler'>
                <Collapse>
                  <Panel header={schedulerHeader}>
                    <div className='bindNodes'>
                      { this.handleBindNodeTempalte() }
                    </div>
                  </Panel>
                </Collapse>
              </div>
          }
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
  const {toggleCreateAppMeshFlag: { flag = false } = {}} = state.serviceMesh
  const ipPoolList = state.ipPool && state.ipPool.getIPPoolList && state.ipPool.getIPPoolList.data || []
  return {
    currentCluster: cluster,
    clusterNodes: clusterNodes[cluster.clusterID] || [],
    labels,
    nodes,
    flag,
    ipPoolList,
  }
}

// 固定ip暂时仅支持一个
// const Events = {
//   fn: {},
//   on: function(ev, cb) {
//     this.fn[ev] = cb
//   },
//   emit: function(ev, params) {
//     this.fn[ev](params)
//   }
// }

export default connect(mapStateToProps, {
  getNodes,
  getClusterLabel,
  addLabels,
  getNodeLabels,
  getIPPoolList: IPPoolActions.getIPPoolList,
  getPodNetworkSegment: podAction.getPodNetworkSegment,
})(injectIntl(Normal, {
  withRef: true,
}))


