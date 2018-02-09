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
import { getLBIPList, createLB, editLB } from '../../../actions/load_balance'
import { getResources } from '../../../../kubernetes/utils'
import Notification from '../../Notification'
import {
  RESOURCES_MEMORY_MAX,
  RESOURCES_MEMORY_MIN,
  RESOURCES_MEMORY_STEP,
  RESOURCES_CPU_MAX,
  RESOURCES_CPU_STEP,
  RESOURCES_CPU_MIN,
  RESOURCES_CPU_DEFAULT,
  RESOURCES_DIY
} from '../../../constants'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group;
const notify = new Notification()

class LoadBalanceModal extends React.Component {
  state = {
    composeType: 512
  }
  
  componentDidMount() {
    const { clusterID, getLBIPList, currentBalance, form } = this.props
    getLBIPList(clusterID)
    if (currentBalance) {
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
    if (!value) {
      return callback('请输入负载均衡器的名称')
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
        displayName, useGzip, node, monitorType, description, 
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
        resources = getResources(DIYMinMemory + 'Mi', DIYMinCPU * 1000 + 'm', DIYMaxMemory + 'Mi', DIYMaxCPU * 1000 + 'm')
        const { requests, limits } = resources
        defaultLimits = limits
        defaultRequests = requests
      }
      const body = {
        displayName,
        useGzip: useGzip.toString(),
        monitorType,
        nodeName: currentBalance ? currentBalance.metadata.annotations.nodeName : node.split('/')[1],
        ip: currentBalance ? currentBalance.metadata.annotations.allocatedIP : node.split('/')[0],
        requests: defaultRequests, 
        limits: defaultLimits,
        description
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
            if (res.statusCode === 409) {
              if (res.message.message.indexOf('name') > -1) {
                notify.warn(currentBalance ? '修改失败' : '创建失败', '该负载均衡器的名称已经存在')
                return
              }
            }
            notify.warn(currentBalance ? '修改失败' : '创建失败', res.message.message || res.message)
          }
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
        editLB(clusterID, currentBalance.metadata.name, body, actionCallback)
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
  render() {
    const { composeType, confirmLoading } = this.state
    const { form, ips, visible, currentBalance } = this.props
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = form
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 }
    }
  
    const nodeProps = getFieldProps('node', {
      rules: [
        {
          validator: this.nodeCheck
        }
      ],
      initialValue: currentBalance ? currentBalance.metadata.annotations.nodeName : ''
    })
  
    const monitorTypeProps = getFieldProps('monitorType', {
      initialValue: 'HTTP'
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
    const nodesChild = isEmpty(ips) ? [] : ips.map(item => 
      <Option key={`${item.ip}/${item.name}`}>{item.name}</Option>
    )
    
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
        <Form form={form}>
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
          <FormItem
            label="监听类型"
            {...formItemLayout}
          >
            <RadioGroup {...monitorTypeProps}>
              <Radio value="HTTP">HTTP</Radio>
              <Radio value="TCP/UDP" disabled>TCP/UDP</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem
            label="名称"
            {...formItemLayout}
          >
            <Input placeholder="请输入负载均衡器的名称" {...nameProps}/>
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
  return {
    clusterID,
    ips: data
  }
}

export default connect(mapStateToProps, {
  getLBIPList,
  createLB,
  editLB
})(LoadBalanceModal)