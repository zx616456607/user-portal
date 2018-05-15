/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 *IaasTabModal tabModal1
 *
 * v0.1 - 2018-04-08
 * @author rensiwei
 */
import React from 'react'
import { Modal, Button, Select, Input, Steps, Icon, Tooltip, Radio, Row, Col, Form, Spin, InputNumber } from 'antd'
import '../style/tabModal.less'
import classNames from 'classnames'
import * as autoScalerActions from '../../../../actions/clusterAutoScaler'
import { connect } from 'react-redux'
import NotificationHandler from '../../../../../src/components/Notification'

const notify = new NotificationHandler()
const FormItem = Form.Item
let isGetParams = true // 是否获取接口数据
let disabledIconCon = [ 'aws', 'azure', 'ali' ] // 禁用的图标按钮集合
let isEdit = false
let datacenterList = [],
  templatePathList = {},
  datastorePathList = {},
  resourcePoolPathList = {}
let cluster = '',
  iaas = ''
let updateTimer,
  addTimer
let form1Fun
let firstAdd = 1// 第一次新增
let isCreated = {}// 是否创建过策略的集群汇总
const formItemLargeLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
}
const diskFormat = num => {
  if (num < 1024) {
    return num + 'MB'
  }
  num = parseInt(num / 1024)
  if (num < 1024) {
    return num + 'GB'
  }
  num = parseInt(num / 1024)
  return num + 'TB'
}
class Form1 extends React.Component {
  roleNameChange = e => {
    e.target.value = e.target.value.substr(0, 100)
  }
  checkName = (rule, value, callback) => {
    if (!isEdit) {
      _.filter(this.props.allData, { name: value })[0] ? callback(new Error('策略名称重复')) : callback()
      return
    }
    if (value !== this.props.currentData.name) { // 修改时改了名字
      _.filter(this.props.allData, { name: value })[0] ? callback(new Error('策略名称重复')) : callback()
      return
    }
    callback()

  }
  render() {
    const { getFieldProps } = this.props.form
    const { datacenter, datastorePath, resourcePoolPath, templatePath, targetPath, name, template, datastore, resourcePool } = this.props
    form1Fun = this
    return (
      <Form horizontal className={'step1 panel noBottom ' + (this.props.currentStep === 0 ? '' : 'hide') } >
        <Row key="row1">
          <FormItem
            {...formItemLargeLayout}
            label="策略名称"
          >
            <Input {...getFieldProps('name', { initialValue: name,
              validate: [{
                rules: [
                  { required: true, message: '策略名称' },
                  { validator: this.checkName },
                ],
                trigger: [ 'onBlur', 'onChange' ],
              }],
              onChange: this.roleNameChange })} placeholder="支持 100 字以内的中英文" />
          </FormItem>
        </Row>
        <Row key="row3">
          <FormItem
            {...formItemLargeLayout}
            label="数据中心"
          >
            <Select {...getFieldProps('datacenter', {
              initialValue: datacenter,
              validate: [{
                rules: [
                  { required: true, message: '请选择数据中心' },
                ],
                trigger: [ 'onChange' ],
              }],
              onChange: this.props.onDataCenterChange,
            })} placeholder="请选择数据中心" style={{ width: '100%' }}>
              <Select.Option value=""><span className="optionValueNull">请选择数据中心</span></Select.Option>
              {
                datacenterList.map((item, i) => {
                  return <Select.Option key={i} value={item}>{item}</Select.Option>
                })
              }
            </Select>
          </FormItem>
        </Row>
        <Row key="row33">
          <FormItem
            {...formItemLargeLayout}
            label="选择路径"
          >
            <Input {...getFieldProps('targetPath', { initialValue: targetPath,
              validate: [{
                rules: [
                  { required: true, message: '请选择路径' },
                ],
                trigger: [ 'onBlur', 'onChange' ],
              }] })}
            placeholder="如 /paas/vms/autoscaling-group" />
          </FormItem>
        </Row>
        <Row key="row4">
          <FormItem
            {...formItemLargeLayout}
            label="选择虚拟机模板"
          >
            <Select {...getFieldProps('templatePath', { initialValue: templatePath,
              validate: [{
                rules: [
                  { required: true, message: '请选择虚拟机模板' },
                ],
                trigger: [ 'onChange' ],
              }] })} placeholder="请选择虚拟机模板" style={{ width: '100%' }}>
              <Select.Option value=""><span className="optionValueNull">请选择虚拟机模板</span></Select.Option>
              {
                template.map((item, i) => {
                  return (
                    <Select.Option value={item.path} key={i}>
                      <div className="vmTemplateDetail">
                        <Tooltip placement="right" title={item.path}>
                          <p className="path">{item.path}</p>
                        </Tooltip>
                        <p className="lowcase">客户机操作系统：{item.type}</p>
                        <p className="lowcase">虚拟机版本：{item.version}</p>
                        <p className="lowcase">CPU/内存：{item.cpuNumber + 'C'}/{diskFormat(item.memoryTotal)}</p>
                      </div>
                    </Select.Option>)
                })
              }
            </Select>
          </FormItem>
        </Row>
        <Row key="row5">
          <FormItem
            {...formItemLargeLayout}
            label="计算资源池"
          >
            <Select {...getFieldProps('resourcePoolPath', { initialValue: resourcePoolPath,
              validate: [{
                rules: [
                  { required: true, message: '请选择计算资源池' },
                ],
                trigger: [ 'onChange' ],
              }] })} placeholder="请选择计算资源池" style={{ width: '100%' }}>
              <Select.Option value=""><span className="optionValueNull">请选择计算资源池</span></Select.Option>
              {
                resourcePool.map((item, i) => {
                  return (<Select.Option key={i} value={item}>{item}</Select.Option>)
                })
              }
            </Select>
          </FormItem>
        </Row>
        <Row key="row6">
          <FormItem
            {...formItemLargeLayout}
            label="存储资源池"
          >
            <Select {...getFieldProps('datastorePath', { initialValue: datastorePath,
              validate: [{
                rules: [
                  { required: true, message: '请选择存储资源池' },
                ],
                trigger: [ 'onChange' ],
              }] })} placeholder="请选择存储资源池" style={{ width: '100%' }}>
              <Select.Option value=""><span className="optionValueNull">请选择存储资源池</span></Select.Option>
              {
                datastore.map((item, i) => {
                  return (<Select.Option key={i} value={item}>{item}</Select.Option>)
                })
              }
            </Select>
          </FormItem>
        </Row>
      </Form>
    )
  }
}
Form1 = Form.create()(Form1)

class Tab1Modal extends React.Component {
  constructor() {
    super()
    this.state = {
      currentIcon: '',
      checkExistProvider: false, // 查看已有[资源池配置状态] false没配过, true 配过
      checkExistStrategy: false, // 查看是否已经配过当前这个集群下的[策略配置状态]了 false没配过, true 配过
      beforecheckExist: true, // 是否在 check 之前
      currentStep: 0, // 0 第一步 1 第二步（保存）
      selDisabled: false,
      selectValue: '',
    }
  }
  clickIcon = e => {
    const obj = e.target.parentElement.attributes['data-name'] || e.target.attributes['data-name']
    if (!!e.target.className && e.target.className.indexOf('selectedBox') > -1) { return }
    if (!!e.target.parentElement.className && e.target.parentElement.className.indexOf('selectedBox') > -1) { return }
    if (disabledIconCon.indexOf(obj.value) > -1) { return }
    if (!!e.target.className && e.target.className.indexOf('Dis') > -1) { return }
    if (!!e.target.parentElement.className && e.target.parentElement.className.indexOf('Dis') > -1) { return }
    if (!this.checkCluster()) return
    this.getDataCenter(obj.value)
  }
  fun1 = () => {
    const _that = this
    if (!this.checkParams()) return
    this.props.closeTab1Modal(_that)
  }
  fun2 = () => {
    this.modalCancel()
  }
  checkParams = () => {
    return this.checkIaas() && this.checkCluster()
  }
  checkIaas = () => {
    let b = true
    if (!this.state.currentIcon) {
      notify.warn('请选择Iaas平台')
      b = false
    }
    return b
  }
  checkCluster = () => {
    let b = true
    if (!isEdit && !this.state.selectValue) {
      notify.warn('请选择容器集群')
      b = false
    }
    return b
  }
  nextStep = () => {
    // 切换逻辑
    form1Fun.props.form.validateFields((errors, values) => {
      if (errors) {
        console.log('Errors in form1!!!')
        return
      }
      this.setState({ currentStep: 1, form1Data: values })
    })
  }
  returnStep = () => {
    // 切换逻辑
    this.setState({ currentStep: 0 })
  }
  onSelChange = value => {
    // 先选集群 再点击iaas ICon
    this.setState({
      selectValue: value,
      currentIcon: '',
      beforecheckExist: true,
      checkExistProvider: false,
      checkExistStrategy: false,
      currentStep: 0,
      currDataCenter: '',
    })
  }
  formSubmit = () => {
    const form1Data = this.state.form1Data
    this.props.form.validateFields((errors, values) => {
      let b = true
      if (errors) {
        console.log('Errors in form!!!')
        // this.setState({
        //   currentStep: 0,
        // })
        b = false
      }
      if (!b) {
        return
      }
      // console.log('Submit!!!');
      // console.log(values);
      const temp1 = JSON.parse(JSON.stringify(values))
      const temp2 = JSON.parse(JSON.stringify(form1Data))
      const temp = Object.assign({}, temp1, temp2)
      temp.cluster = cluster ? cluster : this.state.selectValue
      temp.iaas = iaas ? iaas : this.state.currentIcon
      this.props.onOk(temp, () => {
        this.resetState(() => {
          updateTimer = null
          addTimer = null
        })
      })
    })
  }
  onDataCenterChange = value => {
    this.setState({
      currDataCenter: value,
    })
  }
  onInputNumChange = value => {
    // console.log(e.target.value);
  }
  resetState = _cb => {
    isGetParams = true // 是否获取接口数据
    disabledIconCon = [ 'aws', 'azure', 'ali' ] // 禁用的图标按钮集合
    isEdit = false
    datacenterList = [], templatePathList = {}, datastorePathList = {}, resourcePoolPathList = {}
    cluster = '', iaas = ''
    form1Fun
    isCreated = {}// 是否创建过策略的集群汇总
    this.setState({
      currentIcon: '',
      checkExistProvider: false, // 查看已有模块 false没配过, true 配过
      checkExistStrategy: false, // 查看是否已经配过当前这个集群下的策略了 false没配过, true 配过
      beforecheckExist: true, // 是否在 check 之前
      currentStep: 0, // 0 第一步 1 第二步（保存）
      selDisabled: false,
      selectValue: '',
    }, () => {
      setTimeout(() => {
        !!_cb && _cb()
      }, 2000)
    })
  }
  modalCancel = () => {
    this.props.onCancel()
    this.resetState(() => {
      updateTimer = null
      addTimer = null
    })
  }
  minBlur = e => {
    // console.log("minBlur", e.target.value)
  }
  minChange = value => {
    // console.log("minChange", value)
  }
  maxBlur = e => {
    // console.log("maxBlur", e.target.value)
  }
  maxChange = e => {
    // console.log("maxChange", value)
  }
  render() {
    const { clusterList, isModalFetching,
      getData, isGetFormData,
      resList, isResFetching } = this.props
    const { getFieldProps } = this.props.form
    let datacenter = '',
      datastorePath = '',
      targetPath = '',
      duration = '',
      email = '',
      max = '',
      min = '',
      name = '',
      removeAndDelete = '0',
      resourcePoolPath = '',
      templatePath = ''// 默认值 edit时存放行数据
    if (this.props.visible && isGetParams) {
      isGetParams = false
      this.getQueryData()
    }
    if (!this.props.visible) {
      isGetParams = true
    }
    if (this.props.isEdit && !!this.props.currentData) {
      isEdit = true, { datacenter, datastorePath, duration, email, max, min, name, removeAndDelete, resourcePoolPath, templatePath, targetPath,
        cluster, iaas,
      } = this.props.currentData// cluster, iaas 编辑时使用的 clusterId 和 Iaas
      if (!updateTimer && isModalFetching === false) {
        updateTimer = setTimeout(() => {
          this.getDataCenter(iaas)
        }, 200)
      }
    } else {
      isEdit = false
      if (!addTimer && isModalFetching === false) {
        addTimer = setTimeout(() => {
          this.resetState()
          firstAdd = null
        }, firstAdd || 200)
      }
      datacenterList = []; templatePathList = {}; datastorePathList = {}; resourcePoolPathList = {}
      cluster = ''; iaas = ''
      max = 10// 新增时 max 默认值
    }
    const options = clusterList ?
      clusterList.map((o, i, objs) => {
        isCreated[o.clusterid] = {
          ali: o.strategy.ali,
          aws: o.strategy.aws,
          azure: o.strategy.azure,
          vmware: o.strategy.vmware,
        }
        return <Select.Option key={i} value={o.clusterid}>{o.clustername}</Select.Option>
      }) : null
    !!options && options.unshift(<Select.Option key="-1" value=""><span className="optionValueNull">请选择容器集群</span></Select.Option>)
    const objDisabled = _.filter(clusterList, { clusterid: this.state.selectValue })[0]

    const iconClass1 = classNames({
      iconCon: true,
      iconvmware: true,
      selectedBox: iaas ? iaas === 'vmware' : this.state.currentIcon === 'vmware',
      iconConDis: iaas ? true : disabledIconCon.indexOf('vmware') > -1, // !!isCreated[this.state.selectValue] && isCreated[this.state.selectValue].vmware ? true :
    })
    const iconClass2 = classNames({
      iconCon: true,
      iconaws: true,
      selectedBox: iaas ? iaas === 'aws' : this.state.currentIcon === 'aws',
      iconConDis: iaas ? true : disabledIconCon.indexOf('aws') > -1,
    })
    const iconClass3 = classNames({
      iconCon: true,
      iconazure: true,
      selectedBox: iaas ? iaas === 'azure' : this.state.currentIcon === 'azure',
      iconConDis: iaas ? true : disabledIconCon.indexOf('azure') > -1,
    })
    const iconClass4 = classNames({
      iconCon: true,
      iconali: true,
      selectedBox: iaas ? iaas === 'ali' : this.state.currentIcon === 'ali',
      iconConDis: iaas ? true : disabledIconCon.indexOf('ali') > -1,
    })
    const footer = (() => {
      return (
        <div>
          <Button onClick={() => { !this.props.isModalFetching && !isResFetching && this.modalCancel() }}>取消</Button>
          {
            this.state.beforecheckExist ?
              null
              :
              this.state.currentStep === 0 ?
                (this.props.isResFetching || !this.state.checkExistProvider || (this.state.checkExistStrategy && isEdit === false)) ?
                  null
                  :
                  <Button type="primary" onClick={this.nextStep}>下一步</Button>
                :
                [
                  <Button type="primary" onClick={this.returnStep}>上一步</Button>,
                  <Button type="primary" onClick={this.formSubmit} loading={this.props.confirmLoading}>保存</Button>,
                ]
          }
        </div>
      )
    })()
    if (resList) {
      const j = 0
      datacenterList = []
      for (const i in resList) {
        datacenterList.push(i)
        const dt = resList[i]
        templatePathList[i] = dt.templatePath
        datastorePathList[i] = dt.datastores
        resourcePoolPathList[i] = dt.resourcePools
      }
    }
    const { currDataCenter } = this.state
    const template = templatePathList[currDataCenter] || []
    const datastore = datastorePathList[currDataCenter] || []
    const resourcePool = resourcePoolPathList[currDataCenter] || []
    return (
      <div>
        <Modal
          className="aotuScalerModal"
          visible={this.props.visible}
          title="弹性伸缩策略"
          width="550"
          footer={footer}
          maskClosable={false}
          confirmLoadin={this.props.confirmLoading}
          onClose={() => { !this.props.isModalFetching && !isResFetching && this.modalCancel() }}
        >
          {
            isModalFetching ?
              <div className="loadingBox">
                <Spin size="large"/>
              </div>
              :
              <div>
                <div className="panel noBottom">
                  <Row key="row2">
                    <FormItem
                      {...formItemLargeLayout}
                      label="容器集群"
                    >
                      <Select disabled={cluster ? true : this.state.selDisabled} value={cluster ? cluster : this.state.selectValue}
                        onChange={value => { this.onSelChange(value) }}
                        placeholder="请选择容器集群" style={{ width: '100%' }}>
                        {options}
                      </Select>
                    </FormItem>
                  </Row>
                </div>
                <div className="bottom-line"></div>
                <div className="topIconContainer">
                  <div className={iconClass1} data-name="vmware" onClick={this.clickIcon}>
                    <div className="icon"></div>
                    <div className="name">vmware</div>
                    <svg className="commonSelectedImg">
                      <use xlinkHref="#appcreatemodelselect" />
                    </svg>
                    <i className="fa fa-check"></i>
                  </div>
                  <div className={iconClass2} data-name="aws" onClick={this.clickIcon}>
                    <div className="icon"></div>
                    <div className="name">aws</div>
                    <svg className="commonSelectedImg">
                      <use xlinkHref="#appcreatemodelselect" />
                    </svg>
                    <i className="fa fa-check"></i>
                  </div>
                  <div className={iconClass3} data-name="azure" onClick={this.clickIcon}>
                    <div className="icon"></div>
                    <div className="name">azure</div>
                    <svg className="commonSelectedImg">
                      <use xlinkHref="#appcreatemodelselect" />
                    </svg>
                    <i className="fa fa-check"></i>
                  </div>
                  <div className={iconClass4} data-name="ali" onClick={this.clickIcon}>
                    <div className="icon"></div>
                    <div className="name">aliyun</div>
                    <svg className="commonSelectedImg">
                      <use xlinkHref="#appcreatemodelselect" />
                    </svg>
                    <i className="fa fa-check"></i>
                  </div>
                  <div style={{ clear: 'both' }}></div>
                </div>
                {
                  this.state.beforecheckExist ?
                    null
                    :
                    this.state.checkExistProvider ?
                      this.state.checkExistStrategy && isEdit === false ?
                        <div className="btnConatainer">
                          <Button type="primary" onClick={this.fun2}>已存在策略, 请在列表选择相应策略编辑</Button>
                        </div>
                        :
                        isResFetching ?
                          <div className="loadingBox">
                            <Spin size="large"/>
                          </div>
                          :
                          <div>
                            <div className="bottom-line"></div>
                            <div className="stepContainer">
                              <Steps size="small" current={this.state.currentStep} status="process">
                                <Steps.Step key="0" title="节点自动配置" description="" />
                                <Steps.Step key="1" title={
                                  (() => {
                                    return (
                                      [
                                        <span>集群伸缩方案</span>,
                                        <Tooltip placement="right" title={(() => {
                                          return (
                                            [
                                              <div>平台将在以下情况，进行节点伸缩，调整集群大小：</div>,
                                              <div>1、增加节点：由于资源不足，无法在集群中正常调度服务实例</div>,
                                              <div>2、减少节点：集群中的某些节点在很长一段时间未被充分使用</div>,
                                            ]
                                          )
                                        })()}>
                                          <Icon style={{ marginLeft: '5px', color: '#ccc' }} type="question-circle-o" />
                                        </Tooltip>,
                                      ]
                                    )
                                  })()
                                } description="" />
                              </Steps>
                              <div className="bottom-line" style={{ bottom: '-10px' }}></div>
                            </div>
                            <div className="formContainer">
                              <Form1
                                allData={this.props.allData}
                                currentData={this.props.currentData}
                                datacenter={datacenter}
                                datastorePath={datastorePath}
                                resourcePoolPath={resourcePoolPath}
                                templatePath={templatePath}
                                targetPath={targetPath}
                                name={name}
                                template={template}
                                datastore={datastore}
                                resourcePool={resourcePool}
                                currentStep={this.state.currentStep}
                                onDataCenterChange={this.onDataCenterChange}
                              />
                              <Form className={'step2 ' + (this.state.currentStep === 0 ? 'hide' : '')} horizontal>
                                <div>
                                  <div className="panel">
                                    <Row className="jiedianContainer" key="row7">
                                      <div className="ant-col-6 ant-form-item-label"><label>伸缩节点数量</label></div>
                                      <div className="ant-col-14">
                                        {/* <div className="min">
                                        <div className="name">
                                          <Tooltip placement="right" title="注：最小实例数需大于或等于手动添加的实例总数">
                                            <Icon style={{marginLeft: "5px", cursor: "pointer"}} type="info-circle-o" />
                                          </Tooltip>
                                        </div>
                                        <div className="mmItem">*/}
                                        <FormItem className="unitWapper" labelCol={{ span: 24 }} wrapperCol={{ span: 18 }}
                                          label="最少保留"
                                        >
                                          <InputNumber min={0} max={parseInt(this.props.form.getFieldValue('max'))} {...getFieldProps('min', { initialValue: min,
                                            validate: [{
                                              rules: [
                                                { required: true, message: '请输入最少保留数' },
                                              ],
                                            }],
                                            onChange: this.minChange,
                                            onBlur: this.minBlur,
                                          })} className="item" placeholder="1" />
                                        </FormItem>
                                        {/* </div>
                                      </div>*/}
                                        <span className="unit count">个</span>
                                        <FormItem className="unitWapper" labelCol={{ span: 24 }} wrapperCol={{ span: 18 }}
                                          label="最大扩展"
                                        >
                                          {/* <div className="max">
                                        <div className="name">最大节点数</div>
                                        <div className="mmItem">*/}
                                          <InputNumber min={parseInt(this.props.form.getFieldValue('min'))} {...getFieldProps('max', { initialValue: max,
                                            validate: [{
                                              rules: [
                                                { required: true, message: '请输入最大扩展数' },
                                              ],
                                            }],
                                            onChange: this.maxChange,
                                            onBlur: this.maxBlur })} className="item" placeholder="1" />
                                          {/* </div>
                                      </div>*/}
                                        </FormItem>
                                        <span className="unit count countright">个</span>
                                      </div>
                                      <Row className="rowtext" key="rowtext">
                                        <Col span={6}>
                                        </Col>
                                        <Col span={16}>
                                          <span>
                                            <i className="tips_icon anticon anticon-exclamation-circle-o"></i>
                                        注：这里的数量仅计算自动伸缩的节点，手动添加节点除外
                                          </span>
                                        </Col>
                                      </Row>
                                      {/* <FormItem
                                    {...formItemLargeLayout}
                                    label={ (() => {
                                      return (
                                        ["节点数量",
                                        <Tooltip placement="right" title="注：最小实例数需大于或等于手动添加的实例总数">
                                          <Icon style={{margin: "3px 0 0 3px", cursor: "pointer"}} type="info-circle-o" />
                                        </Tooltip>]
                                      )
                                    })()
                                    }
                                  >
                                    <Input {...getFieldProps('xxx', { initialValue: email ,
                                      validate: [{
                                        rules: [
                                          { required: true, message: '请输入节点数量' },
                                        ],
                                        trigger: ['onBlur', 'onChange'],
                                      }]
                                    },
                                    )} placeholder="请输入节点数量" />
                                    <span className="unit">个</span>
                                  </FormItem>*/}
                                    </Row>
                                    {/* <Row key="row8">
                                  <FormItem
                                    {...formItemLargeLayout}
                                    label="节点伸缩"
                                  >
                                  <Radio.Group {...getFieldProps('datastorePath', { initialValue: '' })}>
                                      <Radio key="a" value={1}>通过阈值触发</Radio>
                                      <Radio key="b" value={2}>定时触发</Radio>
                                    </Radio.Group>
                                  </FormItem>
                                </Row> */}
                                    <Row key="row9">
                                      <FormItem
                                        {...formItemLargeLayout}
                                        label="减少节点"
                                      >
                                        <Radio.Group {...getFieldProps('removeAndDelete', { initialValue: removeAndDelete,
                                          validate: [{
                                            rules: [
                                              { required: true, message: '请选择减少节点方式' },
                                            ],
                                            trigger: [ 'onClick' ],
                                          }] })}>
                                          <Radio key="a" value="0">仅移出集群</Radio>
                                          <Radio key="b" value="1">移出集群并删除节点</Radio>
                                        </Radio.Group>
                                      </FormItem>
                                    </Row>
                                  </div>
                                  <div className="bottom-line"></div>
                                  <div className="panel noBottom">
                                    <Row key="row10">
                                      <FormItem
                                        {...formItemLargeLayout}
                                        label="伸缩通知"
                                      >
                                        <Input {...getFieldProps('email', { initialValue: email,
                                          validate: [{
                                            rules: [
                                              { type: 'email', message: '请输入正确的邮箱地址' },
                                            ],
                                            trigger: [ 'onBlur', 'onChange' ],
                                          }],
                                        }
                                        )} placeholder="通知邮件为空，将不发送通知" />
                                      </FormItem>
                                    </Row>
                                    <Row key="row11">
                                      <FormItem
                                        {...formItemLargeLayout}
                                        label="策略冷却时间"
                                      >
                                        <InputNumber {...getFieldProps('duration', { initialValue: duration,
                                          validate: [{
                                            rules: [
                                              { required: true, message: '请输入策略冷却时间' },
                                            ],
                                            trigger: [ 'onBlur', 'onChange' ],
                                          }] })} style={{ width: '90px' }} placeholder="120" min={1} max={1000} />
                                        <span className="unit">秒</span>
                                        <span className="hint">策略连续两次触发的最小时间</span>
                                      </FormItem>
                                    </Row>
                                  </div>
                                </div>
                              </Form>
                            </div>
                          </div>
                      :
                      isEdit ?
                        <div className="descContainer">资源池已删除，当前策略依然可用<br />若需编辑，请重新配置对应资源池，或重新创建策略</div>
                        :
                        <div className="btnConatainer">
                          <Button type="primary" onClick={this.fun1}>前往配置 vSphere</Button>
                        </div>
                }
              </div>
          }
        </Modal>
      </div>
    )
  }
  componentDidMount() {
    // 接收参数
    // this.getQueryData();
  }
  getDataCenter = value => {
    this.setState({ currentIcon: value, beforecheckExist: false }, () => {
      const filObj = _.filter(this.props.clusterList, { clusterid: cluster ? cluster : this.state.selectValue })[0]
      const b1 = filObj.provider[this.state.currentIcon]
      const b2 = filObj.strategy[this.state.currentIcon]
      this.setState({ checkExistProvider: b1, checkExistStrategy: b2 }, () => {
        if ((b1 && !b2) || isEdit) {
          this.props.getResList({
            cluster: cluster ? cluster : this.state.selectValue,
            type: iaas ? iaas : this.state.currentIcon,
          }, {
            success: {
              func: res => {
                if (isEdit) this.setState({ currDataCenter: this.props.currentData.datacenter })
              },
              isAsync: true,
            },
            failed: {
              func: res => {
                notify.warn(res.message.message || res.message)
              },
              isAsync: true,
            },
          })
        }
      })
    })
  }
  getQueryData() {
    const { getAutoScalerClusterList } = this.props
    getAutoScalerClusterList()
  }
}

const mapStateToProps = state => {
  const { appAutoScaler } = state
  const { getAutoScalerClusterList, getResList } = appAutoScaler
  const { clusterList, isModalFetching } = getAutoScalerClusterList || { clusterList: [], isModalFetching: false }
  const { resList, isResFetching } = getResList || { resList: [], isResFetching: false }
  return {
    clusterList,
    isModalFetching,
    resList,
    isResFetching,
  }
}

Tab1Modal = Form.create()(Tab1Modal)

export default connect(mapStateToProps, {
  getAutoScalerClusterList: autoScalerActions.getAutoScalerClusterList,
  getResList: autoScalerActions.getAutoScalerResList,
  addApp: autoScalerActions.createApp,
  updateApp: autoScalerActions.updateApp,
})(Tab1Modal)
