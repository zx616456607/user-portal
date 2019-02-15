/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Create Alarm component
 *
 * v0.1 - 2017-3-20
 * @author BaiYu
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Radio, Input, InputNumber, Form, Select, Icon, Button, Modal, Spin,Row,Col } from 'antd'
import './style/AlarmModal.less'
import { loadAppList } from '../../../actions/app_manage'
import { loadServiceList } from '../../../actions/services'
import { getAllClusterNodes } from '../../../actions/cluster_node'
import { loadNotifyGroups, addAlertSetting, addAlertRegularSetting, updateAlertSetting, getAlertSetting, getAlertSettingExistence,
  getAlertLogSettingExistence, getLogAlertPluginStatus } from '../../../actions/alert'
import { ADMIN_ROLE } from '../../../../constants'
import NotificationHandler from '../../../components/Notification'
import startsWith from 'lodash/startsWith'
import cloneDeep from 'lodash/cloneDeep'

const Option = Select.Option
const RadioGroup = Radio.Group
let isUseing = false

let FistStop = React.createClass({
  getInitialState() {
    return {
      checkName: null
    }
  },
  componentWillMount() {
    const { loadAppList, appList, cluster, isFetchingApp, clusterNode, getAllClusterNodes, setParentState, loginUser, funcs } = this.props
    if (!appList || appList.length == 0) {
      loadAppList(cluster.clusterID)
    }
    if ((!clusterNode || clusterNode.length == 0) && loginUser.info.role == ADMIN_ROLE) {
      getAllClusterNodes(cluster.clusterID)
    }
    setParentState({
      firstForm: this.props.form
    })
  },
  componentWillReceiveProps(nextProps) {
    const { isShow, loadAppList, cluster, getAllClusterNodes } = nextProps
    if (!this.props.isShow && isShow) {
      loadAppList(cluster.clusterID)
      getAllClusterNodes(cluster.clusterID)
    }
  },
  componentDidMount() {
    const { resetFields } = this.props
    setTimeout(resetFields, 0)
  },
  fistStopName(rule, value, callback) {
    let newValue = value && value.trim()
    if (!Boolean(newValue)) {
      callback(new Error('请输入名称'));
      return
    }
    if (newValue.length <3 || newValue.length > 40) {
       callback(new Error('请输入3~40位字符'))
       return
    }
    if (!/^[-._a-zA-Z0-9]+$/.test(newValue)){
      return callback('请输入英文字母,数字,中划线,下划线或点号')
    }
    const { cluster,isEdit,data,form } = this.props
    if (isEdit) {
      form.setFieldsValue({'name': data.strategyName})
      return callback()
    }
    this.setState({checkName: 'validating'})
    this.props.getAlertSettingExistence(cluster.clusterID,newValue,{
      success: {
        func:(res)=> {
          if (res.data === false) { // false 代表重复
            this.setState({checkName:'error'})
            callback('策略名称重复')
            return
          }
          this.setState({checkName:'success'})
          callback()
        }
      },
      failed: {
        func:(err)=> {
          if (err.statusCode === 400) {
            this.setState({checkName:'warning'})
            callback('名称包含非法字符')
            return
          }
          this.setState({checkName:'warning'})
          callback(err.message)
        }
      }
    })
  },
  fistStopType(rule, value, callback) {
    if (!Boolean(value)) {
      callback(new Error('请选择类型'));
      return
    }
    callback()
  },
  fistStopApply(rule, value, callback) {
    if (!Boolean(value)) {
      const { getFieldValue } = this.props.form
      if (getFieldValue('type') == 'node') {
        return callback(new Error('请选择节点'));
      }
      return callback(new Error('请选择应用'))
    }
    callback()
  },
  fistStopServer(rule, value, callback) {
    if (!Boolean(value)) {
      callback(new Error('请选择服务'));
      return
    }
    callback()
  },
  firstForm() {
    const { funcs, form, setParentState } = this.props
    const validateArray = [
      'name',
      'type',
      'apply',
      'interval',
    ]
    const typeValue = form.getFieldValue('type')
    if(typeValue == 'service'){
      validateArray.push('server')
    }
    form.validateFields(validateArray, (error, values) => {
      if (!!error) {
        return
      }
      const { getFieldValue } = form
      setParentState({
        name: getFieldValue('name'),
        type: getFieldValue('type'),
        apply: getFieldValue('apply'),
        server: getFieldValue('server'),
        interval: getFieldValue('interval')
      })
      funcs.nextStep(2) // go step 2
    })
  },
  getAppOrNodeList() {
    const { isFetchingApp, isFetchingClusterNode, clusterNode, appList, form } = this.props
    const { getFieldValue, resetFields } = form
    const isNode = getFieldValue('type') == 'node'
    if (isNode) {
      if (isFetchingClusterNode) {
        return (<div key="loading" className='loadingBox'><Spin size='large'></Spin></div>)
      }
      if (!clusterNode || !clusterNode.nodes || !clusterNode.nodes.clusters || clusterNode.nodes.clusters.nodes.nodes.length == 0) {
        return <div key="null"></div>
      }
      return clusterNode.nodes.clusters.nodes.nodes.map(item => {
        return <Option key={item.objectMeta.name} value={item.objectMeta.name}>{`${item.objectMeta.name} | ${item.address}`}</Option>
      })
    } else {
      if (isFetchingApp) {
        return (<div key="loading" className='loadingBox'><Spin size='large'></Spin></div>)
      }
      return appList.map(item => {
        return <Option value={item.name} key={item.name}>{item.name}</Option>
      })
    }
  },
  getServiceList() {
    const { serviceList, loadServiceList, cluster, form } = this.props
    const { getFieldValue } = form
    if (getFieldValue('type') == 'node') return <div key="null"></div>
    const appName = getFieldValue('apply')
    if (!appName) return (<Option key="null"></Option>)
    if (!serviceList[appName]) {
      setTimeout(() => loadServiceList(cluster.clusterID, appName), 0)
      return (<div key="loading" className='loadingBox'><Spin size='large'></Spin></div>)
    }
    if (serviceList[appName].isFetcing) {
      return (<div key='loading' className='loadingBox'><Spin size='large'></Spin></div>)
    }
    const list = serviceList[appName].serviceList
    if (!list || list.legnth == 0) return [<Option key="null"></Option>]
    return list.map(service => {
      return <Option key={service.metadata.name} value={service.metadata.name}>{service.metadata.name}</Option>
    })
  },
  resetService() {
    const { setFieldsValue } = this.props.form
    setFieldsValue({
      server: undefined
    })
  },
  resetType() {
    const { setFieldsValue } = this.props.form
    setFieldsValue({
      apply: undefined,
      server: undefined
    })
  },
  getTargetType() {
    const { loginUser } = this.props
    if (loginUser.info.role == ADMIN_ROLE) {
      return [
      // <Option value="node" key="node">节点</Option>,
      <Option value="service" key="service">服务</Option>]
    }
    return <Option value="service" key="service">服务</Option>
  },
  render: function () {
    const { getFieldProps, getFieldValue, setFieldsValue } = this.props.form;
    const { funcs, currentApp, currentService, data, isEdit, loginUser,clusterNode } = this.props
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    };
    const ItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 20 }
    };
    let nameProps
    let typeProps
    let applyProps
    let serverProps
    let repeatInterval
    let isNode
    if (isEdit) {
      nameProps = getFieldProps('name', {
        rules: [
          { validator: this.fistStopName }
        ],
        initialValue: data.strategyName
      });
      typeProps = getFieldProps('type', {
        rules: [
          { whitespace: true },
          { validator: this.fistStopType }
        ],
        onChange: this.resetType,
        initialValue: data.targetType == 1 && loginUser.info.role == ADMIN_ROLE ? 'node' : 'service'
      });
      isNode = data.targetType
      applyProps = getFieldProps('apply', {
        rules: [
          { whitespace: true },
          { validator: this.fistStopApply }
        ],
        onChange: this.resetService,
        initialValue: isNode ? data.targetName : data.appName
      })
      serverProps = getFieldProps('server', {
        rules: [
          { whitespace: true },
          { validator: isNode ? '' : this.fistStopServer }
        ],
        initialValue: data.targetName
      });
      repeatInterval = getFieldProps('interval', {
        rules: [
          { require: true },
          { whitespace: true },
          { message: '请选择监控周期' }
        ],
        initialValue: data.repeatInterval.toString()
      })
    } else {
      nameProps = getFieldProps('name', {
        rules: [
          { validator: this.fistStopName }
        ],
        initialValue: ''
      });
      let initiaValue = 'node'
      if (currentService || currentApp) {
        initiaValue = 'service'
      }
      typeProps = getFieldProps('type', {
        rules: [
          { whitespace: true },
          { validator: this.fistStopType }
        ],
        onChange: this.resetType,
        // initialValue: loginUser.info.role == ADMIN_ROLE ? initiaValue : 'service'
        initialValue: 'service'
      });
      let initAppName
      let initService
      if (currentApp && currentApp.services[0]) {
        initService = currentApp.services[0].metadata.name
        initAppName = currentApp.name
      }
      if (currentService) {
        initService = currentService.metadata.name
        initAppName = currentService.metadata.labels['system/appName']
      }
      applyProps = getFieldProps('apply', {
        rules: [
          { whitespace: true },
          { validator: this.fistStopApply }
        ],
        onChange: this.resetService,
        // initialValue: initAppName
        initialValue: funcs.scope.props.nodeName? funcs.scope.props.nodeName : initAppName
      })
      isNode = getFieldValue('type') == 'node'
      serverProps = getFieldProps('server', {
        rules: [
          { whitespace: true },
          { validator: isNode ? '' : this.fistStopServer }
        ],
        initialValue: initService
      });
      repeatInterval = getFieldProps('interval', {
        rules: [
          { require: true },
          { whitespace: true },
          { message: '请选择监控周期' }
        ],
        initialValue: '300'
      })
    }

    const typevalue = this.props.form.getFieldValue("type")
    return (
      <Form className="paramsSetting">
        <Form.Item label="名称" {...ItemLayout} validateStatus={this.state.checkName} hasFeedback>
          <Input {...nameProps} placeholder="请输入名称" disabled={isEdit}/>
        </Form.Item>
        <Row>
          <Col span="12">
        <Form.Item label="类型" {...formItemLayout}>
        <Select placeholder="请选择类型" {...typeProps} disabled={currentApp || currentService}>
             { this.getTargetType()}
          </Select>
        </Form.Item>
        </Col>
        <Col span="12">
         <Form.Item label="监控周期" {...formItemLayout} >
          <Select {...repeatInterval}>
            <Option value="300">5分钟</Option>
            <Option value="1800">30分钟</Option>
            <Option value="3600">一小时</Option>
          </Select>
        </Form.Item>
        </Col>
        </Row>
         <Form.Item label="监控对象" {...ItemLayout}>
         <Select placeholder={isNode ? '请选择节点' : '请选择应用'} {...applyProps} >
            {this.getAppOrNodeList()}
          </Select>
        </Form.Item>

       {typevalue == 'service' ?
        <Form.Item label="监控服务" {...ItemLayout}>
          <Select placeholder="请选择服务" {...serverProps} >
            {this.getServiceList()}
          </Select>
        </Form.Item>
        :null
        }

        <div className="wrapFooter">
          <Button size="large" onClick={() => funcs.cancelModal()}>取消</Button>
          <Button size="large" onClick={() => this.firstForm()} type="primary">下一步</Button>
        </div>
      </Form>
    )
  }
})

function mapStateToProp(state, prop) {
  const defaultAppList = []
  const defaultServiceList = {}
  const defaultClusterNode = []
  const { cluster } = state.entities.current
  let appList = state.apps.appItems
  let serviceList = state.services.serviceItems
  let clusterNode = state.cluster_nodes.getAllClusterNodes
  let isFetchingClusterNode = false
  let isFetchingApp = false
  if (!appList || !appList[cluster.clusterID]) {
    appList = defaultAppList
  } else {
    isFetchingApp = appList[cluster.clusterID].isFetching
    appList = appList[cluster.clusterID].appList
  }
  if (!serviceList || !serviceList[cluster.clusterID]) {
    serviceList = defaultServiceList
  } else {
    serviceList = serviceList[cluster.clusterID]
  }
  if (!clusterNode || !clusterNode[cluster.clusterID]) {
    clusterNode = defaultClusterNode
  } else {
    isFetchingClusterNode = clusterNode.isFetching
    clusterNode = clusterNode[cluster.clusterID]
  }
  const { loginUser } = state.entities
  return {
    isFetchingApp,
    isFetchingClusterNode,
    appList,
    serviceList,
    clusterNode,
    cluster,
    loginUser
  }
}

FistStop = connect(mapStateToProp, {
  loadServiceList,
  loadAppList,
  getAllClusterNodes,
  getAlertSettingExistence : getAlertLogSettingExistence,
})(Form.create()(FistStop))

// two step in cpu add rule
let uuid = 0;

let TwoStop = React.createClass({
  getInitialState() {
    return {
      // newselectCpu: 1,
      typeProps_0: ['%'],
      haveRepeat: false
    }
  },
  componentWillMount() {
    const { setParentState, data } = this.props
    setParentState({
      secondForm: this.props.form
    })
    data.forEach((item, index) => {
      this.setState({ [`typeProps_${index}`]: this.switchSymbol(item.type) })
    })
    this.setState({
      firstMount: true
    })
  },
  componentDidMount() {
    const { resetFields } = this.props
    setTimeout(resetFields,0)

  },
  componentWillReceiveProps(nextProps) {
    if (this.state.firstMount || (nextProps.isShow && nextProps.isShow != this.props.isShow)) {
      const { data } = nextProps
      if(data && data.length > 0) {
        this.setState({
          firstMount: false
        })
      }
      const { isEdit } = nextProps
      if (isEdit) {
        data.forEach((item, index) => {
          this.setState({ [`typeProps_${index}`]: this.switchSymbol(item.type) })
        })
      }
    }
  },
  removeRule(k) {
    const { form } = this.props;
    let cpu = form.getFieldValue('cpu');
    if (cpu.length == 1) {
      new NotificationHandler().info('至少得有一项规则')
      return
    }
    // can use data-binding to get
    cpu = cpu.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      cpu,
    });
    let keyArr = []
    cpu.forEach(item => {
      if (item == k) return
      keyArr = keyArr.concat([`used_data@${item}`, `used_rule@${item}`, `used_name@${item}`])
    })
    form.validateFields(keyArr, {force: true,first: false, firstFields: false}, (err) => {
      if(!err) {
        this.setState({
          needClearError: false
        })
      }
    })
    // this.setState({
    //   newselectCpu: 0
    // })
  },
  addRule() {
    const _this = this
    const { form } = this.props;
    isUseing = true
    //if(this.state.haveRepeat) return
    form.validateFields((error, values) => {
      isUseing = false
      if (!!error) {
        return
      }
      uuid++;

      // can use data-binding to get
      let cpu = form.getFieldValue('cpu');
      let typeProps = `typeProps_${uuid}`
      _this.setState({ [typeProps]: '%' })
      cpu = cpu.concat(uuid);
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
        cpu,
      });
    })
    //
    // if (this.state.newselectCpu) return
    // this.setState({
    //   newselectCpu: 1
    // })
  },
  hnadRule() {
    // nextStep
    const { form, funcs, setParentState } = this.props;
    if (this.state.haveRepeat) return
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      const { getFieldValue } = form
      const cpu = form.getFieldValue('cpu');
      const stateObj = {}
      function tool(key) {
        stateObj[key] = getFieldValue(key)
      }
      cpu.forEach(index => {
        let key = `used_data@${index}`
        tool(key)
        key = `used_name@${index}`
        tool(key)
        key = `used_symbol@${index}`
        tool(key)
        key = `used_rule@${index}`
        tool(key)
        setParentState({
          [`typeProps_${index}`]: this.state[`typeProps_${index}`]
        })
      })
      setParentState(stateObj)
      setParentState({
        keyCount: cpu
      })
      funcs.nextStep(3)
    })
  },
  changeType(key, type) {
    let tcpArr = ['tcp/listen_state', 'tcp/est_state', 'tcp/close_wait_state', 'tcp/time_wait_state']
    let typeProps = `typeProps_${key}`
    if (type == 'network/rx_rate' || type == 'network/tx_rate') {
      this.setState({ [typeProps]: 'KB/s' })
      return
    }
    if (type == 'memory/usage') {
      this.setState({ [typeProps]: 'MB' })
      return
    }
    if (tcpArr.includes(type)) {
      this.setState({ [typeProps]: '个' })
      return
    }
    this.setState({ [typeProps]: '%' })
  },
  usedRule(rule, value, callback, key) {
    if (!value) return callback('请选择运算符')
    this.valieAllField(key, 'used_rule')
    if (this.validateIsRepeat(key, value, `used_rule@${key}`)) {
      return callback('告警设置填写重复')
    } else {
      setTimeout(() => this.clearError(key), 0)
      return callback()
    }
  },
  usedName(rule, value, callback, key) {
    if (!value) return callback('请填写日志正则')
    setTimeout(() => this.clearError(key), 0)
    return callback()
    this.valieAllField(key, 'used_name')
    if (this.validateIsRepeat(key, value, `used_name@${key}`)) {
      return callback('日志正则填写重复')
    } else {
      setTimeout(() => this.clearError(key), 0)
      return callback()
    }
  },
  usedData(rule, value, callback, key) {
    if (!value) return callback('请填写数值')
    if (parseInt(value) <= 0) return callback('此数值需大于1')
    this.valieAllField(key, 'used_data')
    return callback()
    // if (this.validateIsRepeat(key, value, `used_data@${key}`)) {
    //   return callback('告警设置填写重复')
    // } else {
    //   setTimeout(() => this.clearError(key), 0)
    //   return callback()
    // }
  },
  clearError(key) {
    const { form } = this.props
    if (!this.state.needClearError) return
    const { setFields, getFieldValue } = form
    setFields({
      [`used_data@${key}`]: {
        errors: null,
        value: getFieldValue(`used_data@${key}`)
      },
      [`used_rule@${key}`]: {
        errors: null,
        value: getFieldValue(`used_rule@${key}`)
      },
      [`used_name@${key}`]: {
        errors: null,
        value: getFieldValue(`used_name@${key}`)
      }
    })
  },
  valieAllField(key, name) {
    if(isUseing) return
    isUseing = true
    const { form } = this.props;
    const { getFieldValue } = form
    const keyCount = getFieldValue('cpu')

    let keyArr = []
    let obj = {}
    keyCount.forEach(item => {
       if(item == key) return
       keyArr = keyArr.concat([`used_data@${item}`, `used_name@${item}`])
    })
    if (name) {
      keyArr = keyArr.concat([`used_data@${key}`, `used_name@${key}`].filter(item => {
        return item !== `${name}@${key}`
      }))
    }
    form.validateFields(keyArr, {force: true,first: false, firstFields: false}, function(err, value) {
      isUseing = false
    })
  },
  validateIsRepeat(key, value, field) {
    const { form } = this.props
    const { getFieldsValue, getFieldValue } = form
    const keyCount = getFieldValue('cpu')
    let newValue = getFieldsValue([`used_rule@${key}`, `used_name@${key}`])
    newValue = this.getObjValueArr(newValue)
    newValue.push(value)
    if (keyCount && keyCount.length > 0) {
      const result = keyCount.some(item => {
        if (item == key) return false
        let existValue = getFieldsValue([`used_rule@${item}`, `used_name@${item}`])
        existValue = this.getObjValueArr(existValue)
        return existValue.every(v => {
          return newValue.indexOf(v) >= 0
        })
      })
      if (result == this.state.haveRepeat) {
        this.setState({
          needClearError: false
        })
      } else {
        this.setState({
          needClearError: true
        })
      }
      this.setState({
        haveRepeat: result
      })
      return result
    }
  },
  getObjValueArr(obj) {
    const keyArr = Object.getOwnPropertyNames(obj)
    return keyArr.map(key => {
      return obj[key]
    })
  },
  switchType(type) {
    type = type.trim()
    switch (type) {
      case 'CPU利用率':
        return 'cpu/usage_rate'
      case '内存使用率':
      case '内存使用':
        return 'memory/usage'
      case '上传流量':
        return 'network/tx_rate'
      case '下载流量':
        return 'network/rx_rate'
      case '磁盘利用率':
        return 'disk/usage'
      case 'tcp listen连接数':
        return 'tcp/listen_state'
      case 'tcp established连接数':
        return 'tcp/est_state'
      case 'tcp close_wait连接数':
        return 'tcp/close_wait_state'
      case 'tcp time_wait连接数':
        return 'tcp/time_wait_state'
      default:
        return 'cpu/usage_rate'
    }
  },
  switchSymbol(type) {
    type = type.trim()
    switch (type) {
      case 'CPU利用率':
      case '磁盘利用率':
        return '%'
      case '内存使用率':
      case '内存使用':
        return 'MB'
      case '上传流量':
        return 'kb/s'
      case '下载流量':
        return 'kb/s'
      case 'tcp listen连接数':
      case 'tcp established连接数':
      case 'tcp close_wait连接数':
      case 'tcp time_wait连接数':
        return '个'
      default:
        return '%'
    }
  },
  calculateValue(type, threshold) {
    threshold = threshold.toLowerCase()
    type = type.trim()
    switch (type) {
      case 'CPU利用率':
      case '磁盘利用率':
      case 'tcp listen连接数':
      case 'tcp established连接数':
      case 'tcp close_wait连接数':
      case 'tcp time_wait连接数':
        return parseInt(threshold)
      case '内存使用率':
      case '内存使用':
        if (threshold.indexOf('gb') > 0) {
          return (parseFloat(threshold) * 1024).toFixed(0)
        }
        if (threshold.indexOf('kb') > 0) {
          return (parseFloat(threshold) / 1024).toFixed(0)
        }
       if (threshold.indexOf('mb') > 0) {
          return (parseFloat(threshold)).toFixed(0)
        }
        return threshold
      case '上传流量': case '下载流量':
        if (threshold.indexOf('gb') > 0) {
          return (parseFloat(threshold) * 1024 * 1024).toFixed(0)
        }
        if (threshold.indexOf('mb') > 0) {
          return (parseFloat(threshold) * 1024).toFixed(0)
        }
        return parseInt(threshold)
      default:
        return 0
    }
  },
  renderAlarmRulesOption(){
    const { alarmType } = this.props
    const optionArray = [
      <Option key="1" value="cpu/usage_rate">CPU利用率</Option>,
      <Option key="2" value="memory/usage">内存使用</Option>,
      <Option key="3" value="network/tx_rate">上传流量</Option>,
      <Option key="4" value="network/rx_rate">下载流量</Option>
    ]
    if(alarmType == 'node') {
      optionArray.push(<Option key="5" value="disk/usage">磁盘利用率</Option>)
      optionArray.push(<Option key="6" value="tcp/listen_state">TCP listen</Option>)
      optionArray.push(<Option key="7" value="tcp/est_state">TCP established</Option>)
      optionArray.push(<Option key="8" value="tcp/close_wait_state">TCP close_wait</Option>)
      optionArray.push(<Option key="9" value="tcp/time_wait_state">TCP time_wait</Option>)
    }
    return optionArray
  },
  render() {
    const { getFieldProps, getFieldValue } = this.props.form;
    const { funcs, data, alarmType, initData, isEdit: fisEdit } = this.props
    // console.log('initData', initData)
    let cpuItems
    const isEdit = false
    if (isEdit) {
      const cloneData = cloneDeep(data)
      // 当告警类型有'节点'型修改为'服务'型时，移除原有告警规则中的'磁盘利用率'
      let ruleList = []
      if(alarmType == 'service'){
        cloneData.forEach((item, index) => {
          if(item.type && (!['磁盘利用率','tcp listen连接数', 'tcp established连接数', 'tcp close_wait连接数', 'tcp time_wait连接数'].includes(item.type.trim()))){
            ruleList.push(item)
          }
        })
      } else if (alarmType == 'node') {
        ruleList = cloneData
      }
      if(!ruleList.length){
        ruleList.push({
          operation: '>',
          recordCount: '0',
          threshold: '80%',
          type: "CPU利用率 ",
        })
      }
      getFieldProps('cpu', {
        initialValue: ruleList.map((item, index) => index),
      })
      cpuItems = getFieldValue('cpu').map((key) => {
        let ruleItem = ruleList[key] || {}
        let value = Object.assign({}, { type: '', threshold: '' }, ruleItem)
        return (
          <div className="ruleItem" key={key}>
            <Form.Item>
              <Select {...getFieldProps(`used_name@${key}`, {
                rules: [{
                  whitespace: true,
                  validator: (rule, value, callback) => this.usedName(rule, value, callback, key)
                }],
                initialValue: this.switchType(value.type),
                onChange: (type) => this.changeType(key, type)
              }) } style={{ width: 135 }} >
                { this.renderAlarmRulesOption() }
              </Select>
            </Form.Item>
            <Form.Item >
              <Select {...getFieldProps(`used_rule@${key}`, {
                rules: [{
                  whitespace: true,
                  validator: (rule, value, callback) => this.usedRule(rule, value, callback, key)
                }],
                initialValue: value.operation,
              }) } style={{ width: 80 }}>
                <Option value=">"><i className="fa fa-angle-right" style={{ fontSize: 16, marginLeft: 5 }} /></Option>
                <Option value="<"><i className="fa fa-angle-left" style={{ fontSize: 16, marginLeft: 5 }} /></Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <InputNumber step={10} {...getFieldProps(`used_data@${key}`, {
                rules: [{
                  whitespace: true,
                  validator: (rule, value, callback) => this.usedData(rule, value, callback, key)
                }],
                initialValue: this.calculateValue(value.type, value.threshold)
              }) } style={{ width: 80 }} />
            </Form.Item>
            <Form.Item>
              {/*<Select {...getFieldProps(`used_symbol@${key}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择单位',
              }],
              initialValue: '%'
            }) } style={{ width: 80 }} >
              <Option value="%">%</Option>
              <Option value="KB/s">KB/s</Option>
            </Select>*/}
              <Input style={{ width: 80 }} disabled={true} value={this.state[`typeProps_${key}`]} />
            </Form.Item>
            <span className="rightBtns">
              <Button type="primary" onClick={this.addRule} size="large" icon="plus"></Button>
              <Button type="ghost" onClick={() => this.removeRule(key)} size="large" icon="cross"></Button>
            </span>
          </div>
        );
      });
    }
    else {
      getFieldProps('cpu', {
        initialValue: [0],
      });
      cpuItems = getFieldValue('cpu').map((key) => {
        return (
          <div className="ruleItem" key={`create-${key}`}>
            <Form.Item
              label="日志正则"
            >
              <Input {...getFieldProps(`used_name@${key}`, {
                rules: [{
                  whitespace: true,
                  validator: (rule, value, callback) => this.usedName(rule, value, callback, key)
                }],
                initialValue: fisEdit ? initData.regex : undefined,
                onChange: (type) => this.changeType(key, type)
              }) } style={{ width: 330 }} ></Input>
            </Form.Item>
            <Form.Item>
              <InputNumber step={10} {...getFieldProps(`used_data@${key}`, {
                rules: [{
                  whitespace: true,
                  validator: (rule, value, callback) => this.usedData(rule, value, callback, key)
                }],
                initialValue: fisEdit ? initData.numEvents : '80'
              }) } style={{ width: 80 }} />次
            </Form.Item>
            {/* <span className="rightBtns">
              <Button type="primary" onClick={this.addRule} size="large" icon="plus"></Button>
              <Button type="ghost" onClick={() => this.removeRule(key)} size="large" icon="cross"></Button>
            </span> */}
          </div>
        );
      });
    }


    return (
      <Form className="alarmRule" inline={true} form={this.props.form}>
        {/* ------------- cpu Item --------------*/}

        {cpuItems}

        {/* <div className="alertRule">
          <Icon type="exclamation-circle-o" /><a> CPU利用率</a>= 所有容器实例占用CPU总和/CPU资源总量
          <div><a style={{ marginLeft: 16 }}>内存使用</a>= 所有容器实例占用内存总和/容器实例数量</div>
        </div> */}
        {/*  footer btn */}
        <div className="wrapFooter">
          <Button size="large" onClick={() => funcs.nextStep(1)} type="primary">上一步</Button>
          <Button size="large" onClick={() => this.hnadRule()} type="primary">下一步</Button>
        </div>
      </Form>
    )
  }
})

TwoStop = Form.create()(TwoStop)

class AlarmModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isSendEmail: 1,
      createGroup: false, // create alarm group modal
      showAlramGroup: true,
    }
  }

  componentDidMount() {
    const { notifyGroup, loadNotifyGroups, isEdit, strategy, getAlertSetting, cluster, pathname, activeCluster } = this.props
    let clusterID = cluster.clusterID
    // console.log('strategy', strategy)
    // return
    if (startsWith(pathname, '/cluster') && activeCluster) {
      clusterID = activeCluster
    }
    if (!notifyGroup.result) {
      loadNotifyGroups("", clusterID)
    }
    if (isEdit) {
      getAlertSetting(clusterID, {
        strategy: strategy.strategyID
      }, {
        success: {
          func: (res) => {
            uuid = res.data.length
          }
        }
      })
      this.setState({
        isSendEmail: strategy.sendEmail
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    const { form, loadNotifyGroups } = this.props
    if(!nextProps.isShow) {
      form.resetFields()
      this.state.firstForm.resetFields()
      //this.state.secondForm.resetFields()
    }
    const { isEdit, strategy, getAlertSetting, cluster, pathname, activeCluster } = nextProps
    let clusterID = cluster.clusterID
    if (startsWith(pathname, '/cluster') && activeCluster) {
      clusterID = activeCluster
    }
    if(nextProps.space.spaceID && nextProps.space.spaceID !== this.props.space.spaceID) {

      loadNotifyGroups('', clusterID)
    }
    if (nextProps.isShow && nextProps.isShow != this.props.isShow) {
      if (isEdit) {
        getAlertSetting(clusterID, {
          strategy: strategy.strategyID
        }, {
          success: {
            func: (res) => {
              uuid = res.data.length
            }
          }
        })
        this.setState({
          isSendEmail: strategy.sendEmail
        })
      }
    }
  }
  submitRule() {
    const { form, getSettingList, pathname, activeCluster,notifyGroup, currentApiServer,
      getLogAlertPluginStatus, cluster  } = this.props;
    form.validateFields(async (error, values) => {
      if (!!error) {
        return
      }
      const notification = new NotificationHandler()
      const statusRes = await getLogAlertPluginStatus(cluster, {
        failed: {
          func: () => {}
        }
      })
      if (statusRes.error && statusRes.error.statusCode === 404) {
        return notification.warn('日志告警组件未安装', '请联系管理员检查组件相关服务')
      }
      const specs = []
      const keyCount = this.state.keyCount
      Array.isArray(keyCount) && keyCount.forEach(item => {
        const obj = {
          metricType: this.state[`used_name@${item}`],
          value: parseInt(this.state[`used_data@${item}`]),
          operator: this.state[`used_rule@${item}`]
        }
        if (obj.metricType == 'network/rx_rate' || obj.metricType == 'network/tx_rate') {
          obj.value = obj.value * 1024
        } else if (obj.metricType == 'memory/usage') {
          obj.value = obj.value * 1024 * 1024
        } else if (obj.metricType === 'cpu/usage_rate') {
          obj.value = obj.value * 100
        } else if (obj.metricType === 'disk/usage') {
          obj.value = obj.value * 100
        }
        obj.value = obj.value.toString()
        specs.push(obj)
      })
      let targetType = this.state.type
      let targetName = this.state.server
      let appName = this.state.apply
      if (targetType == 'service') {
        targetType = 0
      } else {
        targetType = 1
        appName = ''
        targetName = this.state.apply
      }
      const receiversGroup = form.getFieldValue('notify')
      const strategyName = this.state.name
      const repeatInterval = parseInt(this.state.interval) / 60
      const cluster = this.props.cluster
      const { isEdit, strategy, setting } = this.props
      // let requestBody = {
      //   targetType,
      //   targetName,
      //   specs,
      //   receiversGroup,
      //   strategyName,
      //   repeatInterval,
      //   appName,
      //   sendEmail: this.state.isSendEmail,
      //   enable:1,
      //   disableNotifyEndTime: '0s'
      // }
      const service = this.state.server
      const num_events = parseInt(specs[0].value)
      // let sendEmail = []
      // if (this.state.isSendEmail) {
      //   const datas = notifyGroup.result.data
      //   datas.forEach((data)=>{
      //     if (data.groupID === receiversGroup) {
      //       sendEmail = data.receivers.email.map(( email ) => {
      //         return email.addr
      //       })
      //     }
      //   })
      // }
      const requestBody = {
        name: strategyName,
        num_events,
        Minutes: repeatInterval,
        Service: service,
        regex: specs[0].metricType,
        app: appName,
        url: currentApiServer,
      }
      if (this.state.isSendEmail) {
        // requestBody.email = sendEmail
        requestBody.alertGroup = receiversGroup
      }
      if (isEdit) {
        if(!this.state.isSendEmail) {
          delete requestBody.receiversGroup
        }
        notification.spin('告警策略更新中')
        let clusterID = cluster.clusterID
        if (startsWith(pathname, '/cluster') && activeCluster) {
          clusterID = activeCluster
        }
        this.props.updateAlertSetting(clusterID, requestBody, {
          success: {
            func: () => {
              notification.close()
              notification.success('告警策略更新成功')
              const { funcs } = this.props
              funcs.cancelModal()
              form.resetFields()
              this.state.firstForm.resetFields()
              this.state.secondForm.resetFields()
              if (getSettingList) {
                getSettingList()
              }
              if (funcs.callback) {
                funcs.callback()
                return
              }
              funcs.nextStep(1)
            },
            isAsync: true
          },
          failed: {
            func: (result) => {
              notification.close()
              let message = '告警策略更新失败'
              if (result.message.message) {
                message = result.message.message
              } else if (result.message) {
                message = result.message
              }
              notification.error(message)
            }
          }
        })
      } else {
         // create
        notification.spin('告警策略创建中')
        let clusterID = cluster.clusterID
        if (startsWith(pathname, '/cluster') && activeCluster) {
          clusterID = activeCluster
        }
        this.props.addAlertSetting(clusterID, requestBody, {
          success: {
            func: () => {
              notification.close()
                notification.success('告警策略创建成功')
              const { funcs } = this.props
              funcs.cancelModal()
              form.resetFields()
              this.state.firstForm.resetFields()
              this.state.secondForm.resetFields()
              funcs.nextStep(1)
              if (getSettingList) {
                getSettingList()
              }
              // scope && scope.setState({
              //   currentPage: 1,
              //   search: '',
              // }, () => {
              //   loadData && loadData({
              //     from: 0,
              //     page: 1,
              //   })
              // })
            },
            isAsync: true
          },
          failed: {
            func: (result) => {
              notification.close()
              let message = '告警策略创建失败'
              if (result.message.message) {
                message = result.message.message
              } else if (result.message) {
                message = result.message
              }
              notification.error(message)
            }
          }
        })
      }


    })
  }

  setParentState() {
    return (value) => {
      this.setState(value)
    }
  }
  getNotifyGroup() {
    const { notifyGroup } = this.props
    if (notifyGroup.isFetching) {
      return (<div className="loadingBox" key="loadingBox"><Spin size="large"></Spin></div>)
    }
    if (!notifyGroup.result || notifyGroup.result.data.length == 0) {
      return null
    }
    return notifyGroup.result.data.map(item => {
      return <Option key={item.groupID} value={item.groupID}>{item.name}</Option>
    })
  }
  loadNotifyGroups() {
    const { loadNotifyGroups, pathname, activeCluster } = this.props
    let clusterID = this.props.cluster.clusterID
    if (startsWith(pathname, '/cluster')) {
      clusterID = activeCluster
    }
    loadNotifyGroups("", clusterID)
  }
  notifyGroup(rule, value, callback) {
    if (!value) {
      return callback('请选择告警通知组')
    }
    return callback()
  }
  sendMail(e) {
    this.setState({
      isSendEmail: e.target.value,
    })
  }
  resetFields() {
    const { funcs, form } = this.props
    const { firstForm, secondForm } = this.state
    funcs.scope.setState({
      resetFields: () => {
        form.resetFields()
        if(secondForm){
          secondForm.resetFields()
        }
        firstForm.resetFields()
      }
    })
  }
  showAlramGroup() {
    const { funcs } = this.props
    funcs.scope.setState({ alarmModal: false, createGroup: true })
    setTimeout(()=> {
      document.getElementById('groupName').focus()
    },500)
  }
  render() {
    if (this.props.isFetching) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }

    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 }
    }
    const { getFieldProps } = this.props.form
    const { strategy, isEdit } = this.props
    let initreceiver = ''
    if (strategy && isEdit) {
      initreceiver = strategy.receiversGroup
    }
    let notify = getFieldProps('notify', {
      rules: [
        { whitespace: true },
        { validator: this.notifyGroup }
      ],
      initialValue: initreceiver
    })
    if(this.state.isSendEmail) {
      notify = getFieldProps('notify', {
        rules: [
          { whitespace: true },
          { validator: this.notifyGroup }
        ],
        initialValue: initreceiver
      })
    } else {
      notify = getFieldProps('notify', {
        initialValue: initreceiver
      })
    }
    const { funcs } = this.props
    return (
      <div className="AlarmModal">
        <div className="topStep">
          <span className={funcs.scope.state.step >= 1 ? 'step active' : 'step'}><span className="number">1</span> 参数设置</span>
          <span className={funcs.scope.state.step > 1 ? 'step active' : 'step'}><span className="number">2</span> 告警规则</span>
          <span className={funcs.scope.state.step == 3 ? 'step active' : 'step'}><span className="number">3</span> 告警行为</span>
        </div>
        <div className="alarmContent">
          <div className={funcs.scope.state.step == 1 ? 'steps' : 'hidden'}>
            <FistStop isShow={this.props.isShow} funcs={funcs} setParentState={this.setParentState()} currentApp={this.props.currentApp} currentService={this.props.currentService} isEdit={isEdit} data={this.props.strategy} resetFields={()=> this.resetFields()}/>
          </div>
          <div className={funcs.scope.state.step == 2 ? 'steps' : 'hidden'}>
            {
              funcs.scope.state.step >= 2 &&
              <TwoStop funcs={funcs} setParentState={this.setParentState()} isEdit={isEdit} data={this.props.setting} isShow={this.props.isShow} resetFields={()=> this.resetFields()} alarmType={this.state.type} initData = { this.props.strategy }/>
            }
          </div>
          <div className={funcs.scope.state.step == 3 ? 'steps' : 'hidden'}>
            <Form className="alarmAction">
              <Form.Item label="发送通知" {...formItemLayout} style={{ margin: 0 }}>
                <RadioGroup defaultValue={this.state.isSendEmail} value={this.state.isSendEmail} onChange={(e) => this.sendMail(e)}>
                  <Radio key="a" value={1}>是</Radio>
                  <Radio key="b" value={0}>否</Radio>
                </RadioGroup>
              </Form.Item>
              <div className="tips" style={{ marginBottom: 20 }}><Icon type="exclamation-circle-o" /> 选择“是”，我们会向您发送监控信息和告警信息，选择“否”，我们将不会向你发送告警信息</div>
              <Form.Item label="告警通知组" {...formItemLayout} style={{display: this.state.isSendEmail ? 'block' : 'none'}}>
                <Select placeholder="请选择告警通知组" style={{ width: 170 }} {...notify}>
                  {this.getNotifyGroup()}
                </Select>
                <div style={{ marginTop: 10 }}>
                  <Button icon="plus" onClick={() => this.showAlramGroup()} size="large" type="primary">新建组</Button>
                </div>
              </Form.Item>
            </Form>
            <div className="wrapFooter">
              <Button size="large" onClick={() => funcs.nextStep(2)} type="primary">上一步</Button>
              <Button size="large" onClick={() => this.submitRule()} type="primary">提交</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function alarmModalMapStateToProp(state, porp) {
  const defaultGroup = {}
  const { alert, entities, terminal, routing } = state
  let { groups } = alert
  const { cluster, space } = entities.current
  const { active } = terminal
  const { cluster: activeCluster } = active || { cluster: undefined }
  const { locationBeforeTransitions } = routing
  const { pathname } = locationBeforeTransitions
  const { info: { tenxApi } } = entities.loginUser
  const currentApiServer = tenxApi.protocol + '://' + tenxApi.host
  if (!groups) {
    groups = defaultGroup
  }

  const defaultSettingDetail = {
    isFetching: false,
    result: {
      data: []
    }
  }
  let isFetching = false
  let { getSetting, settingList } = alert
  if (!getSetting || !getSetting.result) {
    getSetting = defaultSettingDetail
  }
  isFetching = getSetting.isFetching
  let setting = getSetting.result.data
  if (!Array.isArray(setting)) setting = []
  return {
    notifyGroup: groups,
    cluster,
    activeCluster,
    pathname,
    setting,
    isFetching,
    space,
    currentApiServer,
  }
}
AlarmModal = connect(alarmModalMapStateToProp, {
  loadNotifyGroups,
  addAlertSetting: addAlertRegularSetting,
  updateAlertSetting: addAlertRegularSetting,
  getAlertSetting,
  getLogAlertPluginStatus,
})(Form.create()(AlarmModal))


export default AlarmModal
