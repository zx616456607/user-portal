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
  Card, Form, Select, Radio, Input,
  Checkbox, Row, Col, Button, Icon, InputNumber
} from 'antd'
import isEmpty from 'lodash/isEmpty'
import classNames from 'classnames'
import './style/LoadBalanceModal.less'
import { getNodesIngresses } from '../../../actions/cluster_node'
import { getLBIPList, createLB, editLB, checkLbPermission, getLBDetail, getVipIsUsed } from '../../../actions/load_balance'
import { getResources } from '../../../../kubernetes/utils'
import { lbNameCheck } from '../../../common/naming_validation'
import Notification from '../../Notification'
import {
  RESOURCES_MEMORY_MAX,
  RESOURCES_MEMORY_MIN,
  RESOURCES_MEMORY_STEP,
  RESOURCES_CPU_MAX,
  RESOURCES_CPU_STEP,
  RESOURCES_CPU_MIN,
  RESOURCES_CPU_DEFAULT,
  RESOURCES_DIY,
  UPGRADE_EDITION_REQUIRED_CODE,
} from '../../../constants'
import { getPodNetworkSegment } from '../../../actions/app_manage'
import ipRangeCheck from 'ip-range-check'
import {getDeepValue} from "../../../../client/util/util"
import { sleep } from "../../../common/tools"
import * as serviceActions from '../../../actions/services'
import { K8S_NODE_SELECTOR_KEY } from '../../../../constants'
import Title from '../../Title'
import { browserHistory } from 'react-router'
import * as IPPoolActions from '../../../../client/actions/ipPool'
import { IP_REGEX } from '../../../../constants'
import ConfigManage from '../../../../client/containers/AppModule/LoadBalance/ConfigManage'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group;
const notify = new Notification()

class LoadBalanceModal extends React.Component {
  state = {
    composeType: 512,
    NetSegment: undefined,
  }

  async componentDidMount() {
    const { clusterID, getLBIPList, getNodesIngresses, form, getPodNetworkSegment,
      checkLbPermission, getIPPoolList, getLBDetail, location: { query: { name, displayName } },
    } = this.props
    if (name && displayName) {
      await getLBDetail(clusterID, name, displayName)
    }
    getLBIPList(clusterID)
    getNodesIngresses(clusterID)
    checkLbPermission()
    await getIPPoolList(clusterID, { version: 'v1' }, {
      failed: {
        func: err => {
          const { statusCode } = err
          if (statusCode !== 403) {
            notification.warn('获取地址池列表失败')
          }
        },
      },
    })
    await getPodNetworkSegment(clusterID, {
      success: {
        func: res => {
          this.setState({
            NetSegment: res.data, // 校验网段使用
          })
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode } = err
          if (statusCode !== 403) {
            notification.warn('获取 Pod 网段数据失败')
          }
        },
      },
    })
    const { currentBalance } = this.props
    if (currentBalance) {
      let agentType = 'inside'
      let buildType = false
      let node = ''
      const { labels, annotations: { allocatedIP } } = currentBalance.metadata
      if (labels.agentType && labels.agentType === 'outside') { // 集群外
        agentType = 'outside'
        node = getDeepValue(currentBalance, [ 'spec', 'template', 'spec', 'nodeSelector', K8S_NODE_SELECTOR_KEY ]) || ''
        node = this.dealWidthNodeData(node)
      } else if (labels.agentType && labels.agentType === 'HAInside') {
        agentType = 'inside'
        buildType = true
        node = getDeepValue(currentBalance, [ 'spec', 'template', 'spec', 'affinity', 'nodeAffinity', 'requiredDuringSchedulingIgnoredDuringExecution',
        'nodeSelectorTerms', '0', 'matchExpressions', '0', 'values' ]) || [ 'default' ]
        node = this.dealWidthNodeData(node)
      } else if (labels.agentType && labels.agentType === 'HAOutside') {
        agentType = 'outside'
        buildType = true
        node = getDeepValue(currentBalance, [ 'spec', 'template', 'spec', 'affinity', 'nodeAffinity', 'requiredDuringSchedulingIgnoredDuringExecution',
          'nodeSelectorTerms', '0', 'matchExpressions', '0', 'values' ]) || [ 'default' ]
        node = this.dealWidthNodeData(node)
      } else if (labels.agentType && labels.agentType === 'inside') {
        this.props.ipPoolList.filter(item => ipRangeCheck(allocatedIP, item.cidr)
          && form.setFieldsValue({ ipPool: item.cidr }))
      }
      form.setFieldsValue({
        agentType,
        buildType,
        node,
      })
      const { resources } = currentBalance.spec.template.spec.containers[0]
      const { limits, requests } = resources
      const { cpu: limitsCPU, memory: limitsMemory } = limits
      const { cpu: requestsCPU, memory: requestsMemory } = requests
      if (limitsCPU === '100m' && requestsCPU === '100m' && limitsMemory === '512Mi' &&  requestsMemory === '512Mi') {
        this.setState({
          composeType: 512
        })
      } else {
        this.setState({
          composeType: RESOURCES_DIY
        })
        form.setFieldsValue({
          DIYMinCPU: this.formatCPU(requestsCPU),
          DIYMaxCPU: this.formatCPU(limitsCPU),
          DIYMinMemory: this.formatMemory(requestsMemory),
          DIYMaxMemory: this.formatMemory(limitsMemory)
        })
      }
    }
  }

  dealWidthNodeData = node => {
    const { ips } = this.props
    if (typeof node === 'string') {
      const showNode = ips.filter(item => item.metadata.name === node )
      return `${showNode[0].ip}/${node}`
    } else if (typeof node === 'object') {
      if (node.length === 1) {
        return node
      }
      const showNode = []
      node.forEach(item => {
        ips.filter(ele => ele.metadata.name === item && showNode.push(`${ele.ip}/${item}`))
      })
      return showNode
    }
  }
  formatMemory = memory => {
    if (memory.indexOf('Gi') > -1) {
      memory = parseInt(memory) * 1024
    } else {
      memory = parseInt(memory)
    }
    return memory
  }

  formatCPU = cpu => {
    if (cpu.indexOf('m') > -1) {
      cpu = parseInt(cpu)
      cpu /= 1000
    } else {
      cpu = parseFloat(cpu)
    }
    return cpu
  }

  nodeCheck = (rule, value, callback) => {
    if (!value || !value.length) {
      return callback('请选择节点')
    }
    const { getFieldValue, validateFields } = this.props.form
    if (Array.isArray(value) && value.length > 1 && value.indexOf('default') > -1) {
      return callback('默认分配节点时不能选择其他节点')
    }
    if (getFieldValue('buildType') && value.indexOf('default') < 0) {
      if (value.length !== getFieldValue('instanceNum')) {
        return callback('实例所在节点数和实例数量需相同')
      }
    }
    callback()
  }

  nameCheck = (rule, value, callback) => {
    let message = lbNameCheck(value)
    if (message !== 'success') {
      return callback(message)
    }
    callback()
  }

  dealWidthNode = node => {
    const obj = {
      ip: '',
      node: '',
    }
    node.forEach(item => {
      obj.node += `${item.split('/')[1]},`
      obj.ip += `${item.split('/')[0]},`
    })
    obj.node = obj.node.substring(0, obj.node.length - 1)
    obj.ip = obj.ip.substring(0, obj.ip.length - 1)
    return obj
  }
  confirmModal = () => {
    const { composeType } = this.state
    const { form, createLB, editLB, clusterID, callback, currentBalance } = this.props
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { buildType, instanceNum, node } = values
      if (buildType && node[0] !== 'default' && instanceNum !== node.length) {
        return notify.warn('实例所在节点数和实例数量需相同')
      }
      if (!composeType) {
        notify.close()
        notify.info('请选择配置')
        return
      }
      this.setState({
        confirmLoading: true,
      })
      notify.spin(currentBalance ? '修改中' : '创建中')
      const {
        displayName, /*useGzip,*/ agentType, description,
        DIYMinMemory, DIYMaxMemory, DIYMinCPU, DIYMaxCPU,
        config,
      } = values
      let resources
      let defaultRequests
      let defaultLimits
      if (composeType === 512) {
        defaultRequests = {
          cpu: '100m',
          memory: '512Mi'
        }
        defaultLimits = {
          cpu: '100m',
          memory: '512Mi'
        }
      }
      if (composeType === RESOURCES_DIY) {
        resources = getResources(DIYMinMemory, DIYMinCPU, DIYMaxMemory, DIYMaxCPU)
        const { requests, limits } = resources
        defaultLimits = limits
        defaultRequests = requests
      }
      const body = {
        displayName,
        // useGzip: useGzip.toString(),
        agentType,
        requests: defaultRequests,
        limits: defaultLimits,
        description,
      }
      if (config) {
        body.config = JSON.parse(config)
      }
      if (buildType === true) {
        body.agentType = 'HAInside'
        if (agentType === 'outside') {
          body.agentType = 'HAOutside'
        }
      }
      // 处理 nodeName、ip
      // 选择默认分配(node: [ 'default' ])时 ip、nodeName传空（vip除外）
      let testObj = {}
      if (Array.isArray(node) && node.length >= 2) {
        testObj = this.dealWidthNode(node)
      }
      if (agentType === 'outside' && buildType === false) {
        Object.assign(body, {
          nodeName: node.split('/')[1],
          ip: node.split('/')[0],
        })
      } else if (agentType === 'outside' && buildType === true) {
        Object.assign(body, {
          nodeName: testObj.node || '',
          ip: values.vip,
          replica: instanceNum,
        })
      } else if (agentType === 'inside' && buildType === true) {
        Object.assign(body, {
          nodeName: testObj.node || '',
          ip: testObj.ip || '',
          replica: instanceNum,
        })
      } else if (agentType === 'inside' && buildType === false) {
        Object.assign(body, {
          ip: values.staticIP,
        })
      }
      if (currentBalance) {
        // 修改负载均衡
        Object.assign(body, { name: currentBalance.metadata.name })
      }
      const actionCallback = {
        success: {
          func: () => {
            notify.close()
            notify.success(currentBalance ? '修改成功' : '创建成功')
            this.setState({
              confirmLoading: false
            })
            this.returnLinkTo()
            form.resetFields()
            callback && callback()
          },
          isAsync: true
        },
        failed: {
          func: res => {
            notify.close()
            this.setState({
              confirmLoading: false
            })
            if (res.statusCode === 403) {
              notify.close()
              notify.warn(currentBalance ? '修改失败' : '创建失败', '允许创建『集群外』负载均衡开关关闭，请联系管理员开启')
              return
            }
            if (res.statusCode === 409) {
              if (res.message.message.indexOf('name') > -1) {
                notify.warn(currentBalance ? '修改失败' : '创建失败', '该负载均衡器的名称已经存在')
                return
              }
            }
            if (res.statusCode === UPGRADE_EDITION_REQUIRED_CODE) {
              return
            }
            notify.warn(currentBalance ? '修改失败' : '创建失败', res.message.message || res.message)
          },
        },
        finally: {
          func: () => {
            notify.close()
            this.setState({
              confirmLoading: false
            })
          }
        }
      }
      if (currentBalance) {
        editLB(clusterID, currentBalance.metadata.name, currentBalance.metadata.annotations["displayName"], body.agentType, body, actionCallback)
        return
      }
      createLB(clusterID, body.agentType, body, actionCallback)
    })
  }

  selectComposeType = type => {
    this.setState({
      composeType: type
    })
  }

  DIYMinMemoryCheck = (rules, value, callback) => {
    if (!value) {
      return callback('最小内存不能为空')
    }
    callback()
  }

  DIYMinMemoryChange = value => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const maxMemoryValue = getFieldValue('DIYMaxMemory')
    if (value >= maxMemoryValue) {
      setFieldsValue({
        DIYMaxMemory: value
      })
    }
  }

  DIYMaxMemoryCheck = (rules, value, callback) => {
    if (!value) {
      return callback('最大内存不能为空')
    }
    callback()
  }

  DIYMinCPUCheck = (rules, value, callback) => {
    if (!value) {
      return callback('最小CPU不能为空')
    }
    callback()
  }

  DIYMinCPUChange = value => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const maxCPUValue = getFieldValue('DIYMaxCPU')
    if (value >= maxCPUValue) {
      setFieldsValue({
        DIYMaxCPU: value
      })
    }
  }

  DIYMaxCPUCheck = (rules, value, callback) => {
    if (!value) {
      return callback('最大CPU不能为空')
    }
    callback()
  }

  staticIpCheck = async (rules, value, callback) => {
    if (!value) {
      return callback('固定 IP 不能为空')
    }
    const NetSegment = this.props.form.getFieldValue('ipPool')
    if (!NetSegment) {
      return callback('未获取到指定地址池')
    }
    const inRange = ipRangeCheck(value, NetSegment)
    if (!inRange) {
      return callback(`请输入属于 ${NetSegment} 的 IP`)
    }
    const { getISIpPodExisted, clusterID, currentBalance } = this.props
    const isExist = await getISIpPodExisted(clusterID, value)
    const { code, data: { isPodIpExisted } } = isExist.response.result
    if (code !== 200 && !currentBalance) {
      return callback('校验 IP 是否被占用失败')
    } else if (code === 200 && isPodIpExisted === 'true' && !currentBalance) {
      return callback('当前 IP 已经被占用, 请重新填写')
    }
    callback()
  }

  chartRepoIsEmpty = () => {
    const { loadbalanceConfig } = this.props
    if (isEmpty(loadbalanceConfig)) {
      return true
    }
    const { havePermission } = loadbalanceConfig
    return !havePermission
  }

  agentTypeChange = async e => {
    const { form } = this.props
    const { value } = e.target
    if (this.chartRepoIsEmpty() && value === 'outside') {
      await sleep(0)
      form.setFieldsValue({
        agentType: 'inside',
        node: undefined,
      })
      notify.warn('禁止选择', '允许创建『集群外』负载均衡开关关闭，请联系管理员开启')
    }
  }

  checkVip = async (rules, value, callback) => {
    if (!value) {
      return callback('请填写 vip')
    }
    if (!IP_REGEX.test(value)) {
      return callback('请输入合法的 vip')
    }
    const { currentBalance, getVipIsUsed, clusterID } = this.props
    if (currentBalance) {
      return callback()
    }
    const res = await getVipIsUsed(clusterID, value)
    const { statusCode, data } = res.response.result
    if (statusCode !== 200) {
      return callback('检查 vip 占用情况失败')
    } else if (statusCode === 200 && !data) {
      return callback('vip 已被占用')
    }
    callback()
  }
  buildTypeChange = () => {
    this.props.form.setFieldsValue({
      node: undefined,
    })
  }

  checkInstanceNum = (rules, value, callback) => {
    const { getFieldValue, validateFields } = this.props.form
    if (getFieldValue('buildType')) {
      if (!value) {
        return callback('实例数量必填')
      }
      const nodeValue = getFieldValue('node')
      if (nodeValue && nodeValue.length === 1 && nodeValue[0] === 'default') {
        return callback()
      }
      // if (nodeValue && value !== nodeValue.length) {
      //   return callback('实例数量和实例所在节点数需相同')
      // }
      validateFields(['node'], {  force: true })
    }
    callback()
  }

  // 高可用时过滤节点
  dealHAINode = item => {
    let disabled = true
    if (item.unavailableReason) {
      if (item.unavailableReason.type === 'nginx') {
        disabled = false
      }
    } else {
      disabled = false
    }
    return disabled
  }

  returnLinkTo = () => {
    const { location: { query: { from, name, displayName } } } = this.props
    if (from === 'topology') {
      return browserHistory.push(`/net-management/appLoadBalance/balance_config?name=${name}&displayName=${displayName}&from=topology`)
    }
    return browserHistory.push(`/net-management/appLoadBalance`)
  }

  toggleVisible = () => {
    this.setState(({ configVisible }) => ({
      configVisible: !configVisible,
    }))
  }

  render() {
    const { composeType, confirmLoading, NetSegment, configVisible } = this.state
    const { form, ips, currentBalance, ipPoolList, currentConfig } = this.props
    const { getFieldProps, getFieldValue } = form
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10 }
    }
    const agentType = getFieldValue('agentType')

    const IPPoolsProps = getFieldProps('ipPool', {
      initialValue: NetSegment ? NetSegment : '',
    })

    const agentTypeProps = getFieldProps('agentType', {
      initialValue: 'inside',
      onChange: this.agentTypeChange,
    })

    const buildProps = getFieldProps('buildType', {
      initialValue: false,
      valuePropName: 'checked',
      onChange: this.buildTypeChange,
    })

    const buildType = getFieldValue('buildType')

    const instanceNumProps = getFieldProps('instanceNum', {
      rules: [{
        validator: this.checkInstanceNum,
      }],
      initialValue: currentBalance ? currentBalance.spec.replicas : 2,
    })

    const nameProps = getFieldProps('displayName', {
      rules: [
        {
          validator: this.nameCheck
        }
      ],
      initialValue: currentBalance ? currentBalance.metadata.annotations.displayName : ''
    })

    const DIYMinMemoryProps = getFieldProps('DIYMinMemory', {
      rules: [
        {
          validator: this.DIYMinMemoryCheck
        }
      ],
      initialValue: RESOURCES_MEMORY_MIN,
      onChange: this.DIYMinMemoryChange
    })

    const DIYMaxMemoryProps = getFieldProps('DIYMaxMemory', {
      rules: [
        {
          validator: this.DIYMaxMemoryCheck
        }
      ],
      initialValue: RESOURCES_MEMORY_MIN
    })

    const DIYMinCPUProps = getFieldProps('DIYMinCPU', {
      rules: [
        {
          validator: this.DIYMinCPUCheck
        }
      ],
      initialValue: RESOURCES_CPU_DEFAULT,
      onChange: this.DIYMinCPUChange
    })

    const DIYMaxCPUProps = getFieldProps('DIYMaxCPU', {
      rules: [
        {
          validator: this.DIYMaxCPUCheck
        }
      ],
      initialValue: RESOURCES_CPU_DEFAULT
    })
   /* const gzipProps = getFieldProps('useGzip', {
      initialValue: currentBalance ? currentBalance.metadata.annotations.usegzip === 'true' : false,
      valuePropName: 'checked'
    })*/

    const descProps = getFieldProps('description', {
      initialValue: currentBalance ? currentBalance.metadata.annotations.description : ''
    })
    // 高可用时 list 中无 disabled
    const nodesChild = isEmpty(ips) ? [] :
      ips.filter(item => !item.taints).map(item => {
        return <Option
          // 高、非高可用过滤
          disabled={!!item.unavailableReason && !buildType || buildType && this.dealHAINode(item)}
          key={`${item.ip}/${item.metadata.name}`}
        >
          {item.metadata.name}
        </Option>
    })
    buildType && nodesChild.unshift(<Option key={"default"} >默认自动分配同等数量节点</Option>)
    const ipStr = currentBalance && getDeepValue(currentBalance, ['spec', 'template', 'metadata', 'annotations', 'cni.projectcalico.org/ipAddrs'])
    const ipPod = ipStr && JSON.parse(ipStr)[0]
    return (
      <div className="loadBalancePage" key="loadBalancePage">
        <Title title={`${ currentBalance ? "修改" : "创建" }负载均衡`} />
        <div className="gobackHeader" key="gobackHeader">
          <span
            className="back"
            onClick={this.returnLinkTo}
          >
            <span className="backjia"/>
            <span className="btn-back">返回</span>
          </span>
          <span className="headerTitle">
            {currentBalance ? "修改" : "创建"}负载均衡
          </span>
        </div>
        <Card>
          <Form form={form}>
            <FormItem
              label="代理方式"
              {...formItemLayout}
            >
              <RadioGroup {...agentTypeProps} disabled={!!currentBalance}>
                <Radio value="inside">集群内代理</Radio>
                <Radio value="outside">集群外代理</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem
              label="部署方式"
              {...formItemLayout}
            >
              <Checkbox
                {...buildProps}
                disabled={!!currentBalance}
              >
                开启多实例高可用部署
                <span className="textPrompt">&nbsp;&nbsp;(实例可分散至多个节点)</span>
              </Checkbox>
            </FormItem>

            {
              agentType === 'inside' && !buildType ?
                <div>
                  <FormItem
                    label="地址池"
                    {...formItemLayout}
                  >
                    <Select
                      showSearch={true}
                      disabled={currentBalance}
                      {...IPPoolsProps}
                      placeholder='请选择地址池'
                    >
                      {
                        ipPoolList.map(item => <Option
                            key={item.cidr}
                          >
                            {item.cidr}
                          </Option>
                        )
                      }
                    </Select>
                  </FormItem>

                  <Row>
                    <Col className='ant-col-3 ant-form-item-label'>
                      <label>固定 IP</label>
                    </Col>
                    <Col span={10}>
                      <FormItem>
                        <Input
                          disabled={currentBalance}
                          {...getFieldProps('staticIP', {
                            rules: [{
                              validator: this.staticIpCheck,
                            }],
                            initialValue: currentBalance && currentBalance.metadata.annotations.allocatedIP || ipPod
                          })}
                          placeholder={`请填写实例 IP（需属于 ${getFieldValue('ipPool')}）`}
                        />
                      </FormItem>
                    </Col>
                    <Col className='ant-col-6 ant-form-item-control textPrompt'>
                      &nbsp;&nbsp;<Icon type="exclamation-circle-o" /> 通过集群 IP 作为代理访问
                    </Col>
                  </Row>
                </div>
                : null
            }
            {
              buildType && agentType === 'outside' ?
                <Row>
                  <Col className='ant-col-3 ant-form-item-label'>
                    <label>填写 vip</label>
                  </Col>
                  <Col span={10}>
                    <FormItem>
                      <Input
                        {
                          ...getFieldProps('vip', {
                            rules: [
                              {
                                validator: this.checkVip,
                              }
                            ],
                            initialValue: currentBalance ? currentBalance.metadata.annotations.allocatedIP : undefined,
                          })
                        }
                        disabled={currentBalance}
                        placeholder="填写 vip，请确保 vip 未被集群节点占用"
                      />
                    </FormItem>
                  </Col>
                  <Col className='ant-col-6 ant-form-item-control textPrompt'>
                    &nbsp;&nbsp;<Icon type="exclamation-circle-o" /> 通过 vip 来访问负载均衡
                  </Col>
                </Row>
                : null
            }
            {
              buildType ?
                <FormItem
                  label="实例数量"
                  {...formItemLayout}
                >
                  <InputNumber
                    {...instanceNumProps}
                    step={1}
                    min={2}
                    max={ips.length}
                  />
                </FormItem>
                : null
            }
            {
              agentType === 'outside' || buildType ?
              <Row>
                <Col className='ant-col-3 ant-form-item-label'>
                  <label>实例所在节点</label>
                </Col>
                <Col span={10}>
                  <FormItem>
                    <Select
                      multiple={buildType}
                      showSearch={true}
                      // disabled={currentBalance}
                      {
                        ...getFieldProps('node', {
                          rules: [{
                            validator: this.nodeCheck
                          }],
                        })
                      }
                      placeholder={ !buildType? '请选择一个节点' : '请选择节点' }
                    >
                      {nodesChild}
                    </Select>
                  </FormItem>
                </Col>
                {
                  buildType && agentType === 'outside' && ' '
                    || <Col className='ant-col-6 ant-form-item-control textPrompt'>
                      &nbsp;&nbsp;<Icon type="exclamation-circle-o" /> 通过节点 IP 来访问负载均衡
                    </Col>
                }
              </Row>
                : null
            }
            <FormItem
              label="备注名"
              {...formItemLayout}
            >
              <Input placeholder="请输入负载均衡器的备注名" {...nameProps}/>
            </FormItem>
            <Row className="configRow">
              <Col span={3}>
                选择配置
              </Col>
              <Col span={18} className="configBox">
                <Button className="configList" type={composeType === 512 ? "primary" : "ghost"}
                        onClick={() => this.selectComposeType(512)}>
                  <div className="topBox">
                    2X
                  </div>
                  <div className="bottomBox">
                    <span>512 MB 内存</span><br />
                    <span>0.1 核 CPU</span>
                    <div className="triangle"/>
                    <Icon type="check" />
                  </div>
                </Button>
                <div className={classNames("configList DIY",{
                  "btn ant-btn-primary": composeType === 'DIY',
                  "btn ant-btn-ghost": composeType !== 'DIY'
                  })} onClick={() => this.selectComposeType('DIY')}>
                  <div className="topBox">
                    自定义
                  </div>
                  <div className="bottomBox">
                    <Row>
                      <Col span={8}>
                        <FormItem>
                          <InputNumber
                            {...DIYMinMemoryProps}
                            size="small"
                            step={RESOURCES_MEMORY_STEP}
                            min={RESOURCES_MEMORY_MIN}
                            max={RESOURCES_MEMORY_MAX} />
                        </FormItem>
                      </Col>
                      <Col span={1} style={{ lineHeight: '32px' }}>~</Col>
                      <Col span={8}>
                        <FormItem>
                          <InputNumber
                            {...DIYMaxMemoryProps}
                            size="small"
                            step={RESOURCES_MEMORY_STEP}
                            min={getFieldValue('DIYMinMemory')}
                            max={RESOURCES_MEMORY_MAX} />
                        </FormItem>
                      </Col>
                      <Col span={7} style={{ lineHeight: '32px' }}>MB&nbsp;内存</Col>
                    </Row>
                    <Row>
                      <Col span={8}>
                        <FormItem>
                          <InputNumber
                            {...DIYMinCPUProps}
                            size="small"
                            step={RESOURCES_CPU_STEP}
                            min={RESOURCES_CPU_MIN}
                            max={RESOURCES_CPU_MAX}/>
                        </FormItem>
                      </Col>
                      <Col span={1} style={{ lineHeight: '32px' }}>~</Col>
                      <Col span={8}>
                        <FormItem>
                          <InputNumber
                            {...DIYMaxCPUProps}
                            size="small"
                            step={RESOURCES_CPU_STEP}
                            min={getFieldValue('DIYMinCPU')}
                            max={RESOURCES_CPU_MAX}/>
                        </FormItem>
                      </Col>
                      <Col span={7} style={{ lineHeight: '32px' }}>核 CPU</Col>
                    </Row>
                    <div className="triangle"/>
                    <Icon type="check" />
                  </div>
                </div>
              </Col>
            </Row>
            {/*<FormItem
              {...formItemLayout}
              label="gzip 数据压缩"
            >
              <Checkbox {...gzipProps}>开启 gzip</Checkbox>
            </FormItem>*/}

            <FormItem
              label="备注"
              {...formItemLayout}
            >
              <Input {...descProps} type="textarea" placeholder="可输入中英文数字等作为备注"/>
            </FormItem>
            {
              !currentBalance && <div>
                <div className="divide-line"/>
                <Row style={{ marginBottom: 8 }}>
                  <Col className='ant-col-3 ant-form-item-label' onClick={this.toggleVisible}>
                <span className={classNames('pointer', {'themeColor': configVisible})}>
                  <Icon type={configVisible ? 'minus-square' : 'plus-square'}
                        style={{ marginRight: 8 }}
                  />
                  高级配置
                </span>
                  </Col>
                </Row>
                {
                  configVisible &&
                  <div>
                    <Row>
                      <Col className="ant-col-3 ant-form-item-label">
                        <span className="second-title">配置管理</span>
                      </Col>
                    </Row>
                    <ConfigManage
                      {...{
                        form,
                        formItemLayout,
                        config: currentConfig,
                      }}
                    />
                  </div>
                }
              </div>
            }
          </Form>
          <Row className='footerBtns'>
            <Col offset={3}>
              <Button
                size="large"
                onClick={this.returnLinkTo}
              >
                取消
              </Button>
              <Button
                size="large"
                type="primary"
                style={{ marginLeft: 12 }}
                loading={confirmLoading}
                onClick={this.confirmModal}
              >
                {currentBalance ? "修改负载均衡" : "创建负载均衡"}
              </Button>
            </Col>
          </Row>
        </Card>
      </div>
    )
  }
}

LoadBalanceModal = Form.create()(LoadBalanceModal)

const mapStateToProps = (state, props) => {
  const { entities, loadBalance, cluster_nodes } = state
  const { location: { query: { name, displayName } } } = props
  const { clusterID } = entities.current.cluster
  const data = getDeepValue(cluster_nodes, ['clusterIngresses', 'result', 'data']) || []
  // const { loadBalanceIPList } = loadBalance
  // const { data } = loadBalanceIPList || { data: [] }
  const loadbalanceConfig = getDeepValue(state, ['loadBalance', 'loadbalancePermission', 'data'])
  const ipPoolList = getDeepValue(state, ['ipPool', 'getIPPoolList', 'data']) || []
  const currentBalance = name && displayName ? getDeepValue(state, [ 'loadBalance', 'loadBalanceDetail', 'data', 'deployment' ]) || '' : ''
  const currentConfig = name && displayName ? getDeepValue(state, [ 'loadBalance', 'loadBalanceConfig', 'data' ]) : ''
  return {
    clusterID,
    ips: data,
    loadbalanceConfig,
    ipPoolList,
    currentBalance,
    currentConfig,
  }
}

export default connect(mapStateToProps, {
  getLBIPList,
  getNodesIngresses,
  createLB,
  editLB,
  getLBDetail,
  getPodNetworkSegment,
  checkLbPermission,
  getVipIsUsed,
  getISIpPodExisted: serviceActions.getISIpPodExisted,
  getIPPoolList: IPPoolActions.getIPPoolList,
})(LoadBalanceModal)
