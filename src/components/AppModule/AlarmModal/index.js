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
import { Radio, Input, InputNumber, Form, Select, Icon, Button, Modal, Spin } from 'antd'
import './style/AlarmModal.less'
import CreateAlarmGroup from './CreateGroup'
import { loadAppList } from '../../../actions/app_manage'
import { loadServiceList } from '../../../actions/services'
import { getAllClusterNodes } from '../../../actions/cluster_node'
import { loadNotifyGroups, addAlertSetting } from '../../../actions/alert'
import NotificationHandler from '../../../common/notification_handler'

const Option = Select.Option
const RadioGroup = Radio.Group

let FistStop = React.createClass({
  componentWillMount() {
    const { loadAppList, appList, cluster, isFetchingApp, clusterNode, getAllClusterNodes, setParentState } = this.props
    if(!appList || appList.length == 0) {
      loadAppList(cluster.clusterID)
    }
    if(!clusterNode || clusterNode.length == 0) {
      getAllClusterNodes(cluster.clusterID)
    }
    setParentState({
      firstForm: this.props.form
    })
  },
  fistStopName(rule, value, callback) {
    if (!Boolean(value)) {
      callback(new Error('请输入名称'));
      return
    }
    callback()
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
      if(getFieldValue('type') == 'node') {
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
    form.validateFields((error, values) => {
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
    if(isNode) {
      if(isFetchingClusterNode) {
        return (<div key="loading" className='loadingBox'><Spin size='large'></Spin></div>)
      }
      if(!clusterNode || !clusterNode.nodes || !clusterNode.nodes.clusters || clusterNode.nodes.clusters.nodes.nodes.length == 0) {
        return <div key="null"></div>
      }
      return clusterNode.nodes.clusters.nodes.nodes.map(item => {
        return <Option key={item.objectMeta.name} value={item.objectMeta.name}>{`${item.objectMeta.name} | ${item.address}`}</Option>
      })
    } else {
      if(isFetchingApp) {
        return (<div key="loading" className='loadingBox'><Spin size='large'></Spin></div>)
      }
      return appList.map(item => {
        return <Option value={item.name} key={item.name}>{item.name}</Option>
      })
    }
  },
  getServiceList() {
    const { serviceList, loadServiceList, cluster, form} = this.props
    const { getFieldValue } = form
    if(getFieldValue('type') == 'node') return <div key="null"></div>
    const appName = getFieldValue('apply')
    if(!appName) return (<Option key="null"></Option>)
    if(!serviceList[appName]) {
      setTimeout(() => loadServiceList(cluster.clusterID, appName), 0)
      return (<div key="loading" className='loadingBox'><Spin size='large'></Spin></div>)
    }
    if(serviceList[appName].isFetcing) {
      return (<div key='loading' className='loadingBox'><Spin size='large'></Spin></div>)
    }
    const list = serviceList[appName].serviceList
    if(!list || list.legnth == 0) return [<Option key="null"></Option>]
    return list.map(service => {
      return <Option key={service.metadata.name} value={service.metadata.name}>{service.metadata.name}</Option>
    })
  },
  resetService(value) {
    const { setFieldsValue } = this.props.form
    setFieldsValue({
      server: ''
    })
  },
  resetType() {
    const { setFieldsValue } = this.props.form
    setFieldsValue({
      apply: '',
      server: ''
    })
 },
  render: function () {
    const { getFieldProps, getFieldValue, setFieldsValue } = this.props.form;
    const { funcs, currentApp, currentService } = this.props
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 17 }
    };
    const nameProps = getFieldProps('name', {
      rules: [
        { whitespace: true },
        { validator: this.fistStopName }
      ]
    });
    let initiaValue = 'node'
    if(currentService || currentApp) {
      initiaValue = 'service'
    }
    const typeProps = getFieldProps('type', {
      rules: [
        { whitespace: true },
        { validator: this.fistStopType }
      ],
      onChange: this.resetType,
      initialValue: initiaValue
    });
    let initAppName = ''
    if(currentApp) {
      initAppName = currentApp.name
    }
    let initService = ''
    if(currentService) {
      initService = currentService.metadata.name
      initAppName = currentService.metadata.labels['tenxcloud.com/appName']
    }
    const applyProps = getFieldProps('apply', {
      rules: [
        { whitespace: true },
        { validator: this.fistStopApply }
      ],
      onChange: this.resetService,
      initialValue: initAppName
    })
    const isNode = getFieldValue('type') == 'node' 
    const serverProps = getFieldProps('server', {
      rules: [
        { whitespace: true },
        { validator: isNode ? '' : this.fistStopServer }
      ],
      initialValue: initService
    });
    const repeatInterval = getFieldProps('interval' , {
      rules: [
        { require: true},
        { whitespace: true },
        { message: '请选择监控周期'}
      ],
      initialValue: '300'
    })
    return (
      <Form className="paramsSetting"> 
        <Form.Item label="名称" {...formItemLayout}>
          <Input {...nameProps} />
        </Form.Item>
        <Form.Item label="类型" {...formItemLayout}>
          <Select placeholder="请选择类型" {...typeProps} >
            <Option value="node">节点</Option>
            <Option value="service">服务</Option>
          </Select>
        </Form.Item>
        <Form.Item label="监控对象" {...formItemLayout}>
        <Select placeholder={ isNode ? '请选择节点' : '请选择应用'} {...applyProps} style={{ width: 170 }} >
            {this.getAppOrNodeList()}
      </Select>
        </Form.Item>
        <Form.Item>
        <Select placeholder="请选择服务" {...serverProps} style={{ width: 170, marginLeft: 25, display: isNode ? 'none' : 'inline-block' }} >
              {this.getServiceList()}
          </Select>
        </Form.Item>
        <Form.Item label="监控周期" {...formItemLayout}>
        <Select {...repeatInterval}>
            <Option value="300">5分钟</Option>
            <Option value="1800">30分钟</Option>
            <Option value="3600">一小时</Option>
          </Select>
        </Form.Item>
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
  const defaultClusterNode=[]
  const { cluster } = state.entities.current
  let appList = state.apps.appItems
  let serviceList = state.services.serviceItems
  let clusterNode = state.cluster_nodes.getAllClusterNodes
  let isFetchingClusterNode = false
  let isFetchingApp = false
  if(!appList || !appList[cluster.clusterID]) {
    appList = defaultAppList
  } else {
    isFetchingApp = appList[cluster.clusterID].isFetching
    appList = appList[cluster.clusterID].appList
  }
  if(!serviceList || !serviceList[cluster.clusterID]) {
    serviceList = defaultServiceList
  } else {
    serviceList = serviceList[cluster.clusterID]
  }
  if(!clusterNode || !clusterNode[cluster.clusterID]) {
    clusterNode = defaultClusterNode
  } else {
    isFetchingClusterNode = clusterNode.isFetching
    clusterNode = clusterNode[cluster.clusterID]
  }
  return {
    isFetchingApp,
    isFetchingClusterNode,
    appList,
    serviceList,
    clusterNode,
    cluster
  }
}

FistStop = connect(mapStateToProp, {
  loadServiceList,
  loadAppList,
  getAllClusterNodes,
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
    const { setParentState } = this.props
    setParentState({
      secondForm: this.props.form
    })
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
    // this.setState({
    //   newselectCpu: 0
    // })
  },
  addRule() {
    const _this = this
    const { form } = this.props;
    //if(this.state.haveRepeat) return
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      uuid++;
      // can use data-binding to get
      let cpu = form.getFieldValue('cpu');
      let typeProps = `typeProps_${uuid}`
      _this.setState({[typeProps]: '%'})
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
    if(this.state.haveRepeat) return
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
    let typeProps = `typeProps_${key}`
    if (type == 'network/rx_rate' || type == 'network/tx_rate') {
      this.setState({[typeProps]: 'KB/s'})
      return
    }
    this.setState({[typeProps]: '%'})
  },
  usedRule(rule, value, callback, key) {
    if(!value) return callback('请选择运算符')
    if(this.validateIsRepeat(key, value, `used_rule@${key}`)) {
      return callback('告警设置填写重复')
    } else {
      setTimeout(() => this.clearError(key), 0)
      return callback()
    }
    return callback()
  },
  usedName(rule, value, callback, key) {
    if(!value) return callback('请选择类型')
    if(this.validateIsRepeat(key, value, `used_name@${key}`)) {
      return callback('告警设置填写重复')
    } else {
      setTimeout(() => this.clearError(key), 0)
      return callback()
    }
    return callback()
  },
  usedData(rule, value, callback ,key) {
    if(!value) return callback('请填写数值')
    if(parseInt(value) <= 0) return callback('此数值需大于1')
    if(this.validateIsRepeat(key, value, `used_data@${key}`)) {
      return callback('告警设置填写重复')
    } else {
      setTimeout(() => this.clearError(key), 0)
      return callback()
    }
    return callback()
  },
  clearError(key) {
    const { form } = this.props
    if(!this.state.needClearError) return
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
      [`used_name@${key}`]:{
        errors: null,
        value: getFieldValue(`used_name@${key}`)
      }
    })
  },
  validateIsRepeat(key, value, field) {
    const { form } = this.props
    const { getFieldsValue, getFieldValue } = form
    const keyCount = getFieldValue('cpu')
    let newValue = getFieldsValue([`used_data@${key}`, `used_rule@${key}`, `used_name@${key}`].filter(item => item != field))
    newValue = this.getObjValueArr(newValue)
    newValue.push(value)
    if(keyCount && keyCount.length > 0) {
       const result = keyCount.some(item => {
        if(item == key) return false
        let existValue = getFieldsValue([`used_data@${item}`, `used_rule@${item}`, `used_name@${item}`])
        existValue = this.getObjValueArr(existValue)
        return existValue.every(value => {
          return newValue.indexOf(value) >= 0
        })
       })
      if(result == this.state.haveRepeat) {
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
  render() {
    const { getFieldProps, getFieldValue } = this.props.form;
    const { funcs } = this.props
    getFieldProps('cpu', {
      initialValue: [0],
    });
    const cpuItems = getFieldValue('cpu').map((key) => {
      return (
        <div className="ruleItem" key={key}>
          <Form.Item>
            <Select {...getFieldProps(`used_name@${key}`, {
              rules: [{
                whitespace: true,
                validator: (rule, value, callback) => this.usedName(rule, value, callback, key)
              }],
              initialValue: 'cpu/usage_rate',
              onChange: (type)=> this.changeType(key, type)
            }) } style={{ width: 135 }} >
              <Option value="cpu/usage_rate">CPU利用率</Option>
              <Option value="memory/usage">内存利用率</Option>
              <Option value="network/tx_rate">上传流量</Option>
              <Option value="network/rx_rate">下载流量</Option>

            </Select>
          </Form.Item>
          <Form.Item>
            <Select {...getFieldProps(`used_rule@${key}`, {
              rules: [{
                whitespace: true,
                validator: (rule, value, callback) => this.usedRule(rule, value, callback, key)
              }],
              initialValue: '>'
            }) } style={{ width: 80 }} >
              <Option value=">"><i className="fa fa-angle-right" style={{fontSize:16,marginLeft:5}}/></Option>
              <Option value="<"><i className="fa fa-angle-left" style={{fontSize:16,marginLeft:5}}/></Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <input type="number" className="ant-input-number-input inputBorder" min="1" max="100"  {...getFieldProps(`used_data@${key}`, {
              rules: [{
                whitespace: true,
                validator: (rule, value, callback) => this.usedData(rule, value, callback, key)
              }],
              initialValue: '0'
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
          <Input style={{ width: 80 }} disabled={true}  value= {this.state[`typeProps_${key}`]} />
          </Form.Item>
          <span className="rightBtns">
            <Button type="primary" onClick={this.addRule} size="large" icon="plus"></Button>
            <Button type="ghost" onClick={() => this.removeRule(key)} size="large" icon="cross"></Button>
          </span>
        </div>
      );
    });

    return (
      <Form className="alarmRule" inline={true} form={this.props.form}>
        {/* ------------- cpu Item --------------*/}

        {cpuItems}

        <div className="alertRule">
          <Icon type="exclamation-circle-o" /><a> CPU利用率</a>= 所有pod占用CPU之和/CPU资源总量
          <a style={{marginLeft: 20}}>内存使用率</a>= 所有pod占用内存之和/内存资源总量

        </div>
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
      isSendMeil: 1,
      createGroup: false, // create alarm group modal
    }
  }

  componentDidMount() {
    const { notifyGroup, loadNotifyGroups } = this.props
    if(!notifyGroup.result) {
      loadNotifyGroups()
    }
  }

  submitRule() {
    const { form, getAlertSetting } = this.props;
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      const specs = []
      const keyCount = this.state.keyCount
      keyCount.forEach(item => {
        const obj = {
          metricType: this.state[`used_name@${item}`],
          value: parseInt(this.state[`used_data@${item}`]),
          operator: this.state[`used_rule@${item}`]
        }
        if (obj.metricType == 'network/rx_rate' || obj.metricType == 'network/tx_rate') {
          obj.value = obj.value * 1024
        } else {
          obj.value = obj.value * 100
        }
        obj.value = obj.value.toString()
        specs.push(obj)
      })
      let targetType = this.state.type
      let targetName = this.state.server
      let appName = this.state.apply
      if(targetType == 'service') {
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
      notification.spin('告警策略创建中')
      this.props.addAlertSetting(cluster.clusterID, {
        targetType,
        targetName,
        specs,
        receiversGroup,
        strategyName,
        repeatInterval,
        appName,
        enable: 1,
        disableNotifyEndTime: '0s'
      }, {
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
            if(getAlertSetting) {
              getAlertSetting()
            }
          },
          isAsync: true
        },
        failed: {
          func: (result) => {
            notification.close()
            let message = '告警策略创建失败'
            if(result.message.message) {
              message = result.message.message
            } else if(result.message ) {
              message = result.message
            }
            notification.error(message)
          }
        }
      })
    })
  }

  setParentState() {
    return (value) => {
      this.setState(value)
    }
  }
  getNotifyGroup() {
    const { notifyGroup } = this.props
    if(notifyGroup.isFetching) {
      return (<div className="loadingBox"><Spin size="large"></Spin></div>)
    }
    if(!notifyGroup.result || notifyGroup.result.data.length == 0) {
      return null
    }
    return notifyGroup.result.data.map(item => {
      return <Option key={item.groupID} value={item.groupID}>{item.name}</Option>
    })
  }
  loadNotifyGroups() {
    const { loadNotifyGroups } = this.props
    loadNotifyGroups()
  }
  notifyGroup(rule, value, callback) {
    if(!value) {
      return callback('请选择告警通知组')
    }
    return callback()
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 17 }
    };
    const { getFieldProps } = this.props.form
    const notify = getFieldProps('notify', {
      rules: [
        { whitespace: true },
        { validator: this.notifyGroup }
      ]
    })
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
        <FistStop funcs={funcs} setParentState={this.setParentState()} currentApp={this.props.currentApp} currentService={this.props.currentService}/>
          </div>
          <div className={funcs.scope.state.step == 2 ? 'steps' : 'hidden'}>
            <TwoStop funcs={funcs} setParentState={this.setParentState()}/>
          </div>
          <div className={funcs.scope.state.step == 3 ? 'steps' : 'hidden'}>
            <Form className="alarmAction">
              <Form.Item label="发送通知" {...formItemLayout} style={{ margin: 0 }}>
                <RadioGroup defaultValue={this.state.isSendMeil} >
                  <Radio key="a" value={1}>是</Radio>
                  <Radio key="b" value={2}>否</Radio>
                </RadioGroup>
              </Form.Item>
              <div className="tips" style={{ marginBottom: 20 }}><Icon type="exclamation-circle-o" /> 选择“是”，我们会向您发送监控信息和告警信息，选择“否”，我们将不会向你发送告警信息</div>
              <Form.Item label="告警通知组" {...formItemLayout}>
                <Select placeholder="请选择告警通知组" style={{ width: 170 }} {...notify}>
                   {this.getNotifyGroup()}
                </Select>
                <div style={{ marginTop: 10 }}>
                  <Button icon="plus" onClick={()=> funcs.scope.setState({ alarmModal: false,createGroup: true })} size="large" type="primary">新建组</Button>
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
  let { groups } = state.alert
  const { cluster } = state.entities.current
  if(!groups) {
    groups = defaultGroup
  }
  return {
    notifyGroup: groups,
    cluster
  }
}
AlarmModal = connect(alarmModalMapStateToProp, {
  loadNotifyGroups,
  addAlertSetting
})(Form.create()(AlarmModal))


export default AlarmModal
