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
import cloneDeep from 'lodash/cloneDeep'
import classNames from 'classnames'
import './style/MonitorChartModal.less'
import { bytesToSize } from '../../../common/tools'
import { getAllClusterNodes } from '../../../actions/cluster_node'
import { loadAllServices } from '../../../actions/services'
import { getProxy } from '../../../actions/cluster'
import {
  createChart, updateChart, deleteChart,
  getChartList, getMetrics, getProxiesService,
  checkChartName, getMonitorMetrics, getServicesMetrics,
  getClustersMetrics
} from '../../../actions/manage_monitor'
import {
  loadHostCpu, loadHostMemory, loadHostRxrate, loadHostTxrate,
  loadHostDiskReadIo, loadHostDiskWriteIo
} from '../../../actions/cluster'
import { ASYNC_VALIDATOR_TIMEOUT, DEFAULT_REGISTRY } from '../../../constants'
import { METRICS_DEFAULT_SOURCE } from '../../../../constants'
import NotificationHandler from '../../../components/Notification'
import ChartComponent from './ChartComponent'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'

const FormItem = Form.Item
const Option = Select.Option

const defaultTypeArr = [{
  key: 'service',
  text: '服务'
}, {
  key: 'nexport',
  text: '网络出口'
}]

function formatMetric(result, currentName) {
  let data = []
  for (let i in result) {
    if (i === 'statusCode') {
      break
    }
    if (!i.includes(currentName)) {
      break
    }
    let copyKey = i.replace(`-${currentName}`, '')
    const lastIndex = copyKey.lastIndexOf('-')
    copyKey = copyKey.slice(0, lastIndex)
    let obj = {
      name: copyKey,
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
    const { clusterID, currentChart } = this.props
    if (currentChart) {
      let content = JSON.parse(currentChart.content)
      const contentKey = Object.keys(content)[0]
      this.changeExport(contentKey)
      this.changeTargetType(currentChart.type)
      this.changeTarget(content[contentKey])
      this.changeMetrics(currentChart.metricsNickName)
      this.setState({
        unit: currentChart.unit || ''
      })
    }
  }

  componentDidMount() {
    let nameInput = document.getElementById('name')
    nameInput && nameInput.focus()
    this.setState({
      currentChart: cloneDeep(this.props.currentChart)
    })
  }
  getMonitorMetric() {
    const { getMonitorMetrics, getServicesMetrics, getClustersMetrics, clusterID, panel_id, form, currentName } = this.props
    const { nexport, target, metricsName } = this.state
    const notify = new NotificationHandler()
    const metricsType = form.getFieldValue('metrics_type')
    const defaultQuery = {
      source: METRICS_DEFAULT_SOURCE,
      start: new Date(Date.parse(new Date()) - (60 * 60 * 1000)).toISOString(), // 一小时前
      end: new Date().toISOString()
    }
    if (metricsType === 'nexport') {
      if (!metricsName || !nexport || isEmpty(target)) {
        return
      }
      const query = Object.assign({}, defaultQuery, {
        type: metricsName
      })
      getMonitorMetrics(panel_id, null, clusterID, nexport, target, query, {
        success: {
          func: res => {
            this.setState({
              previewMetrics:{
                isFetching: false,
                data: formatMetric(res, currentName)
              }
            })
          }
        },
        failed: {
          func: err => {
            if (err.statusCode === 404 && getDeepValue(err, ['message', 'message']) === 'plugin prometheus not found') {
              notify.warn('该集群未安装 prometheus', '请联系基础设施管理员安装')
            }
          }
        }
      })
    } else if (metricsType === 'service') {
      if (!metricsName || isEmpty(target)) {
        return
      }
      const query = Object.assign({}, defaultQuery, {
        type: metricsName
      })
      getServicesMetrics(panel_id, null, clusterID, target, query, {
        failed: {
          func: err => {
            if (err.statusCode === 404 && getDeepValue(err, ['message', 'message']) === 'plugin prometheus not found') {
              notify.warn('该集群未安装 prometheus', '请联系基础设施管理员安装')
            }
          }
        }
      }).then(res => {
        this.setState({
          previewMetrics: {
            isFetching: false,
            data: res.response.result.data.map(item => {
              return {
                name: item.containerName,
                metrics: item.metrics
              }
            })
          }
        })
      })
    } else if (metricsType === 'node') {
      if (!metricsName || isEmpty(target)) {
        return
      }
      const query = Object.assign({}, defaultQuery, {
        type: metricsName
      })
      getClustersMetrics(panel_id, null, clusterID, target, query, {
        failed: {
          func: err => {
            if (err.statusCode === 404 && getDeepValue(err, ['message', 'message']) === 'plugin prometheus not found') {
              notify.warn('该集群未安装 prometheus', '请联系基础设施管理员安装')
            }
          }
        }
      }).then(res => {
        this.setState({
          previewMetrics: {
            isFetching: false,
            data: formatMetric(res.response.result, currentName)
          }
        })
      })
    }
  }

  nameCheck(rule, value, callback) {
    const { checkChartName, clusterID, currentChart, panel_id } = this.props
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
      checkChartName(clusterID, encodeURIComponent(value), { panel: panel_id }, {
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
    const {
      getMetrics, form, clusterID, getProxy, getAllClusterNodes, loadAllServices,
      allServiceList, nodeList, proxiesServices
     } = this.props
    const { getFieldValue, setFieldsValue } = form
    const preType = getFieldValue('metrics_type')
    if (type === 'service') {
      loadAllServices(clusterID, {
        pageIndex: 1,
        pageSize: 100
      })
    } else if (type === 'node') {
      getAllClusterNodes(clusterID)
    } else if (type === 'nexport') {
      getProxy(clusterID)
    }
    if (preType && (preType !== type)) {
      setFieldsValue({
        metrics_id: '',
        target: type === 'service' ? '' : []
      })
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
    const { getProxiesService, clusterID, form } = this.props
    const { getFieldValue, resetFields, setFieldsValue } = form
    const { currentChart } = this.state
    getProxiesService(clusterID, proxyID)
    const preID = getFieldValue('nexport')
    if (preID && (preID !== proxyID)) {
      setFieldsValue({
        target: []
      })
      if (currentChart && currentChart.content) {
        currentChart.content = null
      }
    }
    this.setState({
      nexport: proxyID,
      target: []
    }, this.getMonitorMetric)
  }

  targetCheck(rule, value, callback) {
    if (!value || !value.length) {
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
    let unit = '个'
    for (let i = 0; i < metricList.length; i++) {
      if (nickName === metricList[i].nickName) {
        name = metricList[i].name
        unit = metricList[i].unit
        break
      }
    }
    this.setState({
      metricsName: name,
      unit
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
          if (res.statusCode !== 403) {
            notify.warn('删除失败', res.message.message || res.message)
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
      }
      if (metrics_type === 'nexport') {
        Object.assign(body, {
          content: JSON.stringify({
            [nexport]: target
          })
        })
      } else {
        let newTarget = metrics_type === 'service' ? [target] : target
        Object.assign(body, {
          content: JSON.stringify({
            [metrics_type]: newTarget
          })
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
              if (res.statusCode !== 403) {
                notify.warn('修改失败', res.message.message || res.message)
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
              if (res.statusCode !== 403) {
                notify.warn('创建失败', res.message.message || res.message)
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
      visible, form, nodeList, allServiceList,
      proxyList, metricList, proxiesServices, monitorMetrics,
      isAdmin, currentChart
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
    let metrics_type = getFieldValue('metrics_type')
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
      if (metrics_type === 'service') {
        initialTarget = initialTarget[0]
      }
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

    const isNexport = metrics_type === 'nexport'
    let targetTypeChildren
    let targetChildren
    let exportChildren
    let metricsChildren
    let exportProps
    let targetProps = getFieldProps('target', {
      rules: [
        {
          validator: this.targetCheck
        }
      ],
      initialValue: initialTarget ? initialTarget : (metrics_type === 'service' ? '' : []),
      onChange: this.changeTarget
    })
    if (isNexport) {
      exportProps = getFieldProps('nexport', {
        rules: [
          {
            validator: this.exportCheck
          }
        ],
        initialValue: defaultNexport,
        onChange: this.changeExport
      })
    }

    targetTypeChildren = defaultTypeArr.map(item => {
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
        return <Option key={`${item.serviceName}`}>{`${item.serviceName}（${item.namespace}）`}</Option>
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
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
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
          <FormItem
            label="统计维度"
            {...formItemLayout}
          >
            <Select
              showSearch={true}
              {...targetTypeProps}
            >
              {targetTypeChildren}
            </Select>
          </FormItem>
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
          {
            isNexport &&
            <Row gutter={16} type="flex" align="middle" style={{ marginBottom: 24 }}>
              <Col span={3} style={{ textAlign: "right" }}>监控对象</Col>
              <Col span={17}>
                <FormItem style={{ marginBottom: 0 }}>
                  <Select
                    {...exportProps}
                    showSearch={true}
                    placeholder="搜索选择网络出口对象（单选）"
                  >
                    {exportChildren}
                  </Select>
                </FormItem>
              </Col>
              <Col className="hintColor" span={4} style={{ lineHeight: '32px' }}>多代理节点的汇总</Col>
            </Row>
          }
          <Row gutter={16} type="flex" align="middle" style={{ marginBottom: 24 }}>
            {
              !isNexport &&
              <Col span={3} style={{ textAlign: "right" }}>监控对象</Col>
            }
            <Col span={17} offset={isNexport ? 3 : 0}>
              <FormItem style={{ marginBottom: 0 }}>
                <Select
                  {...targetProps}
                  showSearch={true}
                  multiple={metrics_type !== 'service'}
                  placeholder="搜索选择对象"
                >
                  {targetChildren}
                </Select>
              </FormItem>
            </Col>
            <Col className={classNames("hintColor", {'hidden': metrics_type === 'service'})} span={4} style={{ lineHeight: '32px' }}>推荐不多于5个</Col>
          </Row>
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
                isEmpty(chartDate) ?
                  <div className="noChartData"/>
                  :
                  <ChartComponent
                    unit={unit}
                    metrics={currentChart ? currentChart.metrics : metricsName}
                    type={getFieldValue('metrics_type')}
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
  const { current, loginUser } = entities
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

  const { metrics, proxiesServices, monitorMetrics, serviceMetrics, nodeMetrics } = manageMonitor || { metrics: {}, proxiesServices: {}, monitorMetrics: {} }
  const { metricType } = metrics || { metricType: '' }
  const { proxyID } = proxiesServices || { proxyID: '' }

  const { projectName, userName: spaceUserName } = current.space
  const { userName } = loginUser.info
  let currentName = userName
  if (projectName !== DEFAULT_REGISTRY) {
    currentName = projectName
  } else if (spaceUserName && (spaceUserName !== userName)) {
    currentName = spaceUserName
  }

  let monitorID =  ''
  let finallyData
  if (currentChart) {
    monitorID = panel_id + currentChart.id
    const { type } = currentChart
    if (type === 'nexport') {
      finallyData = monitorMetrics[monitorID] || { data: [], isFetching: true }
      !isEmpty(finallyData.data) && finallyData.data.forEach(item => {
        if (!item.name.includes(currentName)) {
          return
        }
        item.name = item.name.replace(`-${currentName}`, '')
        const lastIndex = item.name.lastIndexOf('-')
        item.name = item.name.slice(0, lastIndex)
      })
    } else if (type === 'service') {
      finallyData = serviceMetrics[monitorID] || { data: [], isFetching: true }
    } else {
      finallyData = nodeMetrics[monitorID] || { data: [], isFetching: true }
    }
  }
  return {
    clusterID,
    nodeList,
    allServiceList,
    proxyList,
    metricList: metricType ? metrics[metricType].metrics : [],
    proxiesServices: proxyID ? proxiesServices[proxyID].data : [],
    monitorMetrics: finallyData,
    currentName
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
  getMonitorMetrics,
  getServicesMetrics,
  getClustersMetrics
})(MonitorChartModal)
