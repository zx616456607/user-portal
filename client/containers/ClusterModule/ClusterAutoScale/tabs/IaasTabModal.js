/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * IaasTabModal tabModal1
 *
 * v0.1 - 2018-04-08
 * @author rensiwei
 */
import React from 'react'
import { Modal, Button, Select, Input, Steps, Icon, Tooltip, Radio, Row, Col, Form, Spin, InputNumber } from 'antd'
import '../style/tabModal.less'
import classNames from 'classnames'
import filter from 'lodash/filter'
import * as autoScalerActions from '../../../../actions/clusterAutoScaler'
import { connect } from 'react-redux'
import NotificationHandler from '../../../../../src/components/Notification'
import TenxIcon from '@tenx-ui/icon/es/_old'

const notify = new NotificationHandler()
const FormItem = Form.Item
const disabledIconCon = [ 'aws', 'azure', 'ali' ] // 禁用的图标按钮集合
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
const Form1 = Form.create()(class Form1 extends React.Component {
  roleNameChange = e => {
    e.target.value = e.target.value.substr(0, 100)
  }
  checkName = (rule, value, callback) => {
    const { isEdit, allData, currentData } = this.props
    if (!isEdit) {
      filter(allData, { name: value })[0] ? callback(new Error('策略名称重复')) : callback()
      return
    }
    if (value !== currentData.name) { // 修改时改了名字
      filter(allData, { name: value })[0] ? callback(new Error('策略名称重复')) : callback()
      return
    }
    callback()

  }
  render() {
    const { form, currentStep, onDataCenterChange, defaultValues, currentIcon } = this.props
    const { getFieldProps, setFieldsValue } = form
    const { name } = defaultValues
    // vmware
    // 第一行值 第二行资源列表
    const { datacenter, datastorePath, resourcePoolPath, templatePath, targetPath,
      template, datastore, resourcePool, datacenterList } = defaultValues
    // openstack
    // 第一行值 第二行资源列表
    const { // domainName, projectName,
      image, loginPass, flavor, networkName, networkId, zoneName, secgroupsValue,
      networks, flavors, images, zones, secgroups,
    } = defaultValues

    return (
      <Form horizontal className={'step1 panel noBottom ' + (currentStep === 0 ? '' : 'hide') } >
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
                trigger: [ 'onChange' ],
              }],
              onChange: this.roleNameChange })} placeholder="支持 100 字以内的中英文" />
          </FormItem>
        </Row>
        <div>
          {
            currentIcon === 'vmware' && [
              <Row key="row3">
                <FormItem
                  {...formItemLargeLayout}
                  label="数据中心"
                >
                  <Select {...getFieldProps('datacenter', {
                    initialValue: datacenter || undefined,
                    validate: [{
                      rules: [
                        { required: true, message: '请选择数据中心' },
                      ],
                      trigger: [ 'onChange' ],
                    }],
                    onChange: onDataCenterChange,
                  })} placeholder="请选择数据中心" className="formItemWidth">
                    {/* <Select.Option value="">
                          <span className="optionValueNull">请选择数据中心</span></Select.Option> */}
                    {
                      datacenterList.map((item, i) => {
                        return <Select.Option key={i} value={item}>{item}</Select.Option>
                      })
                    }
                  </Select>
                </FormItem>
              </Row>,
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
                      trigger: [ 'onChange' ],
                    }] })}
                  placeholder="如 /paas/vms/autoscaling-group" />
                </FormItem>
              </Row>,
              <Row key="row4">
                <FormItem
                  {...formItemLargeLayout}
                  label="选择虚拟机模板"
                >
                  <Select {...getFieldProps('templatePath', {
                    initialValue: templatePath || undefined,
                    validate: [{
                      rules: [
                        { required: true, message: '请选择虚拟机模板' },
                      ],
                      trigger: [ 'onChange' ],
                    }] })} placeholder="请选择虚拟机模板" className="formItemWidth">
                    {/* <Select.Option value="">
                          <span className="optionValueNull">请选择虚拟机模板</span></Select.Option> */}
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
              </Row>,
              <Row key="row5">
                <FormItem
                  {...formItemLargeLayout}
                  label="计算资源池"
                >
                  <Select {...getFieldProps('resourcePoolPath', {
                    initialValue: resourcePoolPath || undefined,
                    validate: [{
                      rules: [
                        { required: true, message: '请选择计算资源池' },
                      ],
                      trigger: [ 'onChange' ],
                    }] })} placeholder="请选择计算资源池" className="formItemWidth">
                    {/* <Select.Option value="">
                          <span className="optionValueNull">请选择计算资源池</span></Select.Option> */}
                    {
                      resourcePool.map((item, i) => {
                        return (<Select.Option key={i} value={item}>{item}</Select.Option>)
                      })
                    }
                  </Select>
                </FormItem>
              </Row>,
              <Row key="row6">
                <FormItem
                  {...formItemLargeLayout}
                  label="存储资源池"
                >
                  <Select {...getFieldProps('datastorePath', {
                    initialValue: datastorePath || undefined,
                    validate: [{
                      rules: [
                        { required: true, message: '请选择存储资源池' },
                      ],
                      trigger: [ 'onChange' ],
                    }] })} placeholder="请选择存储资源池" className="formItemWidth">
                    {/* <Select.Option value="">
                          <span className="optionValueNull">请选择存储资源池</span></Select.Option> */}
                    {
                      datastore.map((item, i) => {
                        return (<Select.Option key={i} value={item}>{item}</Select.Option>)
                      })
                    }
                  </Select>
                </FormItem>
              </Row>,
            ]
          }
        </div>
        {
          currentIcon === 'openstack' && [
            // <Row key="row3">
            //   <FormItem
            //     {...formItemLargeLayout}
            //     label="所属区域"
            //   >
            //     <Select {...getFieldProps('domainName', {
            //       initialValue: domainName || undefined,
            //       validate: [{
            //         rules: [
            //           { required: true, message: '请选择所属区域' },
            //         ],
            //         trigger: [ 'onChange' ],
            //       }],
            //       onChange: onDataCenterChange,
            //     })} placeholder="请选择所属区域" className="formItemWidth">
            //       {
            //         datacenterList.map((item, i) => {
            //           return <Select.Option key={i} value={item}>{item}</Select.Option>
            //         })
            //       }
            //     </Select>
            //   </FormItem>
            // </Row>,
            // <Row key="row4">
            //   <FormItem
            //     {...formItemLargeLayout}
            //     label="项目"
            //   >
            //     <Select {...getFieldProps('projectName', {
            //       initialValue: projectName || undefined,
            //       validate: [{
            //         rules: [
            //           { required: true, message: '请选择项目' },
            //         ],
            //         trigger: [ 'onChange' ],
            //       }] })} placeholder="请选择项目" className="formItemWidth">
            //       {
            //         template.map((item, i) => {
            //           return (
            //             <Select.Option value={item.path} key={i}>
            //               {item.path}
            //             </Select.Option>)
            //         })
            //       }
            //     </Select>
            //   </FormItem>
            // </Row>,
            <Row key="row5pre">
              <FormItem
                {...formItemLargeLayout}
                label="可用域"
              >
                <Select {...getFieldProps('zoneName', {
                  initialValue: zoneName || undefined,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择可用域' },
                    ],
                    trigger: [ 'onChange' ],
                  }] })} placeholder="请选择可用域" className="formItemWidth">
                  {
                    zones.map(item => {
                      return (<Select.Option key={item.zoneName}>{item.zoneName}</Select.Option>)
                    })
                  }
                </Select>
              </FormItem>
            </Row>,
            <Row key="row5">
              <FormItem
                {...formItemLargeLayout}
                label="镜像"
              >
                <Select {...getFieldProps('image', {
                  initialValue: image || undefined,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择镜像' },
                    ],
                    trigger: [ 'onChange' ],
                  }] })} placeholder="请选择镜像" className="formItemWidth">
                  {
                    images.map(item => {
                      return (<Select.Option key={item.id}>{item.name}</Select.Option>)
                    })
                  }
                </Select>
              </FormItem>
            </Row>,
            <Row key="row33">
              <FormItem
                {...formItemLargeLayout}
                label={
                  <span>
                    镜像初始密码
                    <Tooltip placement="top" title="填写密码应与镜像中的初始密码一致, 若不一致将配置不成功">
                      <Icon style={{ marginLeft: '5px', cursor: 'pointer' }} type="info-circle-o" />
                    </Tooltip>
                  </span>
                }
              >
                <Input {...getFieldProps('loginPass', { initialValue: loginPass,
                  validate: [{
                    rules: [
                      { required: true, message: '请输入镜像初始密码' },
                    ],
                    trigger: [ 'onChange' ],
                  }] })}
                placeholder="请输入镜像初始密码" />
              </FormItem>
            </Row>,
            <Row key="row6">
              <FormItem
                {...formItemLargeLayout}
                label="配置规格 (类型) "
              >
                <Select {...getFieldProps('flavor', {
                  initialValue: flavor || undefined,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择配置规格' },
                    ],
                    trigger: [ 'onChange' ],
                  }] })} placeholder="请选择配置规格" className="formItemWidth">
                  {
                    flavors.map(item => {
                      return (<Select.Option key={item.id}>{item.name}</Select.Option>)
                    })
                  }
                </Select>
              </FormItem>
            </Row>,
            <Row key="row7">
              <Input type="hidden" {...getFieldProps('networkId', {
                initialValue: networkId || undefined,
              })
              } />
              <FormItem
                {...formItemLargeLayout}
                label="网络"
              >
                <Select {...getFieldProps('networkName', {
                  initialValue: networkName || undefined,
                  onChange: name => {
                    setFieldsValue({
                      networkId: filter(networks, { name })[0].id,
                    })
                  },
                  validate: [{
                    rules: [
                      { required: true, message: '请选择网络' },
                    ],
                    trigger: [ 'onChange' ],
                  }] })} placeholder="请选择网络" className="formItemWidth">
                  {
                    networks.map(item => {
                      return (<Select.Option key={item.name}>{item.name}</Select.Option>)
                    })
                  }
                </Select>
              </FormItem>
            </Row>,
            <Row key="row8">
              <FormItem
                {...formItemLargeLayout}
                label="安全组"
              >
                <Select {...getFieldProps('secgroups', {
                  initialValue: secgroupsValue || undefined,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择安全组' },
                    ],
                    trigger: [ 'onChange' ],
                  }] })} placeholder="请选择安全组" className="formItemWidth">
                  {
                    secgroups.map(item => {
                      return (<Select.Option key={item}>{item}</Select.Option>)
                    })
                  }
                </Select>
              </FormItem>
            </Row>,
          ]
        }
      </Form>
    )
  }
})
const mapStateToProps = state => {
  const { appAutoScaler } = state
  const { getAutoScalerClusterList, getResList } = appAutoScaler
  const { clusterList, isModalFetching } =
   getAutoScalerClusterList || { clusterList: [], isModalFetching: false }
  const { resList, isResFetching } = getResList || { resList: [], isResFetching: false }
  return {
    clusterList,
    isModalFetching,
    resList,
    isResFetching,
  }
}
export default connect(mapStateToProps, {
  getAutoScalerClusterList: autoScalerActions.getAutoScalerClusterList,
  getResList: autoScalerActions.getAutoScalerResList,
  addApp: autoScalerActions.createApp,
  updateApp: autoScalerActions.updateApp,
  getClusterMaxNodes: autoScalerActions.getClusterMaxNodes,
})(
  Form.create()(class Tab1Modal extends React.Component {
    constructor(props) {
      super(props)
      const { currentData, isEdit } = this.props
      this.state = {
        currentIcon: currentData && currentData.iaas || '',
        checkExistProvider: false, // 查看已有[资源池配置状态] false没配过, true 配过
        checkExistStrategy: false, // 查看是否已经配过当前这个集群下的[策略配置状态]了 false没配过, true 配过
        beforecheckExist: true, // 是否在 check 之前
        currentStep: 0, // 0 第一步 1 第二步（保存）
        selDisabled: isEdit,
        selectValue: currentData && currentData.cluster || undefined,
        defaultMax: 100,
      }
    }
    componentDidMount() {
      this.loadData(() => {
        const { isEdit } = this.props
        if (isEdit) {
          this.getDataCenter()
          this.getDefaultMax()
        }
      })
    }
    clickIcon = value => {
      const { currentIcon, isEdit } = this.state
      if (isEdit ||
        currentIcon === value ||
        disabledIconCon.indexOf(value) > -1) return
      this.setState({
        currentIcon: value,
      }, () => {
        const { selectValue } = this.state
        selectValue && this.getDataCenter()
      })
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
      const { isEdit } = this.props
      const { selectValue } = this.state
      if (!isEdit && !selectValue) {
        notify.warn('请选择容器集群')
        b = false
      }
      return b
    }
    nextStep = () => {
      // 切换逻辑
      let arr = []
      const { currentIcon } = this.state
      if (currentIcon === 'vmware') {
        arr = [ 'name', 'datacenter', 'datastorePath', 'resourcePoolPath',
          'templatePath', 'targetPath' ]
      } else if (currentIcon === 'openstack') {
        arr = [ 'name', 'image', 'zoneName', 'secgroups', 'loginPass', 'flavor', 'networkName', 'networkId' ] // 'domainName', 'projectName',
      }
      this.form1Rele.validateFields(arr, (errors, values) => {
        if (errors) {
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
        // currentIcon: '',
        beforecheckExist: true,
        checkExistProvider: false,
        checkExistStrategy: false,
        currentStep: 0,
        currDataCenter: '',
      }, () => {
        const { currentIcon } = this.state
        currentIcon && this.getDataCenter()
        this.getDefaultMax()
      })
    }
    getDefaultMax = () => {
      const { getClusterMaxNodes } = this.props
      const { selectValue } = this.state
      // todo 获取最大扩展数 接口没提供
      false && selectValue && getClusterMaxNodes({
        cluster: selectValue,
      }, {
        success: {
          func: res => {
            this.setState({
              defaultMax: res.data || 100,
            })
          },
          isAsync: true,
        },
      })
    }
    formSubmit = () => {
      const { form, onOk } = this.props
      const { form1Data, selectValue, currentIcon } = this.state
      form.validateFields((errors, values) => {
        let b = true
        if (errors) {
          // this.setState({
          //   currentStep: 0,
          // })
          b = false
        }
        if (!b) {
          return
        }
        const temp1 = JSON.parse(JSON.stringify(values))
        const temp2 = JSON.parse(JSON.stringify(form1Data))
        const temp = Object.assign({}, temp1, temp2)
        temp.cluster = selectValue
        temp.iaas = currentIcon
        onOk(temp)
      })
    }
    onDataCenterChange = value => {
      this.setState({
        currDataCenter: value,
      })
    }
    resetState = _cb => {
      isCreated = {}// 是否创建过策略的集群汇总
      this.setState({
        currentIcon: '',
        checkExistProvider: false, // 查看已有模块 false没配过, true 配过
        checkExistStrategy: false, // 查看是否已经配过当前这个集群下的策略了 false没配过, true 配过
        beforecheckExist: true, // 是否在 check 之前
        currentStep: 0, // 0 第一步 1 第二步（保存）
        selectValue: undefined,
      }, () => {
        setTimeout(() => {
          !!_cb && _cb()
        }, 2000)
      })
    }
    modalCancel = () => {
      this.props.onCancel()
      this.resetState()
    }
    getDataCenter = () => {
      this.setState({ beforecheckExist: false }, () => {
        const { currentIcon, selectValue } = this.state
        const filObj =
          filter(this.props.clusterList,
            { clusterid: selectValue })[0]
        if (!filObj) return
        const b1 = filObj.provider[currentIcon]
        let b2 = false
        for (const i in filObj.strategy) {
          if (filObj.strategy[i] === true) {
            b2 = true
          }
        }
        this.setState({ checkExistProvider: b1, checkExistStrategy: b2 }, () => {
          const { isEdit, currentData, getResList } = this.props
          if ((b1 && !b2) || isEdit) {
            getResList({
              cluster: selectValue,
              type: currentIcon,
            }, {
              success: {
                func: () => {
                  if (isEdit) this.setState({ currDataCenter: currentData.datacenter })
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
    loadData = cb => {
      const { getAutoScalerClusterList } = this.props
      getAutoScalerClusterList({}, {
        finally: {
          func: () => { cb && cb() },
          isAsync: true,
        },
      })
    }
    checkMax = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入最大扩展数'))
      }
      const { defaultMax } = this.state
      if (value > defaultMax) {
        notify.warn('最大扩展书不能大于 "单集群最大节点数 - 已手动添加的节点个数"')
        return callback(new Error('最大扩展数输入有误'))
      }
      callback()
    }
    render() {
      const { clusterList, isModalFetching, isEdit, form, visible, allData,
        resList, isResFetching, currentData, confirmLoading } = this.props
      const { selDisabled, selectValue, currentIcon, currentStep, defaultMax,
        beforecheckExist, checkExistProvider, checkExistStrategy } = this.state
      const { getFieldProps } = form
      let templatePathList = {},
        datastorePathList = {},
        resourcePoolPathList = {}
      let networks = [],
        flavors = [],
        images = [],
        zones = [],
        secgroups = []
      const datacenterList = []

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
      if (isEdit && !!currentData) {
        datacenter = currentData.datacenter
        datastorePath = currentData.datastorePath
        duration = currentData.duration
        email = currentData.email
        max = currentData.max
        min = currentData.min
        name = currentData.name
        removeAndDelete = currentData.removeAndDelete
        resourcePoolPath = currentData.resourcePoolPath
        templatePath = currentData.templatePath
        targetPath = currentData.targetPath
      } else {
        templatePathList = {}
        datastorePathList = {}
        resourcePoolPathList = {}
        max = 10// 新增时 max 默认值
      }
      const options = clusterList && clusterList.length && clusterList.map((o, i) => {
        isCreated[o.clusterid] = {
          ali: o.strategy.ali,
          aws: o.strategy.aws,
          azure: o.strategy.azure,
          vmware: o.strategy.vmware,
        }
        return <Select.Option key={i} value={o.clusterid}>{o.clustername}</Select.Option>
      })
      // !!options && options.unshift(<Select.Option key="-1" value=""><span className="optionValueNull">请选择容器集群</span></Select.Option>)

      const iconClass1 = classNames({
        iconCon: true,
        iconvmware: true,
        selectedBox: currentIcon === 'vmware',
        iconConDis: isEdit || disabledIconCon.indexOf('vmware') > -1, // !!isCreated[this.state.selectValue] && isCreated[this.state.selectValue].vmware ? true :
      })

      const iconClassOS = classNames({
        iconCon: true,
        iconopenstack: true,
        selectedBox: currentIcon === 'openstack',
        iconConDis: isEdit || disabledIconCon.indexOf('openstack') > -1,
      })

      const iconClass2 = classNames({
        iconCon: true,
        iconaws: true,
        selectedBox: currentIcon === 'aws',
        iconConDis: isEdit || disabledIconCon.indexOf('aws') > -1,
      })
      const iconClass3 = classNames({
        iconCon: true,
        iconazure: true,
        selectedBox: currentIcon === 'azure',
        iconConDis: isEdit || disabledIconCon.indexOf('azure') > -1,
      })
      const iconClass4 = classNames({
        iconCon: true,
        iconali: true,
        selectedBox: currentIcon === 'ali',
        iconConDis: isEdit || disabledIconCon.indexOf('ali') > -1,
      })
      const footer = (() => {
        return (
          <div>
            <Button
              onClick={this.modalCancel}
            >
              取消
            </Button>
            {
              (() => {
                let rele
                if (beforecheckExist) {
                  rele = null
                } else {
                  if (currentStep === 0) {
                    if (isResFetching
                        || !checkExistProvider
                        || (checkExistStrategy && isEdit === false)) {
                      rele = null
                    } else {
                      rele = <Button type="primary" onClick={this.nextStep}>下一步</Button>
                    }
                  } else {
                    rele = [
                      <Button type="primary" onClick={this.returnStep}>上一步</Button>,
                      <Button type="primary" onClick={this.formSubmit} loading={confirmLoading}>保存</Button>,
                    ]
                  }
                  return rele
                }
              })()
            }
          </div>
        )
      })()
      if (resList) {
        if (currentIcon === 'vmware') {
          for (const i in resList) {
            datacenterList.push(i)
            const dt = resList[i]
            templatePathList[i] = dt.templatePath
            datastorePathList[i] = dt.datastores
            resourcePoolPathList[i] = dt.resourcePools
          }
        }
        if (currentIcon === 'openstack') {
          networks = resList.networks || []
          flavors = resList.flavors || []
          images = resList.images || []
          zones = resList.zones || []
          secgroups = resList.secgroups || []
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
            visible={visible}
            title="弹性伸缩策略"
            width="650"
            footer={footer}
            maskClosable={false}
            confirmLoading={confirmLoading}
            onClose={() => { this.modalCancel() }}
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
                        <Select
                          disabled={selDisabled}
                          value={selectValue}
                          onChange={value => { this.onSelChange(value) }}
                          placeholder="请选择容器集群" style={{ width: '100%' }}>
                          {options}
                        </Select>
                      </FormItem>
                    </Row>
                  </div>
                  <div className="bottom-line"></div>
                  <div className="topIconContainer">
                    <div className={iconClass1} data-name="vmware" onClick={() => { this.clickIcon('vmware') }}>
                      <div className="icon"></div>
                      <div className="name">vmware</div>
                      <svg className="commonSelectedImg">
                        {/* @#selected*/}
                        <use xlinkHref="#appcreatemodelselect" />
                      </svg>
                      <i className="fa fa-check"></i>
                    </div>
                    <div className={iconClassOS} data-name="openstack" onClick={() => { this.clickIcon('openstack') }}>
                      <div className="icon">
                        <TenxIcon style={{ color: '#da1a32' }} type="openstack" />
                      </div>
                      <div className="name">OpenStack</div>
                      <svg className="commonSelectedImg">
                        {/* @#selected*/}
                        <use xlinkHref="#appcreatemodelselect" />
                      </svg>
                      <i className="fa fa-check"></i>
                    </div>
                    <div className={iconClass2} data-name="aws" onClick={() => { this.clickIcon('aws') }}>
                      <div className="icon"></div>
                      <div className="name">aws</div>
                      <svg className="commonSelectedImg">
                        {/* @#selected*/}
                        <use xlinkHref="#appcreatemodelselect" />
                      </svg>
                      <i className="fa fa-check"></i>
                    </div>
                    <div className={iconClass3} data-name="azure" onClick={() => { this.clickIcon('azure') }}>
                      <div className="icon"></div>
                      <div className="name">azure</div>
                      <svg className="commonSelectedImg">
                        {/* @#selected*/}
                        <use xlinkHref="#appcreatemodelselect" />
                      </svg>
                      <i className="fa fa-check"></i>
                    </div>
                    <div className={iconClass4} data-name="ali" onClick={() => { this.clickIcon('ali') }}>
                      <div className="icon"></div>
                      <div className="name">aliyun</div>
                      <svg className="commonSelectedImg">
                        {/* @#selected*/}
                        <use xlinkHref="#appcreatemodelselect" />
                      </svg>
                      <i className="fa fa-check"></i>
                    </div>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                  {
                    (() => {
                      let rele
                      if (beforecheckExist) {
                        rele = null
                      } else {
                        if (checkExistProvider) {
                          if (checkExistStrategy && isEdit === false) {
                            rele = <div className="btnConatainer">
                              <Button type="primary" onClick={this.fun2}>集群已存在策略, 请在列表选择相应策略编辑</Button>
                              <Tooltip title="每个集群仅能添加一个伸缩策略">
                                <Icon style={{ marginLeft: 5 }} type="question-circle-o" />
                              </Tooltip>
                            </div>
                          } else {
                            if (isResFetching) {
                              rele = <div className="loadingBox">
                                <Spin size="large"/>
                              </div>
                            } else {
                              rele = <div>
                                <div className="bottom-line"></div>
                                <div className="stepContainer">
                                  <Steps size="small" current={this.state.currentStep} status="process">
                                    <Steps.Step key="0" title="节点自动配置" description="" />
                                    <Steps.Step key="1" title={
                                      (() => {
                                        rele = (
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
                                        return rele
                                      })()
                                    } description="" />
                                  </Steps>
                                  <div className="bottom-line" style={{ bottom: '-10px' }}></div>
                                </div>
                                <div className="formContainer">
                                  {
                                    (() => {
                                      let defaultValues = {}
                                      if (currentIcon === 'vmware') {
                                        defaultValues = {
                                          datacenter,
                                          datastorePath,
                                          resourcePoolPath,
                                          templatePath,
                                          targetPath,
                                          name,
                                          template,
                                          datastore,
                                          resourcePool,
                                          datacenterList,
                                        }
                                      } else if (currentIcon === 'openstack') {
                                        defaultValues = {
                                          // domainName: currentData.domainName || '',
                                          // projectName: currentData.projectName || '',
                                          image: currentData.image || '',
                                          zoneName: currentData.zoneName || '',
                                          loginPass: currentData.loginPass || '',
                                          flavor: currentData.flavor || '',
                                          networkName: currentData.networkName || '',
                                          networkId: currentData.networkId || '',
                                          secgroupsValue: currentData.secgroups || '',
                                          name,
                                          networks,
                                          flavors,
                                          images,
                                          zones,
                                          secgroups,
                                        }
                                      }
                                      return <Form1
                                        isEdit={isEdit}
                                        allData={allData}
                                        currentData={currentData}
                                        defaultValues={defaultValues}
                                        currentStep={currentStep}
                                        onDataCenterChange={this.onDataCenterChange}
                                        currentIcon={currentIcon}
                                        ref={ref => { this.form1Rele = ref }}
                                      />
                                    })()
                                  }
                                  <Form className={'step2 ' + (currentStep === 0 ? 'hide' : '')} horizontal>
                                    <div>
                                      <div className="panel">
                                        <Row className="jiedianContainer" key="row7">
                                          <div className="ant-col-6 ant-form-item-label">
                                            <label className="iconLabel">伸缩节点数量
                                              <Tooltip placement="top" title="最大扩展数 = 单集群最大节点数 - 已有节点数">
                                                <Icon style={{ marginLeft: '5px', cursor: 'pointer' }} type="info-circle-o" />
                                              </Tooltip>
                                            </label>
                                          </div>
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
                                              <InputNumber
                                                min={0}
                                                max={parseInt(this.props.form.getFieldValue('max')) - 1}
                                                className="item"
                                                placeholder="1"
                                                {...getFieldProps('min', { initialValue: min,
                                                  validate: [{
                                                    rules: [
                                                      { required: true, message: '请输入最少保留数' },
                                                    ],
                                                  }],
                                                })} />
                                            </FormItem>
                                            {/* </div>
                                          </div>*/}
                                            <span className="unit count">个</span>
                                            <FormItem className="unitWapper" labelCol={{ span: 24 }} wrapperCol={{ span: 18 }}
                                              label="最大扩展"
                                            >
                                              <InputNumber
                                                min={parseInt(this.props.form.getFieldValue('min')) + 1}
                                                max={defaultMax}
                                                {...getFieldProps('max', { initialValue: max,
                                                  validate: [{
                                                    rules: [
                                                      { validator: this.checkMax },
                                                    ],
                                                  }],
                                                })}
                                                className="item"
                                                placeholder="1" />
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
                                        </Row>
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
                            }
                          }
                        } else {
                          if (isEdit) {
                            rele = <div className="descContainer">资源池已删除，当前策略依然可用<br />若需编辑，请重新配置对应资源池，或重新创建策略</div>
                          } else {
                            if (checkExistStrategy) {
                              rele = <div className="btnConatainer">
                                <Button type="primary" onClick={this.fun2}>集群已存在策略, 请在列表选择相应策略编辑</Button>
                                <Tooltip title="每个集群仅能添加一个伸缩策略">
                                  <Icon style={{ marginLeft: 5 }} type="question-circle-o" />
                                </Tooltip>
                              </div>
                            } else {
                              rele = <div className="btnConatainer">
                                <Button type="primary" onClick={this.fun1}>前往配置 {(() => {
                                  let text = 'vSphere'
                                  if (currentIcon === 'openstack') {
                                    text = 'OpenStack 资源'
                                  }
                                  return text
                                })()}</Button>
                              </div>
                            }
                          }
                        }
                      }
                      return rele
                    })()
                  }
                </div>
            }
          </Modal>
        </div>
      )
    }
  })
)

