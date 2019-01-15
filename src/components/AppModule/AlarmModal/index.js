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
import { loadNotifyGroups, addAlertSetting, updateAlertSetting, getAlertSetting, getAlertSettingExistence } from '../../../actions/alert'
import { ROLE_SYS_ADMIN, ROLE_BASE_ADMIN } from '../../../../constants'
import NotificationHandler from '../../../components/Notification'
import startsWith from 'lodash/startsWith'
import cloneDeep from 'lodash/cloneDeep'
import { injectIntl, FormattedMessage } from 'react-intl'
import intlMsg from './Intl'
import ServiceCommonIntl, { AppServiceDetailIntl } from '../../AppModule/ServiceIntl'

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
    loadAppList(cluster.clusterID, {size: 100}) // 解决从应用列表跳转过来不请求的问题, 超过100会被忽略
    if ((!clusterNode || clusterNode.length == 0) && loginUser.info.role == ROLE_SYS_ADMIN) {
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
    const { intl: { formatMessage } } = this.props
    let newValue = value && value.trim()
    if (!Boolean(newValue)) {
      callback(new Error(formatMessage(intlMsg.plsInputName)));
      return
    }
    if (newValue.length <3 || newValue.length > 40) {
       callback(new Error(formatMessage(intlMsg.plsInput340)))
       return
    }
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5]{1}[a-zA-Z0-9\u4e00-\u9fa5\-_]+$/.test(newValue)){
      return callback(formatMessage(intlMsg.plsInputCnEnNum))
    }
    const { cluster,isEdit,data } = this.props
    if (isEdit && newValue == data.strategyName) {
      return callback()
    }
    this.setState({checkName: 'validating'})
    this.props.getAlertSettingExistence(cluster.clusterID,encodeURIComponent(newValue),{
      success: {
        func:(res)=> {
          if (res.data[newValue]) {
            this.setState({checkName:'error'})
            callback(formatMessage(intlMsg.stgNameRepeat))
            return
          }
          this.setState({checkName:'success'})
          callback()
        }
      },
      failed: {
        func:(err)=> {
          if (err.statusCode === 400) {
            this.setState({checkName:'error'})
            callback(formatMessage(intlMsg.nameIllegal))
            return
          }
          this.setState({checkName:'error'})
          callback(err.message)
        }
      }
    })
  },
  fistStopType(rule, value, callback) {
    const { intl: { formatMessage } } = this.props
    if (!Boolean(value)) {
      callback(new Error(formatMessage(intlMsg.plsSlcType)));
      return
    }
    callback()
  },
  fistStopApply(rule, value, callback) {
    const { intl: { formatMessage } } = this.props
    if (!Boolean(value)) {
      const { getFieldValue } = this.props.form
      if (getFieldValue('type') == 'node') {
        return callback(new Error(formatMessage(intlMsg.plsSlcNode)));
      }
      return callback(new Error(formatMessage(intlMsg.plsSlcApp)))
    }
    callback()
  },
  fistStopServer(rule, value, callback) {
    const { intl: { formatMessage } } = this.props
    if (!Boolean(value)) {
      const { getFieldValue } = this.props.form
      if (getFieldValue('type') == 'node') {
        return callback()
      }
      callback(new Error(formatMessage(intlMsg.plsSlcServer)));
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

      setParentState({
        name: values.name,
        type: values.type,
        apply: values.apply,
        server: values.server,
        interval: values.interval
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
    if (!list || list.length == 0) return [<Option key="null"></Option>]
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
    const { formatMessage } = this.props.intl
    const { loginUser } = this.props
    if (loginUser.info.role === ROLE_SYS_ADMIN || loginUser.info.role === ROLE_BASE_ADMIN) {
      let res = [<Option value="service" key="service"><FormattedMessage {...intlMsg.server}/></Option>]
      this.props.withNode && res.push(<Option value="node" key="node"><FormattedMessage {...intlMsg.node}/></Option>)
      return res
    }
    return <Option value="service" key="service"><FormattedMessage {...intlMsg.server}/></Option>
  },
  render: function () {
    const { getFieldProps, getFieldValue, setFieldsValue } = this.props.form;
    const { funcs, currentApp, currentService, data, isEdit, loginUser,clusterNode, intl: { formatMessage } } = this.props
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
    let isNode = getFieldValue('type') == 'node'
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
        initialValue: data.targetType == 1 && loginUser.info.role == ROLE_SYS_ADMIN ? 'node' : 'service'
      });
      // isNode = data.targetType
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
          { validator: this.fistStopServer }
        ],
        initialValue: data.targetName
      });
      repeatInterval = getFieldProps('interval', {
        rules: [
          { require: true },
          { whitespace: true },
          { message: formatMessage(intlMsg.slcMonitorCycle) }
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
      typeProps = getFieldProps('type', {
        rules: [
          { whitespace: true },
          { validator: this.fistStopType }
        ],
        onChange: this.resetType,
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
      // isNode = getFieldValue('type') == 'node'
      serverProps = getFieldProps('server', {
        rules: [
          { whitespace: true },
          { validator: this.fistStopServer }
        ],
        initialValue: initService
      });
      repeatInterval = getFieldProps('interval', {
        rules: [
          { require: true },
          { whitespace: true },
          { message: formatMessage(intlMsg.slcMonitorCycle) }
        ],
        initialValue: '300'
      })
    }

    const typevalue = this.props.form.getFieldValue("type")
    return (
      <Form className="paramsSetting">
        <Form.Item label={formatMessage(intlMsg.name)} {...ItemLayout} validateStatus={this.state.checkName} hasFeedback>
          <Input {...nameProps} placeholder={formatMessage(intlMsg.plsInputName)}/>
        </Form.Item>
        <Row>
          <Col span="12">
        <Form.Item label={formatMessage(intlMsg.type)} {...formItemLayout}>
        <Select placeholder={formatMessage(intlMsg.plsSlcType)} {...typeProps} disabled={currentApp || currentService}>
             { this.getTargetType()}
          </Select>
        </Form.Item>
        </Col>
        <Col span="12">
         <Form.Item label={formatMessage(intlMsg.monitorCycle)} {...formItemLayout} >
          <Select {...repeatInterval}>
            <Option value="300"><FormattedMessage {...intlMsg.min5}/></Option>
            <Option value="1800"><FormattedMessage {...intlMsg.min30}/></Option>
            <Option value="3600"><FormattedMessage {...intlMsg.hour1}/></Option>
          </Select>
        </Form.Item>
        </Col>
        </Row>
         <Form.Item label={formatMessage(intlMsg.monitorObj)} {...ItemLayout}>
         <Select disabled={this.props.createBy} placeholder={isNode ? formatMessage(intlMsg.plsSlcNode) : formatMessage(intlMsg.plsSlcApp)} {...applyProps} >
            {this.getAppOrNodeList()}
          </Select>
        </Form.Item>

       {typevalue == 'service' ?
        <Form.Item label={formatMessage(intlMsg.monitorServer)} {...ItemLayout}>
          <Select disabled={this.props.createBy === 'service'} placeholder={formatMessage(intlMsg.plsSlcServer)} {...serverProps} >
            {this.getServiceList()}
          </Select>
        </Form.Item>
        :null
        }

        <div className="wrapFooter">
          <Button size="large" onClick={() => funcs.cancelModal()}>{ formatMessage(ServiceCommonIntl.cancel) }</Button>
          <Button size="large" onClick={() => this.firstForm()} type="primary">{formatMessage(ServiceCommonIntl.nextStep)}</Button>
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

FistStop =  connect(mapStateToProp, {
  loadServiceList,
  loadAppList,
  getAllClusterNodes,
  getAlertSettingExistence,
})(Form.create()(injectIntl(FistStop, {
  withRef: true,
})))

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
      this.setState({ [`typeProps_${index}`]: this.switchSymbol(item.type, this) })
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
          this.setState({ [`typeProps_${index}`]: this.switchSymbol(item.type, this) })
        })
      }
    }
  },
  removeRule(k) {
    const { form, intl: { formatMessage } } = this.props;
    let cpu = form.getFieldValue('cpu');
    if (cpu.length == 1) {
      new NotificationHandler().info(formatMessage(intlMsg.atLeastOneRule))
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
      let concatArr = [ `used_rule@${item}`, `used_name@${item}` ]
      if (form.getFieldValue(`used_name@${item}`) === 'restart_count') {
       concatArr = [ `used_rule_time@${item}`, `used_name@${item}` ]
      }
      keyArr = keyArr.concat(concatArr)
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
        if (key.indexOf('used_rule@') > -1 && !getFieldValue(key)) {
          const keyIndex = key.split('@')[1]
          stateObj[key] = getFieldValue(`used_rule_time@${keyIndex}`)
        } else {
        stateObj[key] = getFieldValue(key)
        }
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
    const { intl: { formatMessage }, form: { setFieldsValue, resetFields } } = this.props
    let tcpArr = ['tcp/listen_state', 'tcp/est_state', 'tcp/close_wait_state', 'tcp/time_wait_state']
    let typeProps = `typeProps_${key}`
    resetFields([ `used_rule@${key}` ])
    if (type == 'network/rx_rate' || type == 'network/tx_rate') {
      this.setState({ [typeProps]: 'KB/s' })
      return
    }
    if (type == 'memory/usage') {
      this.setState({ [typeProps]: 'MB' })
      return
    }
    if (tcpArr.includes(type)) {
      this.setState({ [typeProps]: formatMessage(intlMsg.a) })
      return
    }
    if (type === 'restart_count') {
      setFieldsValue({
        [`used_rule_time${key}`]: 30
      })
      return this.setState({
        [typeProps]: '次',
      })
    }
    if (type === 'pod/pending') {
      setFieldsValue({
        [`used_rule@${key}`]: '>',
      })
      return this.setState({
        [typeProps]: '秒',
      })
    }
    if (type === 'prober_probe_result') {
      setFieldsValue({
        [`used_rule@${key}`]: 'failed',
      })
      return this.setState({
        [typeProps]: '秒',
      })
    }
    this.setState({ [typeProps]: '%' })
  },
  usedRuleTime(rule, value, callback, key) {
    const { intl: { formatMessage } } = this.props
    if (!value) return callback(formatMessage(intlMsg.plsSlcOperator))
    this.valieAllField(key, 'used_rule_time')
    if (this.validateIsRepeat(key, value)) {
      return callback(formatMessage(intlMsg.alarmSettingRepeat))
    } else {
      setTimeout(() => this.clearError(key), 0)
      return callback()
    }
    return callback()
  },
  usedRule(rule, value, callback, key) {
    const { intl: { formatMessage } } = this.props
    if (!value) return callback(formatMessage(intlMsg.plsSlcOperator))
    this.valieAllField(key, 'used_rule')
    if (this.validateIsRepeat(key, value, `used_rule@${key}`)) {
      return callback(formatMessage(intlMsg.alarmSettingRepeat))
    } else {
      setTimeout(() => this.clearError(key), 0)
      return callback()
    }
  },
  usedName(rule, value, callback, key) {
    const { intl: { formatMessage } } = this.props
    if (!value) return callback(formatMessage(intlMsg.plsSlcType))
    this.valieAllField(key, 'used_name')
    if (this.validateIsRepeat(key, value, `used_name@${key}`)) {
      return callback(formatMessage(intlMsg.alarmSettingRepeat))
    } else {
      setTimeout(() => this.clearError(key), 0)
      return callback()
    }
  },
  usedData(rule, value, callback, key) {
    const { intl: { formatMessage } } = this.props
    if (!value) return callback(formatMessage(intlMsg.plsInputNum))
    if (parseInt(value) <= 0) return callback(formatMessage(intlMsg.valueBig1))
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
    let ruleValue = `used_rule@${key}`
    if (getFieldValue(`used_name@${key}`) === 'restart_count') {
      ruleValue = `used_rule_time@${key}`
    }
    setFields({
      [`used_data@${key}`]: {
        errors: null,
        value: getFieldValue(`used_data@${key}`)
      },
      [ruleValue]: {
        errors: null,
        value: getFieldValue(ruleValue)
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
       let concatArr = [ `used_rule@${item}`, `used_name@${item}`]
       if (getFieldValue(`used_name@${item}`) === 'restart_count') {
        concatArr = [ `used_rule_time@${item}`, `used_name@${item}`]
       }
       keyArr = keyArr.concat(concatArr)
    })
    if (name) {
      let concatBrr = [`used_rule@${key}`, `used_name@${key}`]
      if (getFieldValue(`used_name@${key}`) === 'restart_count') {
        concatBrr = [`used_rule_time@${key}`, `used_name@${key}`]
      }
      keyArr = keyArr.concat(concatBrr.filter(item => {
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
    if (getFieldValue(`used_name@${key}`) === 'restart_count') {
      newValue = getFieldsValue([`used_rule_time@${key}`, `used_name@${key}`])
    }
    newValue = this.getObjValueArr(newValue)
    newValue.push(value)
    if (keyCount && keyCount.length > 0) {
      const result = keyCount.some(item => {
        if (item == key) return false
        let existValue = getFieldsValue([`used_rule@${item}`, `used_name@${item}`])
        if (getFieldValue(`used_name@${item}`) === 'restart_count') {
          existValue = getFieldsValue([`used_rule_time@${item}`, `used_name@${item}`])
        }
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
      case '任一容器连续重启次数':
        return 'restart_count'
      case '服务启动时间':
        return 'pod/pending'
      case '高可用健康检查':
        return 'prober_probe_result'
      default:
        return 'cpu/usage_rate'
    }
  },
  switchSymbol(type, that) {
    const { intl: { formatMessage } } = that.props
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
        return formatMessage(intlMsg.a)
      case '任一容器连续重启次数':
        return '次'
      case '服务启动时间':
        return '秒'
      default:
        return '%'
    }
  },
  calculateValue(type, threshold, interval) {
    threshold = threshold.toLowerCase()
    type = type.trim()
    switch (type) {
      case 'CPU利用率':
      case '磁盘利用率':
      case 'tcp listen连接数':
      case 'tcp established连接数':
      case 'tcp close_wait连接数':
      case 'tcp time_wait连接数':
      case '任一容器连续重启次数':
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
      case '服务启动时间':
        return this.dealWithInterval(interval)
      default:
        return 0
    }
  },
  dealWithInterval(interval) {
    if (!interval) return 0
    const newInterval = interval.substring(0, interval.length - 1)
    return newInterval
  },
  renderAlarmRulesOption(){
    const { formatMessage } = this.props.intl
    const { alarmType } = this.props
    const optionArray = [
      <Option key="1" value="cpu/usage_rate">
        {formatMessage(intlMsg.cpuUseRate)}
      </Option>,
      <Option key="2" value="memory/usage">
        {formatMessage(intlMsg.memoryUse)}
      </Option>,
      <Option key="3" value="network/tx_rate">
        {formatMessage(intlMsg.uploadFlow)}
      </Option>,
      <Option key="4" value="network/rx_rate">
        {formatMessage(intlMsg.downloadFlow)}
      </Option>,
    ]
    if(alarmType == 'node') {
      optionArray.push(<Option key="5" value="disk/usage">{formatMessage(intlMsg.diskUseRate)}</Option>)
      optionArray.push(<Option key="6" value="tcp/listen_state">TCP listen</Option>)
      optionArray.push(<Option key="7" value="tcp/est_state">TCP established</Option>)
      optionArray.push(<Option key="8" value="tcp/close_wait_state">TCP close_wait</Option>)
      optionArray.push(<Option key="9" value="tcp/time_wait_state">TCP time_wait</Option>)
    } else if (alarmType == 'service') {
      optionArray.push(
        <Option key="10" value="restart_count">任一容器连续重启</Option>,
        <Option key="11" value="pod/pending">服务启动时间</Option>,
        <Option key="11" value="prober_probe_result">高可用健康检查</Option>
      )
    }
    return optionArray
  },
  renderRuleFormItem(key) {
    const nameVal = this.props.form.getFieldValue(`used_name@${key}`)
    switch (nameVal) {
      case 'pod/pending':
        return <Option value=">"><i className="fa fa-angle-right" style={{ fontSize: 16, marginLeft: 5 }} /></Option>
      case 'prober_probe_result':
        return <Option value="failed">不健康</Option>
      default :
        return [
          <Option value=">"><i className="fa fa-angle-right" style={{ fontSize: 16, marginLeft: 5 }} /></Option>,
          <Option value="<"><i className="fa fa-angle-left" style={{ fontSize: 16, marginLeft: 5 }} /></Option>
        ]
    }
  },
  render() {
    const { formatMessage } = this.props.intl
    const { getFieldProps, getFieldValue, getFieldsValue } = this.props.form;
    const { funcs, data, isEdit, alarmType } = this.props
    let cpuItems
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
        const usedName = getFieldValue(`used_name@${key}`)
        let userRuleProps
        if (usedName === 'restart_count') {
          userRuleProps = getFieldProps(`used_rule_time@${key}`, {
            rules: [{
              whitespace: true,
              validator: (rule, value, callback) => this.usedRuleTime(rule, value, callback, key)
            }],
            initialValue: this.dealWithInterval(value.interval) || 30,
          })
        } else {
          userRuleProps = getFieldProps(`used_rule@${key}`, {
            rules: [{
              whitespace: true,
              validator: (rule, value, callback) => this.usedRule(rule, value, callback, key)
            }],
            initialValue: usedName === 'prober_probe_result' ? 'failed' : value.operation || '>',
          })
        }
        return (
          <div className="ruleItem" key={key}>
            <Form.Item>
              <Select {...getFieldProps(`used_name@${key}`, {
                rules: [{
                  whitespace: true,
                  validator: (rule, value, callback) => setTimeout(() => this.usedName(rule, value, callback, key))
                }],
                initialValue: this.switchType(value.type),
                onChange: (type) => this.changeType(key, type)
              }) } style={{ width: 135 }} >
                { this.renderAlarmRulesOption() }
              </Select>
            </Form.Item>
            {
              usedName === 'restart_count' ?
                <span>
                  <Form.Item style={{ marginRight: 6 }}>
                    <InputNumber
                      step={10}
                      min={1}
                      {...userRuleProps}
                      style={{ width: 70 }}
                    />
                  </Form.Item>
                  &nbsp;&nbsp;分钟内重启&nbsp;&nbsp;
                </span> :
                <Form.Item >
                  <Select {...userRuleProps} style={{ width: 70 }}>
                    {this.renderRuleFormItem(key)}
                  </Select>
                </Form.Item>
            }
            {
              usedName !== 'prober_probe_result' ?
                <span>
                  <Form.Item>
                    <InputNumber step={10} {...getFieldProps(`used_data@${key}`, {
                      rules: [{
                        whitespace: true,
                        validator: (rule, value, callback) => this.usedData(rule, value, callback, key)
                      }],
                      initialValue: this.calculateValue(value.type, value.threshold, value.interval)
                    }) } style={{ width: 70 }} />
                  </Form.Item>
                  <Form.Item style={{ marginRight: 0 }}>
                    <Input style={{ width: 60 }} disabled={true} value={this.state[`typeProps_${key}`]} />
                  </Form.Item>
                </span>
                : null
            }
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
        const usedName = getFieldValue(`used_name@${key}`)
        let userRuleProps
        if (usedName === 'restart_count') {
          userRuleProps = getFieldProps(`used_rule_time@${key}`, {
            rules: [{
              whitespace: true,
              validator: (rule, value, callback) => this.usedRuleTime(rule, value, callback, key)
            }],
            initialValue: 30,
          })
        } else {
          userRuleProps = getFieldProps(`used_rule@${key}`, {
            rules: [{
              whitespace: true,
              validator: (rule, value, callback) => this.usedRule(rule, value, callback, key)
            }],
            initialValue: '>',
          })
        }
        return (
          <div className="ruleItem" key={`create-${key}`}>
            <Form.Item>
              <Select {...getFieldProps(`used_name@${key}`, {
                rules: [{
                  whitespace: true,
                  validator: (rule, value, callback) => setTimeout(() => this.usedName(rule, value, callback, key))
                }],
                initialValue: 'cpu/usage_rate',
                onChange: (type) => this.changeType(key, type)
              }) } style={{ width: 135 }} >
                { this.renderAlarmRulesOption() }
              </Select>
            </Form.Item>
            {
              usedName === 'restart_count' ?
                <span>
                  <Form.Item style={{ marginRight: 6 }}>
                    <InputNumber
                      step={10}
                      min={1}
                      {...userRuleProps}
                      style={{ width: 70 }}
                    />
                  </Form.Item>
                  &nbsp;&nbsp;分钟内重启&nbsp;&nbsp;
                </span> :
                <span className='secondItem'>
                  <Form.Item>
                    <Select {...userRuleProps} style={{ width: 70 }} >
                      {this.renderRuleFormItem(key)}
                    </Select>
                  </Form.Item>
                </span>
            }
            {
              usedName !== 'prober_probe_result' ?
                <span>
                  <Form.Item>
                    <InputNumber step={10} {...getFieldProps(`used_data@${key}`, {
                      rules: [{
                        whitespace: true,
                        validator: (rule, value, callback) => this.usedData(rule, value, callback, key)
                      }],
                      initialValue: '80'
                    }) } style={{ width: 70 }} />
                  </Form.Item>
                  <Form.Item style={{ marginRight: 0 }}>
                    <Input style={{ width: 60 }} disabled={true} value={this.state[`typeProps_${key}`]} />
                  </Form.Item>
                </span>
                : null
            }
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
            <span className="rightBtns">
              <Button type="primary" onClick={this.addRule} size="large" icon="plus"></Button>
              <Button type="ghost" onClick={() => this.removeRule(key)} size="large" icon="cross"></Button>
            </span>
          </div>
        );
      });
    }


    return (
      <Form className="alarmRule" inline={true} form={this.props.form}>
        {/* ------------- cpu Item --------------*/}

        {cpuItems}

        <div className="alertRule">
           <Icon type="exclamation-circle-o" /><a> <FormattedMessage {...intlMsg.cpuUseRate}/></a>= <FormattedMessage {...intlMsg.cpuRateFormula}/>
           <div><a style={{ marginLeft: 16 }}><FormattedMessage {...intlMsg.memoryUse}/></a>= <FormattedMessage {...intlMsg.memoryRateFormula}/></div>
        </div>
        {/*  footer btn */}
        <div className="wrapFooter">
          <Button size="large" onClick={() => funcs.nextStep(1)} type="primary"><FormattedMessage {...intlMsg.upStep}/></Button>
          <Button size="large" onClick={() => this.hnadRule()} type="primary"><FormattedMessage {...intlMsg.nextStep}/></Button>
        </div>
      </Form>
    )
  }
})

TwoStop = Form.create()(injectIntl(TwoStop, {
  withRef: true,
}))

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
  submitRule = () => {
    const {formatMessage} = this.props.intl
    const { form, getSettingList, pathname, activeCluster, loadData, funcs } = this.props;
    const { scope } = funcs
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      const specs = []
      const keyCount = this.state.keyCount
      Array.isArray(keyCount) && keyCount.forEach(item => {
        const obj = {
          metricType: this.state[`used_name@${item}`],
          value: parseInt(this.state[`used_data@${item}`]) || 0,
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
        } else if (obj.metricType == 'pod/pending') {
          // 服务启动时间
          obj.interval = `${obj.value}s`
          obj.value = "0"
        } else if (obj.metricType == 'restart_count') {
          // 任意容器连续缓重启
          obj.interval = `${obj.operator}m`
          obj.operator = '>'
        } else if (obj.metricType == 'prober_probe_result') {
          // 健康检查告警
          obj.value = "0"
          obj.operator = ">"
        }
        obj.value = obj.value.toString()
        obj.operator = obj.operator.toString()
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
      const repeatInterval = parseInt(this.state.interval)
      const cluster = this.props.cluster
      const notification = new NotificationHandler()
      const { isEdit, strategy, setting } = this.props
      let requestBody = {
        targetType,
        targetName,
        specs,
        receiversGroup,
        strategyName,
        repeatInterval,
        appName,
        sendEmail: this.state.isSendEmail,
        enable:1,
        disableNotifyEndTime: '0s'
      }

      if (isEdit) {
        // update
        // requestBody.strategyID = strategy.strategyID
        requestBody.enable = strategy.enable

        if(!this.state.isSendEmail) {
          delete requestBody.receiversGroup
        }
        notification.spin(formatMessage(AppServiceDetailIntl.alarmStrategyUpdating))
        let clusterID = cluster.clusterID
        if (startsWith(pathname, '/cluster') && activeCluster) {
          clusterID = activeCluster
        }
        this.props.updateAlertSetting(clusterID, strategy.strategyID, requestBody, {
          success: {
            func: () => {
              notification.close()
              notification.success(formatMessage(AppServiceDetailIntl.alarmStrategyUpdateSuccess))
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
              let message = formatMessage(AppServiceDetailIntl.alarmStrategyUpdateFailure)
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
        notification.spin(formatMessage(AppServiceDetailIntl.alarmStrategyCreating))
        let clusterID = cluster.clusterID
        if (startsWith(pathname, '/cluster') && activeCluster) {
          clusterID = activeCluster
        }
        this.props.addAlertSetting(clusterID, requestBody, {
          success: {
            func: () => {
              notification.close()
                notification.success(formatMessage(AppServiceDetailIntl.alarmStrategyCreateSuccess))
              const { funcs } = this.props
              funcs.cancelModal()
              form.resetFields()
              this.state.firstForm.resetFields()
              this.state.secondForm.resetFields()
              funcs.nextStep(1)
              if (getSettingList) {
                getSettingList()
              }
              scope && scope.setState({
                currentPage: 1,
                search: '',
              }, () => {
                loadData && loadData({
                  from: 0,
                  page: 1,
                })
              })
            },
            isAsync: true
          },
          failed: {
            func: (result) => {
              notification.close()
              let message = formatMessage(AppServiceDetailIntl.alarmStrategyCreateFailure)
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
  notifyGroup = (rule, value, callback) => {
    const {formatMessage} = this.props.intl
    if (!value) {
      return callback(formatMessage(AppServiceDetailIntl.pleaseChoicemonitorGroup))
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
    const { funcs, intl: { formatMessage } } = this.props
    return (
      <div className="AlarmModal">
        <div className="topStep">
          <span className={funcs.scope.state.step >= 1 ? 'step active' : 'step'}><span className="number">1</span>{formatMessage(AppServiceDetailIntl.argumentConfig)}</span>
          <span className={funcs.scope.state.step > 1 ? 'step active' : 'step'}><span className="number">2</span> {formatMessage(AppServiceDetailIntl.monitorRules)}</span>
          <span className={funcs.scope.state.step == 3 ? 'step active' : 'step'}><span className="number">3</span>{formatMessage(AppServiceDetailIntl.monitorBehavior)}</span>
        </div>
        <div className="alarmContent">
          <div className={funcs.scope.state.step == 1 ? 'steps' : 'hidden'}>
            <FistStop withNode={this.props.withNode} createBy={this.props.createBy} isShow={this.props.isShow} funcs={funcs} setParentState={this.setParentState()} currentApp={this.props.currentApp} currentService={this.props.currentService} isEdit={isEdit} data={this.props.strategy} resetFields={()=> this.resetFields()}/>
          </div>
          <div className={funcs.scope.state.step == 2 ? 'steps' : 'hidden'}>
            {
              funcs.scope.state.step >= 2 &&
              <TwoStop funcs={funcs} setParentState={this.setParentState()} isEdit={isEdit} data={this.props.setting} isShow={this.props.isShow} resetFields={()=> this.resetFields()} alarmType={this.state.type}/>
            }
          </div>
          <div className={funcs.scope.state.step == 3 ? 'steps' : 'hidden'}>
            <Form className="alarmAction">
              <Form.Item label={formatMessage(AppServiceDetailIntl.sendMessage)} {...formItemLayout} style={{ margin: 0 }}>
                <RadioGroup defaultValue={this.state.isSendEmail} value={this.state.isSendEmail} onChange={(e) => this.sendMail(e)}>
                  <Radio key="a" value={1}>{formatMessage(ServiceCommonIntl.yes)}</Radio>
                  <Radio key="b" value={0}>{ formatMessage(ServiceCommonIntl.no) }</Radio>
                </RadioGroup>
              </Form.Item>
              <div className="tips" style={{ marginBottom: 20 }}><Icon type="exclamation-circle-o" />{formatMessage(AppServiceDetailIntl.monitorMessagesChoiceInfo)}</div>
              <Form.Item label={formatMessage(AppServiceDetailIntl.monitorGroup)} {...formItemLayout} style={{display: this.state.isSendEmail ? 'block' : 'none'}}>
                <Select placeholder={formatMessage(AppServiceDetailIntl.pleaseChoicemonitorGroup)} style={{ width: 170 }} {...notify}>
                  {this.getNotifyGroup()}
                </Select>
                <div style={{ marginTop: 10 }}>
                  <Button icon="plus" onClick={() => this.showAlramGroup()} size="large" type="primary">{formatMessage(AppServiceDetailIntl.newGroup)}</Button>
                </div>
              </Form.Item>
            </Form>
            <div className="wrapFooter">
              <Button size="large" onClick={() => funcs.nextStep(2)} type="primary">{formatMessage(ServiceCommonIntl.lastStep)}</Button>
              <Button size="large" onClick={() => this.submitRule()} type="primary">{formatMessage(ServiceCommonIntl.submit)}</Button>
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
    space
  }
}

export default connect(alarmModalMapStateToProp, {
  loadNotifyGroups,
  addAlertSetting,
  updateAlertSetting,
  getAlertSetting
})(Form.create()(injectIntl(AlarmModal, {
  withRef: true,
})))

