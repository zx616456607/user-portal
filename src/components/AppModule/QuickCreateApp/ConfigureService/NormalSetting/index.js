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
import { Row, Col, Form, InputNumber, Tooltip, Icon, Switch, Select, Radio, Tag, Button, Input, Checkbox } from 'antd'
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

const FormItem = Form.Item

const Normal = React.createClass({
  getInitialState() {
    return {
      replicasInputDisabled: false,
      summary: [],
      createApp: true,
      memoryMin: RESOURCES_MEMORY_MIN,
      cpuMin: RESOURCES_CPU_MIN,
      serviceTag:[],
      serviceBottomTag: [],
      allTag: [],
      showService: 'single',
      showServiceBetween: 'single',
      showNodeValue: ''
    }
  },
  // componentDidUpdate() {
  //   console.log( 'DidUpdate',this.state.serviceTag, this.state.serviceBottomTag )
  // },
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
          console.log( '22result',resObj )
          for (let key in resObj ) {
            if (tagArg.hasOwnProperty(key)) {
              tagArg[key].push(resObj[key])
              tagArg[key] = Array.from(new Set(tagArg[key]))
            }else if (!tagArg.hasOwnProperty(key)){
              tagArg[key] = []
              tagArg[key].push(resObj[key])
            }
          }
          console.log('111', tagArg  )
          this.dealDataSelectData(tagArg)
        })
      })
    })
  },
  dealDataSelectData(tagArg){
    console.log( '111`````',tagArg )
    let tagArr = []
    for ( let key in tagArg ) {
      tagArr.push({
        [key]: tagArg[key]
      })
    }
    this.setState({
      allTag: tagArr
    },()=>{
      console.log( this.state.allTag )
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

  handleChangeServiceContent(value) {
    console.log( value )
    const { form } = this.props
    const { setFieldsValue } = form
    setFieldsValue({serverMark: value})
    switch (value) {
      case 'In':
      case 'NotIn':
        return this.setState({
          showService: 'more'
        })
      case 'Gt':
      case 'Lt':
        return this.setState({
          showService: 'single'
        })
      case 'Exists':
      case 'DoesNotExists':
        return this.setState({
          showService: 'no'
        })
    }
  },
  showSelectServiceNodeValue() {
    const { allTag, showNodeValue} = this.state
    const { form } = this.props
    const { setFieldsValue } = form
    const options = []
    allTag.map( item=>{
      if (item.hasOwnProperty(showNodeValue)) {
        console.log('item',item[showNodeValue] )
        item[showNodeValue].map( ele=>{
          options.push(<Select.Option value={ele} key={item.index + ele}>{ele}</Select.Option>)
        })
        //setFieldsValue({serverTagKey: value})
      }
    })
    return options
  },
  changeServiceSelectShow() {
    const { showService } = this.state
    const { form } = this.props
    const { getFieldProps } = form
    switch (showService) {
      case 'single':
        return <FormItem id="select" wrapperCol={{ span: 2 }}>
        <Select id="select" size="large"
            style={{ width: 120 }}
            placeholder = '主机标签值'
          {...getFieldProps('serverTagKey',{
            rules: [
              {
                required: true,
                message: "“必填信息"
              }
            ]
          })}
        >
        {
          this.state.allTag.length>0?
          this.showSelectServiceNodeValue()
          :null
        }
        </Select>
      </FormItem>
      case 'more':
        return <FormItem id="select" wrapperCol={{ span: 2 }}>
          <Select
            multiple
            style={{ width: 260 ,height:30 }}
            placeholder = '主机标签值，e.g. abc,123'
            {...getFieldProps('serverTagKey',{
              rules: [
                {
                  required: true,
                  message: "“必填信息"
                }
              ]
            })}
            onChange={this.handleChangeMoreSelect}
          >
            {
              this.state.allTag.length>0?
              this.showSelectServiceNodeValue()
              :null
            }
          </Select>
        </FormItem>
      case 'no':
        return null
      default:
        return null
    }
  },
  handleChangeMoreSelect(value) {
    const { form } = this.props
    const { setFieldsValue } = form
    setFieldsValue({serverTagKey: value})
  },
  handleChangeServiceKeyShowValue(value) {
    const { form } = this.props
    const { setFieldsValue } = form
    setFieldsValue({serverKey: value})
    this.setState({
      showNodeValue: value
    })

  },

  showServicePointAffinity() {
    const { form } = this.props
    const { getFieldProps, setFieldsValue, getFieldValue } = form
    const serviceTag = getFieldValue('serviceTag')
    return <div>
      <Title title="应用列表" />
      <div className="title">
        服务与节点亲和
        <Tooltip placement="top" title='决定服务实例可以部署在哪些主机上'>
          <Icon type="question-circle-o" />
        </Tooltip>
      </div>
      <div>
        <div className="serverAndPoint">
          <div className="serverAnd">
            <FormItem
            id="select"
            label="当前服务"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 2 }}
            >
              <Select id="select" size="large" style={{ width: 80 }}
                {...getFieldProps('serverPoint',{
                  rules: [
                    {
                      required: true,
                      message: "“必填信息"
                    }
                  ],
                  initialValue: '最好',
                })} >
                <Select.Option value="最好" key="maybe">最好</Select.Option>
                <Select.Option value="必须" key="must">必须</Select.Option>
              </Select>
            </FormItem>
              <span className="serverText"> 调度到主机（ </span>
            <FormItem
              id="select"
              wrapperCol={{ span: 2 }}
            >
              <Select id="select" size="large" style={{ width: 200 }}
                placeholder = "主机标签键"
                {...getFieldProps('serverKey',{
                  rules: [
                    {
                      required: true,
                      message: "“必填信息"
                    }
                  ],
                })}
                onChange={this.handleChangeServiceKeyShowValue}
              >
              {
                this.state.allTag.length >0 ?
                this.state.allTag.map( (item,index)=>{
                  const itemKey = Object.keys(item)[0]
                  return <Select.Option value={itemKey} key={item.index + itemKey}>{itemKey}</Select.Option>
                })
                : null
              }
              </Select>
            </FormItem>
            <FormItem
              id="select"
              wrapperCol={{ span: 2 }}
            >
              <Select id="select" size="large" placeholder="操作符" style={{ width: 100 }}
                {...getFieldProps('serverMark',{
                  rules: [
                    {
                      required: true,
                      message: "“必填信息"
                    }
                  ]
                })}
                onChange={this.handleChangeServiceContent}
              >
                <Select.Option value="In" key="in">In</Select.Option>
                <Select.Option value="NotIn" key="not">NotIn</Select.Option>
                <Select.Option value="Gt" key="big"> > </Select.Option>
                <Select.Option value="Lt" key="small">	&lt;</Select.Option>
                <Select.Option value="Exists" key="exists">	Exists </Select.Option>
                <Select.Option value="DoesNotExists" key="does">	DoesNotExists </Select.Option>
              </Select>
            </FormItem>
            {
              //显示 多选in    、 exists  不显示、  单选  >
              this.changeServiceSelectShow()
            }
            <span> ） </span>
            {/* </div> */}
            <Button type="primary" onClick = { this.handleAddLabel } className="handleBtn" >添加</Button>
          </div>
          <div className='pointTag'>
            {
              !isEmpty(serviceTag) &&
              <Form.Item >
                { this.formTagContainer() }
              </Form.Item>
            }
          </div>
        </div>
      </div>
    </div>
  },

  handleChangeServicerBetweenContent(value) {
    console.log( value )
    const { form } = this.props
    const { setFieldsValue } = form
    setFieldsValue({serverBottomMark: value})
    switch (value) {
      case 'In':
      case 'NotIn':
        return this.setState({
          showServiceBetween: 'single'
        })
      case 'Exists':
      case 'DoesNotExists':
        return this.setState({
          showServiceBetween: 'no'
        })
    }
  },

  changeServiceBetweenSelectShow() {
    const { showServiceBetween } = this.state
    const { form } = this.props
    const { getFieldProps } = form
    switch (showServiceBetween) {
      case 'single':
        return <FormItem
          id="control-input"
          wrapperCol={{ span: 14 }}
        >
          <Input id="control-input" placeholder="服务标签值，e.g. abc,123" style={{ width: 155 }}
            {...getFieldProps('serverBottomValue',{
              rules: [
                {
                  required: true,
                  message: "“必填信息"
                }
              ]
            })}
          />
        </FormItem>
      case 'no':
        return null
    }
  },

  showBetweenServiceAffinity() {
    //const { serviceBottomTag } = this.state
    const { form } = this.props
    const { getFieldProps, setFieldsValue, getFieldValue } = form
    const serviceBottomTag = getFieldValue('serviceBottomTag')
    return <div>
      <Title title="应用列表" />
      <div className="title">
        服务与服务亲和
        <Tooltip placement="top" title='决定服务实例可以和那些服务实例部署在同一拓扑域 (具有相同的主机标签键) 上'>
          <Icon type="question-circle-o" />
        </Tooltip>
      </div>
      <div>
        <div className="serverAndServer">
          <div className="serverAnd">
          <FormItem
          id="select"
          label="当前服务"
          className="serverLabel"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 2 }}
          >
            <Select id="select" size="large" style={{ width: 80 }}
              {...getFieldProps('serverBottomPoint',{
                rules: [
                  {
                    required: true,
                    message: "“必填信息"
                  }
                ],
                initialValue: '最好',
              })}
            >
              <Select.Option value="最好" key="maybedo">最好</Select.Option>
              <Select.Option value="最好不" key="donotmust">最好不</Select.Option>
              <Select.Option value="必须" key="maybedo">必须</Select.Option>
              <Select.Option value="必须不" key="mustnot">必须不</Select.Option>
            </Select>
          </FormItem>
            <span className="serverText"> 与服务（  </span>
            <FormItem
                id="control-input"
                wrapperCol={{ span: 14 }}
              >
                <Input id="control-input" placeholder="服务标签键" style={{ width: 80 }}
                  {...getFieldProps('serverBottomKey',{
                    rules: [
                      {
                        required: true,
                        message: "“必填信息"
                      }
                    ]
                  })}
                />
              </FormItem>
          <FormItem
            id="select"
            wrapperCol={{ span: 2 }}
          >
            <Select id="select" size="large" style={{ width: 100 }}
                placeholder = '操作符'
              {...getFieldProps('serverBottomMark',{
                rules: [
                  {
                    required: true,
                    message: "“必填信息"
                  }
                ]
              })}
              onChange={this.handleChangeServicerBetweenContent}
            >
              <Select.Option value="In" key="in">In</Select.Option>
              <Select.Option value="NotIn" key="not">notin</Select.Option>
              <Select.Option value="Exists" key="exists">	exists </Select.Option>
              <Select.Option value="DoesNotExists" key="does">	DoesNotExists </Select.Option>
            </Select>
          </FormItem>
          {
            this.changeServiceBetweenSelectShow()
          }
          <span className="serverText">)</span>
          <span className="serverText"> 在同一拓扑域</span>
          <span className="serverText"> (具有相同的主机标签键) </span>
          <Button type="primary"  onClick = { this.handleAddBottomLabel } className="handleBtn">添加</Button>
          </div>
          <div className="serverTag">
            {
            !isEmpty(serviceBottomTag) &&
            <Form.Item >
              { this.formTagBottomContainer() }
            </Form.Item>
            }
          </div>
          <FormItem>
          <Checkbox {...getFieldProps('agreement', { initialValue: false, valuePropName: 'checked' })}>
            高级设置：【当前服务】中的容器实例最好『分散』再不同的节点上
          </Checkbox>
        </FormItem>
        </div>
      </div>
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
  formTagContainer(){
    const { fields } = this.props
    let serviceTag = []
    if (fields.serviceTag && fields.serviceTag.value) {
      serviceTag = fields.serviceTag.value
    }
    const arr = serviceTag.map((_item, index) => {
      // const item = Object.assign({}, _item)
      const item = cloneDeep(_item)
      if ( item.point === '必须' ) {
        item.color = "#2db7f5"
        item.class = 'tag-font-white'
      }else if (item.point === '最好') {
        item.color = '#f3fbfe'
        item.class = "tag-font-blue"
      }
      return (
        <Tag
          closable
          onClose={() => this.handleClose(item)}
          className={ item.class }
          color={item.color}
          key={item.point + item.key + item.mark + item.value}
        >
          <span>{item.point}</span>
          <span> | </span>
          <span>{item.key} </span>
          {item.mark== 'Gt' ? '>' :null}
          {item.mark== 'Lt' ? '<' :null}
          {item.mark!= 'Gt' && item.mark!= 'Lt'? <span> {item.mark} </span> :null}
          {
            item.value ?
            <span> {item.value} </span>
            : null
          }
        </Tag>
      )
    })
    return arr
  },
  formTagBottomContainer(){
    const { fields } = this.props
    let serviceBottomTag = []
    if (fields.serviceBottomTag && fields.serviceBottomTag.value) {
      serviceBottomTag = fields.serviceBottomTag.value
    }
    const arr = serviceBottomTag.map((_item, index) => {
      const item =cloneDeep(_item)
      if ( item.point === '必须' ) {
        item.color = "#2db7f5"
        item.class = 'tag-font-white'
      }else if (item.point === '最好') {
        item.color = '#f3fbfe'
        item.class = "tag-font-blue"
      }else if (item.point === '必须不') {
        item.color = '#f85a59'
        item.class = "tag-font-white"
      }else if (item.point === '最好不') {
        item.color = '#fef2f2'
        item.class = "tag-font-orign"
      }
      return (
        <Tag
          closable
          onClose={() => this.handleBottomClose(item)}
          className = { item.class }
          color={item.color}
          key={item.point + item.key + item.mark + item.value}
        >
          <span> {item.point} </span>
          <span> | </span>
          <span> {item.key} </span>
          <span> {item.mark} </span>
          {
           item.value ?
           <span> {item.value} </span>
           : null
          }
        </Tag>
      )
    })
    return arr
  },
  handleClose(item) {
    const { form, fields } = this.props
    const { setFieldsValue } = form
    const { serviceTag } = fields
    const tag = cloneDeep(serviceTag.value)
    tag.map( (ele,index)=>{
      if( ele.key == item.key
          && ele.value == item.value
          && ele.point == item.point
          && ele.mark == item.mark){
        tag.splice(index, 1)
        setFieldsValue({
          serviceTag: tag
        })
      }
    })
  },
  handleBottomClose(item){
    const { form, fields } = this.props
    const { setFieldsValue } = form
    const { serviceBottomTag } = fields
    const tag = cloneDeep(serviceBottomTag.value)
    tag.map( (ele,index)=>{
      if( ele.key == item.key
          && ele.value == item.value
          && ele.point == item.point
          && ele.mark == item.mark) {
        tag.splice(index, 1)
        setFieldsValue({
          serviceBottomTag: tag
        })
      }
    })
  //const { form } = this.props
  //form.setFieldsValue({'bindLabel': tag})
  //设置
  },
  handledDropDownSetvalues(arr){
    const { form } = this.props
    form.setFieldsValue({'bindLabel': arr})
  },
  handleLabelTemplate(){
    const { labels, form, nodes, currentCluster } = this.props
    const { listNodes } = currentCluster
    const { getFieldProps } = form
    const { summary, serviceTag, serviceBottomTag } = this.state
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
  handleAddLabel() {
    // const { serviceTag, } = this.state
    const { fields, currentCluster, form, addLabels,  } = this.props
    const { validateFields, setFieldsValue, getFieldProps, resetFields } = form
    const  notificat = new Notification()
    let serviceTag = []
    if (fields.serviceTag && fields.serviceTag.value) {
      serviceTag = fields.serviceTag.value
    }
    let cloneTag = cloneDeep(serviceTag)
    let flag = true
    let fieldsArr = []
    let resetArr = []
    console.log( fields.serverMark , '==========',fields.serverTagKey.value, )
    if (!fields.hasOwnProperty('serverMark')) {
      fieldsArr = ['serverKey','serverPoint','serverTagKey','serverMark']
    }else {
      if (fields.serverMark.value=='Exists' || fields.serverMark.value=='DoesNotExists') {
        fieldsArr = ['serverKey','serverPoint','serverMark']
      }else {
        fieldsArr = ['serverKey','serverPoint','serverTagKey','serverMark']
      }
    }
    validateFields( fieldsArr,(errors) => {
      if (errors) {
        return
      }
    })
    let newlabel = {}
    if ( fields.serverMark.value == 'Exists' ||  fields.serverMark.value== 'DoesNotExists'  ) {
      newlabel = {
        key: fields.serverKey.value,
        mark: fields.serverMark.value,
        point: fields.serverPoint.value,
      }
    }else if (fields.serverMark.value == 'In' ||  fields.serverMark.value== 'NotIn') {
      let str = ''
      fields.serverTagKey.value.map( item=>{
        str += item +','
      })
      str = str.substr(0, str.length-1);
      newlabel = {
        key: fields.serverKey.value,
        value: str,
        mark: fields.serverMark.value,
        point: fields.serverPoint.value,
      }
    }else{
      newlabel = {
        key: fields.serverKey.value,
        value: fields.serverTagKey.value,
        mark: fields.serverMark.value,
        point: fields.serverPoint.value,
      }
    }
    if (!cloneTag.length) {
      cloneTag.push(newlabel)
    }else if (cloneTag.length) {
      cloneTag.map( item => {
        if (isEqual(item, newlabel)) {
          flag = false
          notificat.info('已添加')
        }
      })
      if (flag) {
        cloneTag.push(newlabel)
      }
    }
    setFieldsValue({
      serviceTag: cloneTag
    })
  },
  handleAddBottomLabel() {
    const { fields, form } = this.props
    const { validateFields, setFieldsValue, getFieldsValue, resetFields, getFieldProps } = form
    let serviceBottomTag = []
    if (fields.serviceBottomTag && fields.serviceBottomTag.value) {
      serviceBottomTag = fields.serviceBottomTag.value
    }
    let cloneTag = cloneDeep(serviceBottomTag)
    let flag = true
    let fieldsArr = []
    let resetArr = []
    if (!fields.hasOwnProperty('serverBottomMark')) {
      fieldsArr = ['serverBottomKey','serverBottomValue','serverBottomMark','serverBottomPoint']
    }else {
      if (fields.serverBottomMark.value=='Exists' || fields.serverBottomMark.value=='DoesNotExists') {
        fieldsArr = ['serverBottomKey','serverBottomMark','serverBottomPoint']
      }else {
        fieldsArr = ['serverBottomKey','serverBottomValue','serverBottomMark','serverBottomPoint']
      }
    }
    validateFields( fieldsArr ,(errors)=>{
      if (errors) {
        return
      }
    })
    let newlabel = {}
    if (fields.serverBottomMark.value == 'Exists' ||  fields.serverBottomMark.value== 'DoesNotExists') {
      newlabel = {
        key: fields.serverBottomKey.value,
        mark: fields.serverBottomMark.value,
        point: fields.serverBottomPoint.value,
      }
    }else{
      newlabel = {
        key: fields.serverBottomKey.value,
        value: fields.serverBottomValue.value,
        mark: fields.serverBottomMark.value,
        point: fields.serverBottomPoint.value,
      }
    }
    if (!cloneTag.length) {
      cloneTag.push(newlabel)
    }else if (cloneTag.length) {
      cloneTag.map( item => {
        if (isEqual(item, newlabel)) {
          flag = false
        }
      })
       if (flag) {
        cloneTag.push(newlabel)
      }
    }
    setFieldsValue({
      serviceBottomTag: cloneTag
    })
    // resetFields(resetArr)
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
          {
            // listNode
            // 1 - 8
          }
          <div className='bindNodes'>
            { !isTemplate && this.handleBindNodeTempalte() }
          </div>
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


