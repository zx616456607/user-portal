/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Monitor chart modal
 *
 * 2017-12-19
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Modal, Form, Input, Button, Select, Row, Col } from 'antd'
import { camelize } from 'humps'
import ReactEcharts from 'echarts-for-react'
import EchartsOption from '../../Metrics/EchartsOption'
import './style/MonitorChartModal.less'
import { getAllClusterNodes } from '../../../actions/cluster_node'
import { loadAllServices } from '../../../actions/services'
import { getProxy } from '../../../actions/cluster'

const FormItem = Form.Item
const Option = Select.Option

function formatGrid(count) {
  //this fucntion for format grid css
  //due to the memory counts > 6, this grid would be display wrong
  let initHeight = 300 + ((count - 4)/2)*25;
  return initHeight + 'px';
}

class MonitorChartModal extends React.Component {
  constructor(props) {
    super(props)
    this.cancelModal = this.cancelModal.bind(this)
    this.confirmModal = this.confirmModal.bind(this)
    this.changeTargetType = this.changeTargetType.bind(this)
  }
  
  componentWillMount() {
    const { clusterID, getAllClusterNodes, loadAllServices, getProxy } = this.props
    getProxy(clusterID)
    getAllClusterNodes(clusterID)
    loadAllServices(clusterID, {
      pageIndex: 1,
      pageSize: 100
    })
  }
  
  nameCheck(rule, value, callback) {
    if (!value) {
      return callback('请输入名称')
    } 
    callback()
  }
  
  targetTypeCheck(rule, value, callback) {
    if (!value) {
      return callback('请选择对象类型')
    } 
    callback()
  }
  
  changeTargetType(type) {
    const { getFieldValue, resetFields } = this.props.form
    const preType = getFieldValue('targetType')
    if (preType !== type) {
      resetFields(['target'])
    }
  }
  
  exportCheck(rule, value, callback) {
    if (!value) {
      return callback('请选择网络出口对象')
    } 
    callback()
  }
  
  targetCheck(rule, value, callback) {
    if (!value) {
      return callback('请选择监控对象')
    }
    if (value.length > 5) {
      return callback('监控对象不能多于5个')
    }
    callback()
  }
  
  quotaCheck(rule, value, callback) {
    if (!value) {
      return callback('请选择监控指标')
    }
    callback()
  }
  
  aggregationCheck(rule, value, callback) {
    if (!value) {
      return callback('请选择统计方式')
    }
    callback()
  }
  cancelModal() {
    const { chartFunc, form } = this.props
    const { closeModal } = chartFunc
    const { resetFields } = form
    closeModal()
    resetFields()
  }
  
  confirmModal() {
    const { form } = this.props
    const { validateFields, getFieldValue } = form
    const targetType = getFieldValue('targetType')
    let validateArr = ['name', 'targetType', 'target', 'quota', 'aggregation']
    if (targetType === 'export') {
      validateArr.push('export')
    }
    validateFields(validateArr, (errors, values) => {
      if (!!errors) {
        return
      }
      this.cancelModal()
    })
  }
  
  renderFooter() {
    const { currentChart } = this.props
    return [
      <Button key="cancel" onClick={this.cancelModal} size="large">取消</Button>,
      currentChart &&
      <Button
        style={{ borderColor: 'red', color: 'red' }} size="large" key="delete">删除</Button>,
      <Button key="confirm" type="primary" size="large" onClick={this.confirmModal}>确认</Button>
    ]
  }
  
  render() {
    const { currentChart, visible, form, nodeList, allServiceList, proxyList } = this.props
    const { getFieldProps, getFieldValue } = form
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 16 }
    }
    const formSmallLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 }
    }
    const nameProps = getFieldProps('name', {
      rules: [
        {
          validator: this.nameCheck
        }
      ],
    })
    const targetTypeProps = getFieldProps('targetType', {
      rules: [
        {
          validator: this.targetTypeCheck
        }
      ],
      onChange: this.changeTargetType
    })
    const exportProps = getFieldProps('export', {
      rules: [
        {
          validator: this.exportCheck
        }
      ]
    })
    const targetProps = getFieldProps('target', {
      rules: [
        {
          validator: this.targetCheck
        }
      ]
    })
    const quotaProps = getFieldProps('quota', {
      rules: [
        {
          validator: this.quotaCheck
        }
      ]
    })
    const aggregationProps = getFieldProps('aggregation', {
      rules: [
        {
          validator: this.aggregationCheck
        }
      ]
    })
    
    const option = new EchartsOption(getFieldValue('name'))
    option.addYAxis('value', {
      formatter: '{value} %'
    })
    option.setToolTipUnit(' %')
    let minValue = 'dataMin'
    option.setXAxisMinAndMax(minValue)
    
    let targetType = getFieldValue('targetType')
    let targetChildren = []
    let exportChildren
    
    if (targetType === 'service') {
      targetChildren = allServiceList && allServiceList.length && allServiceList.map(item => {
        return <Option key={item.metadata.name}>{item.metadata.name}</Option>
      })
    } else if (targetType === 'node') {
      targetChildren = nodeList && nodeList.length && nodeList.map(item => {
        return <Option key={item.objectMeta.name}>{item.objectMeta.name}</Option>
      })
    }
    
    exportChildren = proxyList && proxyList.length ? proxyList.map(item => {
      return <Option key={item.name}>{item.name}</Option>
    }) : []
    return (
      <Modal
        title={currentChart ? '编辑监控图表' : '添加监控图表'}
        visible={visible}
        footer={this.renderFooter()}
        onCancel={this.cancelModal}
        onOk={this.confirmModal}
        width={640}
        className="monitorChartModal"
      >
        <Form
          form={form}
        >
          <FormItem
            label="图表名称"
            {...formItemLayout}
          >
            <Input placeholder="请输入名称" {...nameProps}/>
          </FormItem>
          <Row gutter={16}>
            <Col span={10}>
              <FormItem
                label="监控对象"
                {...formSmallLayout}
              >
                <Select
                  showSearch={true}
                  {...targetTypeProps}
                >
                  <Option key="service">服务</Option>
                  <Option key="node">节点</Option>
                  <Option key="export">网络出口</Option>
                </Select>
              </FormItem>
            </Col>
            {
              targetType === 'export' &&
                [
                  <Col span={9} key="export">
                    <FormItem>
                      <Select
                        {...exportProps}
                        showSearch={true}
                        placeholder="搜索选择网络出口对象（单选）"
                      >
                        {exportChildren}
                      </Select>
                    </FormItem>
                  </Col>,
                  <Col className="hintColor" span={5} style={{ lineHeight: '32px' }} key="exportText">
                    多代理节点的汇总
                  </Col>
                ]
            }
          </Row>
          <Row gutter={16}>
            <Col span={16} offset={3}>
              <FormItem>
                <Select
                  {...targetProps}
                  showSearch={true}
                  multiple={true}
                  placeholder="搜索选择对象（可多选）"
                >
                  {targetChildren}
                </Select>
              </FormItem>
            </Col>
            <Col className="hintColor" span={5} style={{ lineHeight: '32px' }}>推荐不多于5个</Col>
          </Row>
          <FormItem
            label="监控指标"
            {...formItemLayout}
          >
            <Select
              {...quotaProps}
              showSearch={true}
              placeholder="选择监控指标（单选）"
            >
              <Option key="cpu">CPU利用率</Option>
              <Option key="memory">内存利用率</Option>
            </Select>
          </FormItem>
          <FormItem
            label="汇聚统计"
            {...formItemLayout}
          >
            <Select
              {...aggregationProps}
              showSearch={true}
              placeholder="选择统计方式（单选）"
            >
              <Option key="average">average</Option>
              <Option key="current">current</Option>
              <Option key="max">max</Option>
              <Option key="min">min</Option>
            </Select>
          </FormItem>
          <Row>
            <Col span={3} className="viewText">预览</Col>
            <Col span={16} className="chartBox">
              <ReactEcharts
                style={{ height: formatGrid(0) }}
                notMerge={true}
                option={option}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

MonitorChartModal = Form.create()(MonitorChartModal)

function mapStateToProps(state) {
  const { entities, cluster_nodes, services, cluster } = state
  const { current } = entities
  const { cluster: currentCluster } = current
  const { clusterID } = currentCluster
  const { getAllClusterNodes } = cluster_nodes
  const { nodes } = getAllClusterNodes[clusterID] || { nodes: {} }
  const { clusters } = nodes
  const { nodes: nodeData } = clusters || { nodes: {} }
  const { nodes: nodeList } = nodeData || { nodes: {} }
  const { serviceList } = services
  const { services: allServiceList } = serviceList
  
  const { proxy } = cluster || { proxy: {} }
  const { result } = proxy || { result: {} }
  const { data: proxyList } = result && result[camelize(clusterID)] || { data: [] }
  return {
    clusterID,
    nodeList,
    allServiceList,
    proxyList
  }
}
export default connect(mapStateToProps, {
  getAllClusterNodes,
  loadAllServices,
  getProxy
})(MonitorChartModal)