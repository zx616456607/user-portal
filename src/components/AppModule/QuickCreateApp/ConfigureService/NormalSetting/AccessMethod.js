/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Access Method component
 *
 * v0.1 - 2017-7-3
 * @author ZhangChengZheng
 */

import React,{ Component } from 'react'
import { Form,Radio,Select,Row,Col } from 'antd'
import { connect } from 'react-redux'
import './style/AccessMethod.less'
import { getProxy } from '../../../../../actions/cluster'
import { camelize } from 'humps'

const Option = Select.Option

class AccessMethod extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount() {
    const { getProxy,currentCluster } = this.props
    const clusterID = currentCluster.clusterID
    getProxy(clusterID)
  }

  accessMethodTips = type => {
    if(type == 'PublicNetwork'){
      return <span>服务可通过公网访问；“确保集群内节点有外网带宽，否则创建服务失败” ；选择一个公网代理出口</span>
    }
    if(type == 'Internaletwork'){
      return <span>服务可通过内网访问；</span>
    }
    return <span>服务仅提供给集群内其他服务访问；</span>
  }

  selectOption = nodeType => {
    let OptionArray = this.formatGroupArray(nodeType)
    let OptionList = OptionArray.map((item,index) => {
      return <Option value={item.id} key={'node' + index}>{item.name}</Option>
    })
    if(!OptionList.length){
      OptionList = <Option value="none" key="noAddress" disabled={true}><span>暂无此类网络出口</span></Option>
    }
    return OptionList
  }

  formatGroupArray = type => {
    const { clusterProxy,currentCluster } = this.props
    let clusterID = camelize(currentCluster.clusterID)
    let nodeArray = []
    let OptionArray = []
    if(Object.keys(clusterProxy).length && clusterProxy[clusterID] && clusterProxy[clusterID].data){
      nodeArray = clusterProxy[clusterID].data
    }
    let accessType = 'public'
    if(type == 'Cluster'){
      return OptionArray
    }
    if(type == 'PublicNetwork'){
      accessType = 'public'
    } else {
      accessType = 'private'
    }
    if(nodeArray.length){
      nodeArray.forEach(item => {
        if(item.type == accessType){
          OptionArray.push(item)
        }
      })
    }
    return OptionArray
  }

  accessMethodContent = type => {
    const { form } = this.props
    const { getFieldProps } = form
    let OptionArray = this.formatGroupArray(type)
    let defaultGroup = ''
    OptionArray.forEach(item => {
      if(item.isDefault){
        defaultGroup = item.id
      }
    })
    let PublicNetworkProps
    let internaletworkProps
    let clusterProps
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 6 }
    }
    if(type == 'PublicNetwork'){
      PublicNetworkProps = getFieldProps('publicNetwork',{
        initialValue: defaultGroup || undefined,
        rules: [{ required: true,message: '请选择一个网络出口' }]
      })
      return <Form.Item
        label={<span></span>}
        {...formItemLayout}
      >
        <Select
          {...PublicNetworkProps}
          placeholder='选择网络出口'
        >
          { this.selectOption('PublicNetwork') }
        </Select>
      </Form.Item>
    }
    if(type == 'Internaletwork'){
      internaletworkProps = getFieldProps('internaletwork',{
        initialValue: defaultGroup || undefined,
        rules: [{ required: true,message: '请选择一个网络出口' }]
      })
      return <Form.Item
        label={<span></span>}
        {...formItemLayout}
      >
        <Select
          {...internaletworkProps}
          placeholder='选择网络出口'
        >
          { this.selectOption('Internaletwork') }
        </Select>
      </Form.Item>
    } else {
      clusterProps = getFieldProps('cluster')
    }
  }

  render() {
    const { formItemLayout,form } = this.props
    const { getFieldProps,getFieldValue } = form
    const accessMethodProps = getFieldProps('accessMethod',{
      initialValue: 'PublicNetwork',
    })
    const accessMethodValue = getFieldValue('accessMethod')
    return (
      <div id='accessMethod'>
        <Form.Item
          {...formItemLayout}
          label="访问方式"
          className='radioBox'
        >
          <Radio.Group {...accessMethodProps}>
            <Radio value="PublicNetwork" key="PublicNetwork">可公网访问</Radio>
            <Radio value="Internaletwork" key="Internaletwork">内网访问</Radio>
            <Radio value="Cluster" key="Cluster">仅在集群内访问</Radio>
          </Radio.Group>
        </Form.Item>
        <Row className='tipsRow'>
          <Col span="4"/>
          <Col span="20">{this.accessMethodTips(accessMethodValue)}</Col>
        </Row>
        { this.accessMethodContent(accessMethodValue) }
      </div>
    )
  }
}

function mapStateToProp(state,props) {
  let clusterProxy = state.cluster.proxy.result || {}

  return {
    clusterProxy,
  }
}

export default connect(mapStateToProp,{
  getProxy,
})(AccessMethod)