/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance modal
 *
 * v0.1 - 2018-01-15
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { 
  Modal, Form, Select, Radio, Input, 
  Checkbox, Row, Col, Button, Icon
} from 'antd'
import isEmpty from 'lodash/isEmpty'
import './style/LoadBalanceModal.less'
import { getAllClusterNodes } from '../../../actions/cluster_node'
import Notification from '../../Notification'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group;
const notify = new Notification()

class LoadBalanceModal extends React.Component {
  state = {
    memoryValue: '2',
    CPUValue: '2'
  }
  
  componentDidMount() {
    const { clusterID, getAllClusterNodes } = this.props
    getAllClusterNodes(clusterID)
  }
  
  nodeCheck = (rule, value, callback) => {
    if (!value || !value.length) {
      return callback('请选择节点')
    }
    callback()
  }
  
  nameCheck = (rule, value, callback) => {
    if (!value) {
      return callback('请输入负载均衡器的名称')
    }
    callback()
  }
  cancelModal = () => {
    const { closeModal, form } = this.props
    form.resetFields()
    closeModal()
  }
  
  confirmModal = () => {
    const { composeType } = this.state
    const { closeModal, form } = this.props
    this.setState({
      confirmLoading: true
    })
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      if (!composeType) {
        notify.close() 
        notify.info('请选择配置')
        return
      }
      notify.spin('创建中')
      this.setState({
        confirmLoading: false
      })
      closeModal()
    })
  }
  
  selectComposeType = type => {
    this.setState({
      composeType: type
    })
  }
  
  memorySelect = value => {
    this.setState({
      memoryValue: value
    })
  }
  
  CPUSelect = value => {
    this.setState({
      CPUValue: value
    })
  }
  
  render() {
    const { composeType, memoryValue, CPUValue } = this.state
    const { form, allNodes, visible } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 }
    }
  
    const nodeProps = getFieldProps('node', {
      rules: [
        {
          validator: this.nodeCheck
        }
      ]
    })
  
    const monitorTypeProps = getFieldProps('monitorType', {
      initialValue: 'HTTP'
    })
    
    const nameProps = getFieldProps('name', {
      rules: [
        {
          validator: this.nameCheck
        }
      ]
    })
    
    const gzipProps = getFieldProps('gzip', { 
      initialValue: false, 
      valuePropName: 'checked' 
    })
    
    const nodesChild = isEmpty(allNodes) ? [] : allNodes.clusters.nodes.nodes.map(item => 
      <Option key={item.address}>{item.objectMeta.name}</Option>
    )
    
    return (
      <Modal
        className="loadBalanceModal"
        title="新建负载均衡"
        visible={visible}
        onCancel={this.cancelModal}
        onOk={this.confirmModal}
        okText="确认创建"
      >
        <Form
          form={form}
        >
          <FormItem
            label="选择节点"
            {...formItemLayout}
          >
            <Select
              showSearch={true}
              tags
              {...nodeProps}
            >
              {nodesChild}
            </Select>
          </FormItem>
          <FormItem
            label="监听类型"
            {...formItemLayout}
          >
            <RadioGroup {...monitorTypeProps}>
              <Radio value="HTTP">HTTP</Radio>
              <Radio value="TCP/UDP" disabled>TCP/UDP</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem
            label="名称"
            {...formItemLayout}
          >
            <Input placeholder="请输入负载均衡器的名称" {...nameProps}/>
          </FormItem>
          <Row className="configRow">
            <Col span={5}>
              选择配置
            </Col>
            <Col span={18} className="configBox">
              <Button className="configList" type={composeType === 512 ? "primary" : "ghost"}
                      onClick={() => this.selectComposeType(512)}>
                <div className="topBox">
                  32X
                </div>
                <div className="bottomBox">
                  <span>8 GB 内存</span><br />
                  <span>2 CPU</span>
                  <div className="triangle"/>
                  <Icon type="check" />
                </div>
              </Button>
              <Button className="configList" type={composeType === 'DIY' ? "primary" : "ghost"}
                      onClick={() => this.selectComposeType('DIY')}>
                <div className="topBox">
                  自定义
                </div>
                <div className="bottomBox">
                  <Row>
                    <Col span={12}>
                      <Select value={memoryValue} onChange={this.memorySelect}>
                        <Option key="2">2</Option>
                        <Option key="4">4</Option>
                        <Option key="8">8</Option>
                      </Select>
                    </Col>
                    <Col span={12}>
                      MB 内存
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <Select value={CPUValue} onChange={this.CPUSelect}>
                        <Option key="2">2</Option>
                        <Option key="4">4</Option>
                        <Option key="8">8</Option>
                      </Select>
                    </Col>
                    <Col span={12}>核 CPU</Col>
                  </Row>
                  <div className="triangle"/>
                  <Icon type="check" />
                </div>
              </Button>
            </Col>
          </Row>
          <FormItem
            {...formItemLayout}
            label="gzip 数据压缩"
          >
            <Checkbox {...gzipProps}>开启 gzip</Checkbox>
          </FormItem>
          
          <FormItem
            label="备注"
            {...formItemLayout}
          >
            <Input type="textarea" placeholder="可输入中英文数字等作为备注"/>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

LoadBalanceModal = Form.create()(LoadBalanceModal)

const mapStateToProps = (state, props) => {
  const { entities, cluster_nodes } = state
  const { clusterID } = entities.current.cluster
  const { getAllClusterNodes } = cluster_nodes
  const nodesResponse = getAllClusterNodes[clusterID]
  return {
    clusterID,
    allNodes: isEmpty(nodesResponse) ? [] : nodesResponse.nodes
  }
}

export default connect(mapStateToProps, {
  getAllClusterNodes
})(LoadBalanceModal)