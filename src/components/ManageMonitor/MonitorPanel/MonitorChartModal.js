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
import isEmpty from 'lodash/isEmpty'
import './style/MonitorChartModal.less'
import { bytesToSize } from '../../../common/tools'
import { getAllClusterNodes } from '../../../actions/cluster_node'
import { loadAllServices } from '../../../actions/services'
import { getProxy } from '../../../actions/cluster'
import { 
  createChart, updateChart, deleteChart, 
  getChartList, getMetrics, getProxiesService,
  checkChartName, getMonitorMetrics
} from '../../../actions/manage_monitor'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import NotificationHandler from '../../../components/Notification'
import ChartComponent from './ChartComponent'

const FormItem = Form.Item
const Option = Select.Option

const adminTypeArr = [{
  key: 'service',
  text: '服务',
  disabled: true
}, {
  key: 'node',
  text: '节点',
  disabled: true
}, {
  key: 'nexport',
  text: '网络出口'
}]

const defaultTypeArr = [{
  key: 'service',
  text: '服务',
  disabled: false
}]

function formatMetric(result) {
  let data = []
  for (let i in result) {
    if (i === 'statusCode') {
      break
    }
    let obj = {
      name: i,
      ...result[i]
    }
    data.push(obj)
  }
  return data
}

class MonitorChartModal extends React.Component {
  constructor(props) {
    super(props)
    this.cancelModal = this.cancelModal.bind(this)
    this.confirmModal = this.confirmModal.bind(this)
    this.changeTargetType = this.changeTargetType.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.changeExport = this.changeExport.bind(this)
    this.nameCheck = this.nameCheck.bind(this)
    this.getMonitorMetric = this.getMonitorMetric.bind(this)
    this.changeExport = this.changeExport.bind(this)
    this.changeTarget = this.changeTarget.bind(this)
    this.changeMetrics = this.changeMetrics.bind(this)
    this.updateUnit = this.updateUnit.bind(this)
    this.deleteConfirm = this.deleteConfirm.bind(this)
    this.deleteCancel = this.deleteCancel.bind(this)
    this.state = {
      previewMetrics: {
        isFetching: false,
        data: []
      }
    }
  }
  
  componentWillMount() {
    const { clusterID, getAllClusterNodes, loadAllServices, getProxy, currentChart } = this.props
    getProxy(clusterID)
    getAllClusterNodes(clusterID)
    loadAllServices(clusterID, {
      pageIndex: 1,
      pageSize: 100
    })
    if (currentChart) {
      let content = JSON.parse(currentChart.content)
      const contentKey = Object.keys(content)[0]
      this.changeExport(contentKey)
      this.changeTargetType(currentChart.type)
      this.changeTarget(content[contentKey])
      this.changeMetrics(currentChart.metricsNickName)
    }
  }
  
  getMonitorMetric() {
    const { getMonitorMetrics, clusterID, panel_id } = this.props
    const { nexport, target, metricsName } = this.state
    if (!metricsName || !nexport || !target || !target.length) {
      return
    }
    const query = {
      type: metricsName,
      source: 'prometheus',
      start: new Date(Date.parse(new Date()) - (60 * 60 * 1000)).toISOString(), // 一小时前
      end: new Date().toISOString()
    }
    getMonitorMetrics(panel_id, null, clusterID, nexport, target, query, {
      success: {
        func: res => {
          this.setState({
            previewMetrics:{
              isFetching: false,
              data: formatMetric(res)
            }
          })
        }
      }
    })
  }
  
  nameCheck(rule, value, callback) {
    const { checkChartName, clusterID, currentChart } = this.props
    if (currentChart) {
      if (value === currentChart.name) {
        return callback()
      }
    }
    if (!value) {
      return callback('请输入名称')
    } 
    clearTimeout(this.nameTimeout)
    this.nameTimeout = setTimeout(() => {
      checkChartName(clusterID, encodeURIComponent(value), {
        success: {
          func: res => {
            if (res.data.exist) {
              callback('该名称已经存在')
            } else {
              callback()
            }
          }
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  
  targetTypeCheck(rule, value, callback) {
    if (!value) {
      return callback('请选择对象类型')
    } 
    callback()
  }
  
  changeTargetType(type) {
    const { getMetrics, form, clusterID } = this.props
    const { getFieldValue, resetFields } = form
    const preType = getFieldValue('metrics_type')
    if (preType !== type) {
      resetFields(['target'])
    }
    getMetrics(clusterID, { type })
  }
  
  exportCheck(rule, value, callback) {
    if (!value) {
      return callback('请选择网络出口对象')
    } 
    callback()
  }
  
  changeExport(proxyID) {
    const { getProxiesService, clusterID } = this.props
    getProxiesService(clusterID, proxyID)
    this.setState({
      nexport: proxyID
    }, this.getMonitorMetric)
  }
  
  targetCheck(rule, value, callback) {
    if (!value) {
      return callback('请选择监控对象')
    }
    callback()
  }
  
  changeTarget(target) {
    this.setState({
      target
    }, this.getMonitorMetric)
  }
  
  metricsCheck(rule, value, callback) {
    if (!value) {
      return callback('请选择监控指标')
    }
    callback()
  }
  
  changeMetrics(nickName) {
    const { metricList } = this.props
    if (!metricList ||!metricList.length) return
    let name = ''
    for (let i = 0; i < metricList.length; i++) {
      if (nickName === metricList[i].nickName) {
        name = metricList[i].name
        break
      }
    }
    this.setState({
      metricsName: name
    }, this.getMonitorMetric)
  }
  
  aggregationCheck(rule, value, callback) {
    if (!value) {
      return callback('请选择统计方式')
    }
    callback()
  }
  cancelModal() {
    const { closeModal, form } = this.props
    const { resetFields } = form
    closeModal()
    resetFields()
  }
  
  handleDelete() {
    this.setState({
      deleteModal: true
    })
  }
  
  deleteCancel() {
    this.setState({
      deleteModal: false
    })
  }
  deleteConfirm() {
    const { deleteChart, clusterID, currentChart, getChartList, panel_id } = this.props
    let notify = new NotificationHandler()
    notify.spin('删除中')
    this.setState({
      deleteLoading: true
    })
    const query = {
      ids: [currentChart.id],
      names: [currentChart.name]
    }
    deleteChart(clusterID, query, {
      success: {
        func: () => {
          notify.close()
          notify.success('删除成功')
          getChartList(clusterID, { panel_id })
          this.setState({
            deleteModal: false,
            deleteLoading: false
          })
          this.cancelModal()
        },
        isAsync: true
      },
      failed: {
        func: res => {
          notify.close()
          if (res.statusCode < 500) {
            notify.warn('删除失败', res.message)
          } else {
            notify.error('删除失败', res.message)
          }
          this.setState({
            deleteModal: false,
            deleteLoading: false
          })
          this.cancelModal()
        }
      }
    })
  }
  
  confirmModal() {
    const { form, createChart, updateChart, panel_id, clusterID, currentChart, getChartList, metricList } = this.props
    const { validateFields, getFieldValue } = form
    let notify = new NotificationHandler()
    const metrics_type = getFieldValue('metrics_type')
    let validateArr = [ 'name', 'metrics_type', 'target', 'metrics_id']
    if (metrics_type === 'nexport') {
      validateArr.push('nexport')
    }
    validateFields(validateArr, (errors, values) => {
      if (!!errors) {
        return
      }
      const { name, target, metrics_id, nexport } = values
      let id = ''
      for (let i = 0; i < metricList.length; i++) {
        if (metrics_id === metricList[i].nickName) {
          id = metricList[i].iD
          break
        }
      }
      const body = {
        name,
        metrics_id: id,
        panel_id,
        content: JSON.stringify({
          [nexport]: target
        })
      }
      this.setState({
        confirmLoading: true
      })
      if (currentChart) {
        notify.spin('修改中')
        updateChart(clusterID, currentChart.id, body, {
          success: {
            func: () => {
              notify.close()
              notify.success('修改成功')
              this.setState({
                confirmLoading: false
              })
              getChartList(clusterID, { panel_id })
              this.cancelModal()
            },
            isAsync: true
          },
          failed: {
            func: res => {
              notify.close()
              if (res.statusCode < 500) {
                notify.warn('修改失败', res.message)
              } else {
                notify.error('修改失败', res.message)
              }
              this.cancelModal()
              this.setState({
                confirmLoading: false
              })
            }
          }
        })
      } else {
        notify.spin('创建中')
        createChart(clusterID, body, {
          success: {
            func: () => {
              notify.close()
              notify.success('创建成功')
              this.setState({
                confirmLoading: false
              })
              getChartList(clusterID, { panel_id })
              this.cancelModal()
            },
            isAsync: true
          },
          failed: {
            func: res => {
              notify.close()
              if (res.statusCode < 500) {
                notify.warn('创建失败', res.message)
              } else {
                notify.error('创建失败', res.message)
              }
              this.cancelModal()
              this.setState({
                confirmLoading: false
              })
            }
          }
        })
      }
    })
  }
  
  updateUnit(bytes) {
    const { unit } = bytesToSize(bytes)
    this.setState({
      unit
    })
  }
  
  renderFooter() {
    const { confirmLoading } = this.state
    const { currentChart } = this.props
    return [
      <Button key="cancel" onClick={this.cancelModal} size="large">取消</Button>,
      currentChart &&
      <Button
        onClick={this.handleDelete}
        style={{ borderColor: 'red', color: 'red' }} 
        size="large" key="delete">删除</Button>,
      <Button key="confirm" type="primary" size="large" loading={confirmLoading} onClick={this.confirmModal}>确认</Button>
    ]
  }
  
  render() {
    const { 
      currentChart, visible, form, nodeList, allServiceList, 
      proxyList, metricList, proxiesServices, monitorMetrics,
      isAdmin
    } = this.props
    const { previewMetrics, unit, deleteModal, deleteLoading, metricsName } = this.state
    const { getFieldProps, getFieldValue, isFieldValidating, getFieldError } = form
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 17 }
    }
    const formSmallLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 17 }
    }
    let chartDate = !isEmpty(previewMetrics.data) ? previewMetrics : monitorMetrics
    let defaultNexport = ''
    let initialTarget
    if (currentChart && currentChart.content) {
      let content = JSON.parse(currentChart.content)
      let nodeAndService = ['node', 'service']
      const contentKey = Object.keys(content)[0]
      if (!nodeAndService.includes(contentKey)) {
        defaultNexport = contentKey
      }
      initialTarget = content[contentKey]
    }
    const nameProps = getFieldProps('name', {
      rules: [
        {
          validator: this.nameCheck
        }
      ],
      initialValue: currentChart ? currentChart.name : ''
    })
    const targetTypeProps = getFieldProps('metrics_type', {
      rules: [
        {
          validator: this.targetTypeCheck
        }
      ],
      initialValue: currentChart ? currentChart.type : '',
      onChange: this.changeTargetType
    })
    const exportProps = getFieldProps('nexport', {
      rules: [
        {
          validator: this.exportCheck
        }
      ],
      initialValue: defaultNexport,
      onChange: this.changeExport
    })
    const targetProps = getFieldProps('target', {
      rules: [
        {
          validator: this.targetCheck
        }
      ],
      initialValue: initialTarget ? initialTarget : [],
      onChange: this.changeTarget
    })
    const metricsProps = getFieldProps('metrics_id', {
      rules: [
        {
          validator: this.metricsCheck
        }
      ],
      initialValue: currentChart ? currentChart.metricsNickName : '',
      onChange: this.changeMetrics
    })
    const aggregationProps = getFieldProps('aggregation', {
      rules: [
        {
          validator: this.aggregationCheck
        }
      ]
    })
    
    let metrics_type = getFieldValue('metrics_type')
    
    let targetTypeChildren
    let targetChildren
    let exportChildren
    let metricsChildren
    
    let typeArr = isAdmin ? adminTypeArr : defaultTypeArr
    targetTypeChildren = typeArr.map(item => {
      return <Option key={item.key} disabled={item.disabled}>{item.text}</Option>
    })
    
    if (metrics_type === 'service') {
      targetChildren = allServiceList && allServiceList.length ? allServiceList.map(item => {
        return <Option key={item.metadata.name}>{item.metadata.name}</Option>
      }) : []
    } else if (metrics_type === 'node') {
      targetChildren = nodeList && nodeList.length ? nodeList.map(item => {
        return <Option key={item.objectMeta.name}>{item.objectMeta.name}</Option>
      }) : []
    } else {
      targetChildren = proxiesServices && proxiesServices.length ? proxiesServices.map(item => {
        return <Option key={`${item.schemaName}-${item.namespace}`}>{`${item.serviceName}（${item.namespace}）`}</Option>
      }) : []
    }
    exportChildren = proxyList && proxyList.length ? proxyList.map(item => {
      return <Option key={item.id}>{item.name}</Option>
    }) : []
    metricsChildren = !isEmpty(metricList) ? metricList.map(item => {
      return <Option key={item.nickName}>{item.nickName}</Option>
    }) : []
    return (
      <Modal
        title={currentChart ? '编辑监控图表' : '添加监控图表'}
        visible={visible}
        footer={this.renderFooter()}
        onCancel={this.cancelModal}
        onOk={this.confirmModal}
        width={740}
        className="monitorChartModal"
      >
        <Modal
          title="删除监控图表"
          visible={deleteModal}
          onCancel={this.deleteCancel}
          onOk={this.deleteConfirm}
          confirmLoading={deleteLoading}
        >
          <div className="themeColor">
            <i className="anticon anticon-question-circle-o" style={{ marginRight: 10 }}/>
            确定删除此监控图表？
          </div>
        </Modal>
        <Form
          form={form}
        >
          <FormItem
            label="图表名称"
            {...formItemLayout}
            hasFeedback={!!getFieldValue('name')}
            help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
          >
            <Input placeholder="请输入名称" {...nameProps}/>
          </FormItem>
          <Row gutter={16}>
            <Col span={11}>
              <FormItem
                label="监控对象"
                {...formSmallLayout}
              >
                <Select
                  showSearch={true}
                  {...targetTypeProps}
                >
                  {targetTypeChildren}
                </Select>
              </FormItem>
            </Col>
            {
              metrics_type === 'nexport' &&
                [
                  <Col span={9} key="nexportCol">
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
                  <Col className="hintColor" span={4} style={{ lineHeight: '32px' }} key="exportText">
                    多代理节点的汇总
                  </Col>
                ]
            }
          </Row>
          <Row gutter={16}>
            <Col span={17} offset={3}>
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
            <Col className="hintColor" span={4} style={{ lineHeight: '32px' }}>推荐不多于5个</Col>
          </Row>
          <FormItem
            label="监控指标"
            {...formItemLayout}
          >
            <Select
              {...metricsProps}
              showSearch={true}
              placeholder="选择监控指标（单选）"
            >
              {metricsChildren}
            </Select>
          </FormItem>
          {/*<FormItem*/}
            {/*label="汇聚统计"*/}
            {/*{...formItemLayout}*/}
          {/*>*/}
            {/*<Select*/}
              {/*{...aggregationProps}*/}
              {/*showSearch={true}*/}
              {/*placeholder="选择统计方式（单选）"*/}
            {/*>*/}
              {/*<Option key="average">average</Option>*/}
              {/*<Option key="current">current</Option>*/}
              {/*<Option key="max">max</Option>*/}
              {/*<Option key="min">min</Option>*/}
            {/*</Select>*/}
          {/*</FormItem>*/}
          <Row>
            <Col span={3} className="viewText">预览</Col>
            <Col span={17} className="chartBox">
              {
                isEmpty(chartDate.data) ?
                  <div className="noChartData"/>
                  :
                  <ChartComponent
                    unit={unit}
                    metrics={currentChart ? currentChart.metrics : metricsName}
                    updateUnit={this.updateUnit}
                    sourceData={chartDate}
                  />
              }
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

MonitorChartModal = Form.create()(MonitorChartModal)

function mapStateToProps(state, props) {
  const { entities, cluster_nodes, services, cluster, manageMonitor } = state
  const { panel_id, currentChart } = props
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
  
  const { metrics, proxiesServices, monitorMetrics } = manageMonitor || { metrics: {}, proxiesServices: {}, monitorMetrics: {} }
  const { metricType } = metrics || { metricType: '' }
  const { proxyID } = proxiesServices || { proxyID: '' }
  
  let monitorID =  ''
  if (currentChart) {
    monitorID = panel_id + currentChart.id
  }
  return {
    clusterID,
    nodeList,
    allServiceList,
    proxyList,
    metricList: metricType ? metrics[metricType].metrics : [],
    proxiesServices: proxyID ? proxiesServices[proxyID].data : [],
    monitorMetrics: monitorMetrics[monitorID] || { data: [], isFetching: false },
  }
}
export default connect(mapStateToProps, {
  getAllClusterNodes,
  loadAllServices,
  getProxy,
  createChart, 
  updateChart,
  deleteChart,
  getChartList,
  getMetrics,
  getProxiesService,
  checkChartName,
  getMonitorMetrics
})(MonitorChartModal)