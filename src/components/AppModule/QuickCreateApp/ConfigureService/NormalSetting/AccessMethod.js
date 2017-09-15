/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Access Method component
 *
 * v0.1 - 2017-7-3
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Form, Radio, Select, Row, Col, Icon, Tooltip } from 'antd'
import { connect } from 'react-redux'
import './style/AccessMethod.less'
import { getProxy } from '../../../../../actions/cluster'
import { camelize } from 'humps'
import { genRandomString } from '../../../../../common/tools'

const Option = Select.Option

class AccessMethod extends Component {
  constructor(props) {
    super(props)
    this.state = {
      copyCMDSuccess: false,
      lbgroup: '暂无',
      openInputId: `lbgroup${genRandomString('0123456789',4)}`,
    }
  }

  componentWillMount() {
    const { getProxy, currentCluster, form } = this.props
    const clusterID = currentCluster.clusterID
    let clusterId = camelize(currentCluster.clusterID)
    getProxy(clusterID, {
      success: {
        func: (res) => {
          let data = res[clusterId].data
          for (let i = 0; i < data.length; i++) {
            if (data[i].isDefault) {
              this.setState({
                lbgroup: data[i].id || '暂无',
              })
              if(data[i].type == 'public'){
                setTimeout(() => {
                  form.setFieldsValue({
                    accessMethod: 'PublicNetwork',
                    publicNetwork: data[i].id
                  }, 200)
                })
                return
              }
              if(data[i].type == 'private'){
                setTimeout(() => {
                  form.setFieldsValue({
                    accessMethod: 'Internaletwork',
                    internaletwork: data[i].id
                  }, 200)
                })
              }
              break
            }
          }
        }
      },
      failed: {
        func: () => {
          setTimeout(() => {
            form.setFieldsValue({
              'publicNetwork': undefined
            })
          }, 100)
        }
      }
    })
  }

  accessMethodTips = type => {
    if (type == 'PublicNetwork') {
      return <span>服务可通过公网访问，选择一个网络出口；</span>
    }
    if (type == 'Internaletwork') {
      return <span>服务可通过内网访问，选择一个网络出口；</span>
    }
    return <span>服务仅提供给集群内其他服务访问；</span>
  }

  selectOption = nodeType => {
    let OptionArray = this.formatGroupArray(nodeType)
    let OptionList = OptionArray.map((item, index) => {
      return <Option value={item.id} key={'node' + index}>{item.name}</Option>
    })
    if (!OptionList.length) {
      OptionList = <Option value="none" key="noAddress" disabled={true}><span>暂无此类网络出口</span></Option>
    }
    return OptionList
  }

  formatGroupArray = type => {
    const { clusterProxy, currentCluster } = this.props
    let clusterID = camelize(currentCluster.clusterID)
    let nodeArray = []
    let OptionArray = []
    if (Object.keys(clusterProxy).length && clusterProxy[clusterID] && clusterProxy[clusterID].data) {
      nodeArray = clusterProxy[clusterID].data
    }
    let accessType = 'public'
    if (type == 'Cluster') {
      return OptionArray
    }
    if (type == 'PublicNetwork') {
      accessType = 'public'
    } else {
      accessType = 'private'
    }
    if (nodeArray.length) {
      nodeArray.forEach(item => {
        if (item.type == accessType) {
          OptionArray.push(item)
        }
      })
    }
    return OptionArray
  }

  copyOrder = () => {
    const code = document.getElementById(this.state.openInputId)
    code.select()
    document.execCommand('Copy',false)
    this.setState({
      copyCMDSuccess: true,
    })
  }

  renderID = () => {
    const { lbgroup } = this.state
    return <span>
      出口ID
      <Tooltip title="出口ID用于编辑编排文件">
        <Icon type="question-circle-o" className='lbgroup_icon'/>
      </Tooltip>
      ：{lbgroup}
      {
        lbgroup == '暂无'
        ? null
        : <span>
            <Tooltip title={this.state.copyCMDSuccess ? '复制成功': '点击复制'}>
            <a
              className={this.state.copyCMDSuccess ? "actions copyBtn": "copyBtn"}
              onClick={this.copyOrder}
              onMouseLeave={() => setTimeout(() => this.setState({ copyCMDSuccess: false }),500)}
            >
              <Icon type="copy" style={{ marginLeft: 8 }}/>
            </a>
          </Tooltip>
          <input
            id={this.state.openInputId}
            style={{ position: "absolute",opacity: "0",top: '0' }}
            value={lbgroup}
          />
        </span>
      }
    </span>
  }

  lbgroupChange = lbgroup => {
    this.setState({
      lbgroup,
    })
  }

  accessMethodContent = type => {
    const { form } = this.props
    const { getFieldProps } = form
    let OptionArray = this.formatGroupArray(type)
    let defaultGroup = ''
    OptionArray.forEach(item => {
      if (item.isDefault) {
        defaultGroup = item.id
      }
    })
    let PublicNetworkProps
    let internaletworkProps
    let clusterProps
    if (type == 'PublicNetwork') {
      PublicNetworkProps = getFieldProps('publicNetwork', {
        initialValue: defaultGroup || undefined,
        rules: [{ required: true, message: '请选择一个网络出口' }],
        onChange: this.lbgroupChange,
      })
      return <Row>
        <Col span="4">&nbsp;</Col>
        <Col span="6">
          <Form.Item>
            <Select
              {...PublicNetworkProps}
              placeholder='选择网络出口'
            >
              {this.selectOption('PublicNetwork')}
            </Select>
          </Form.Item>
        </Col>
        <Col span="14" className='lbgroup_container'>
          { this.renderID() }
        </Col>
      </Row>
    }
    if (type == 'Internaletwork') {
      internaletworkProps = getFieldProps('internaletwork', {
        initialValue: defaultGroup || undefined,
        rules: [{ required: true, message: '请选择一个网络出口' }],
        onChange: this.lbgroupChange,
      })
      return <Row>
        <Col span="4">&nbsp;</Col>
        <Col span="6">
          <Form.Item>
          <Select
            {...internaletworkProps}
            placeholder='选择网络出口'
          >
            {this.selectOption('Internaletwork')}
          </Select>
          </Form.Item>
        </Col>
        <Col span="10" className='lbgroup_container'>
          { this.renderID() }
        </Col>
      </Row>
    } else {
      clusterProps = getFieldProps('cluster')
    }
  }

  accessTypeChange = e => {
    const { form } = this.props
    let type = e.target.value
    let optionArray = this.formatGroupArray(type)
    let defaultGroup = undefined
    optionArray.forEach(item => {
      if (item.isDefault) {
        defaultGroup = item.id
      }
    })
    if (!defaultGroup && optionArray.length > 0) {
      defaultGroup = optionArray[0].id
    }
    this.setState({
      lbgroup: defaultGroup || '暂无'
    })
    if (type == 'PublicNetwork') {
      form.setFieldsValue({
        'publicNetwork': defaultGroup
      })
      return
    }
    if (type == 'Internaletwork') {
      form.setFieldsValue({
        'internaletwork': defaultGroup
      })
      return
    }
  }

  getDefaultAccessMethod = () => {
    const { clusterProxy, currentCluster } = this.props
    let clusterID = camelize(currentCluster.clusterID)
    let defaultValue = 'Cluster'
    if(Object.keys(clusterProxy).length && clusterProxy[clusterID] && clusterProxy[clusterID].data){
      let arr = clusterProxy[clusterID].data
      for(let i = 0; i < arr.length; i++){
        if(arr[i].isDefault){
          switch(arr[i].type){
            case "private":
              return defaultValue = "Internaletwork"
            case "public":
              return defaultValue = 'PublicNetwork'
            default:
              return defaultValue = 'Cluster'
          }
        }
      }
    }
    return defaultValue
  }

  render() {
    const { formItemLayout, form } = this.props
    const { getFieldProps, getFieldValue } = form
    const accessMethodProps = getFieldProps('accessMethod', {
      initialValue: this.getDefaultAccessMethod(),
      onChange: this.accessTypeChange
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
          <Col span="4" />
          <Col span="20">{this.accessMethodTips(accessMethodValue)}</Col>
        </Row>
        {this.accessMethodContent(accessMethodValue)}
      </div>
    )
  }
}

function mapStateToProp(state, props) {
  let clusterProxy = state.cluster.proxy.result || {}

  return {
    clusterProxy,
  }
}

export default connect(mapStateToProp, {
  getProxy,
})(AccessMethod)