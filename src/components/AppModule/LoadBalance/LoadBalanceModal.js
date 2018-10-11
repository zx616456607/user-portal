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
  Checkbox, Row, Col, Button, Icon, InputNumber
} from 'antd'
import isEmpty from 'lodash/isEmpty'
import classNames from 'classnames'
import './style/LoadBalanceModal.less'
import { getLBIPList, createLB, editLB, checkLbPermission } from '../../../actions/load_balance'
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
import TenxIcon from '@tenx-ui/icon'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group;
const notify = new Notification()

const CONFIG_TYPE = 'loadbalance'

class LoadBalanceModal extends React.Component {
  state = {
    composeType: 512,
    NetSegment: undefined,
  }

  componentDidMount() {
    const { clusterID, getLBIPList, currentBalance, form, getPodNetworkSegment,
      checkLbPermission,
    } = this.props
    getLBIPList(clusterID)
    checkLbPermission()
    getPodNetworkSegment(clusterID, {
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
    if (currentBalance) {
      let agentType = 'inside'
      const { labels } = currentBalance.metadata
      if (labels.agentType && labels.agentType === 'outside') { // 集群外
        agentType = 'outside'
      }
      form.setFieldsValue({
        agentType,
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
    callback()
  }

  nameCheck = (rule, value, callback) => {
    let message = lbNameCheck(value)
    if (message !== 'success') {
      return callback(message)
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
    const { closeModal, form, createLB, editLB, clusterID, callback, currentBalance } = this.props
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      if (!composeType) {
        notify.close()
        notify.info('请选择配置')
        return
      }
      this.setState({
        confirmLoading: true
      })
      notify.spin(currentBalance ? '修改中' : '创建中')
      const {
        displayName, useGzip, node, agentType, description,
        DIYMinMemory, DIYMaxMemory, DIYMinCPU, DIYMaxCPU
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
        useGzip: useGzip.toString(),
        agentType,
        requests: defaultRequests,
        limits: defaultLimits,
        description
      }
      if (agentType === 'outside') {
        Object.assign(body, {
          nodeName: currentBalance ? currentBalance.metadata.annotations.nodeName : node.split('/')[1],
          ip: currentBalance ? currentBalance.metadata.annotations.allocatedIP : node.split('/')[0],
        })
      } else {
        Object.assign(body, {
          staticIP: values.staticIP,
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
          form.resetFields()
          closeModal()
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
        editLB(clusterID, currentBalance.metadata.name, currentBalance.metadata.annotations["displayName"], body, actionCallback)
        return
      }
      createLB(clusterID, body, actionCallback)
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

  staticIpCheck = (rules, value, callback) => {
    if (!value) {
      return callback('固定 IP 不能为空')
    }
    const { NetSegment } = this.state
    if (!NetSegment) {
      return callback('未获取到指定网段')
    }
    const inRange = ipRangeCheck(value, NetSegment)
    if (!inRange) {
      return callback(`请输入属于 ${NetSegment} 的 IP`)
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
      })
      notify.warn('禁止选择', '允许创建『集群外』负载均衡开关关闭，请联系管理员开启')
    }
  }

  render() {
    const { composeType, confirmLoading, NetSegment } = this.state
    const { form, ips, visible, currentBalance } = this.props
    const { getFieldProps, getFieldValue } = form
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 }
    }
    let nodeProps
    const agentType = getFieldValue('agentType')
    if (agentType === 'outside') {
      nodeProps = getFieldProps('node', {
        rules: [
          {
            validator: this.nodeCheck
          }
        ],
        initialValue: currentBalance ? currentBalance.metadata.annotations.allocatedIP : ''
      })
    }

    const agentTypeProps = getFieldProps('agentType', {
      initialValue: 'inside',
      onChange: this.agentTypeChange,
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
    const gzipProps = getFieldProps('useGzip', {
      initialValue: currentBalance ? currentBalance.metadata.annotations.usegzip === 'true' : false,
      valuePropName: 'checked'
    })

    const descProps = getFieldProps('description', {
      initialValue: currentBalance ? currentBalance.metadata.annotations.description : ''
    })
    const nodesChild = isEmpty(ips) ? [] :
      ips.filter(item => !item.taints).map(item => {
        return <Option key={`${item.ip}/${item.name}`}>{item.name}</Option>
    })

    return (
      <Modal
        className="loadBalanceModal"
        title={currentBalance ? '修改负载均衡' : "新建负载均衡"}
        visible={visible}
        onCancel={this.cancelModal}
        onOk={this.confirmModal}
        okText={currentBalance ? '确认修改' : "确认创建"}
        confirmLoading={confirmLoading}
      >
        <div className="alertIconRow">
          <TenxIcon type="tips" className="alertIcon"/>
          应用负载均衡支持两种代理方式，集群内代理不指定代理节点，使用容器的集群 IP 代理，需要指定固定 IP ，
          适用于集群内访问；集群外代理需要指定代理节点，使用节点 IP 代理，建议集群外访问时使用
        </div>
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
          {
            agentType === 'outside' ?
            <FormItem
              label="选择节点"
              {...formItemLayout}
            >
              <Select
                showSearch={true}
                disabled={currentBalance}
                {...nodeProps}
              >
                {nodesChild}
              </Select>
            </FormItem>
              :
            <FormItem
              label="固定 IP"
              {...formItemLayout}
            >
              <Input
                disabled={currentBalance}
                {...getFieldProps('staticIP', {
                  rules: [{
                    validator: this.staticIpCheck,
                  }],
                  initialValue: currentBalance && currentBalance.metadata.annotations.podIP
                })}
                placeholder={`请填写实例 IP（需属于 ${NetSegment}）`}
              />
            </FormItem>
          }
          <FormItem
            label="备注名"
            {...formItemLayout}
          >
            <Input placeholder="请输入负载均衡器的备注名" {...nameProps}/>
          </FormItem>
          <Row className="configRow">
            <Col span={5}>
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
            <Input {...descProps} type="textarea" placeholder="可输入中英文数字等作为备注"/>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

LoadBalanceModal = Form.create()(LoadBalanceModal)

const mapStateToProps = state => {
  const { entities, loadBalance } = state
  const { clusterID } = entities.current.cluster
  const { loadBalanceIPList } = loadBalance
  const { data } = loadBalanceIPList || { data: [] }
  const loadbalanceConfig = getDeepValue(state, ['loadbalance', 'loadbalancePermission', 'data'])
  return {
    clusterID,
    ips: data,
    loadbalanceConfig,
  }
}

export default connect(mapStateToProps, {
  getLBIPList,
  createLB,
  editLB,
  getPodNetworkSegment,
  checkLbPermission,
})(LoadBalanceModal)
