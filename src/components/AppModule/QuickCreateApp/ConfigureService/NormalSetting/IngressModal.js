/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Ingress modal
 *
 * v0.1 - 2018-02-02
 * @author Zhangxuan
 */

import React from 'react'
import { 
  Modal, Form, Input, InputNumber, 
  Radio, Checkbox, Slider, Row, Col
} from 'antd'
import classNames from 'classnames'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../../../constants'
import HealthCheckModal from '../../../LoadBalance/HealthCheckModal'
import { ingressNameCheck, ingressRelayRuleCheck } from '../../../../../common/naming_validation'

const FormItem = Form.Item
const RadioGroup = Radio.Group

class IngressModal extends React.Component {
  state = {
    
  }
  
  componentWillMount() {
    const { currentIngress } = this.props
    if (currentIngress) {
      const { healthOptions } = currentIngress
      const { interval, fall, rise } = healthOptions
      this.setState({
        healthOptions
      })
      if (interval && fall && rise) {
        this.setState({
          healthCheck: true
        })
      }
    }
  }
  componentWillUnmount() {
    clearTimeout(this.confirmSetTimeout)
  }
  
  openCheckModal = () => {
    this.setState({
      checkVisible: true
    })
  }
  
  closeCheckModal = () => {
    this.setState({
      checkVisible: false
    })
  }
  
  getHealthData = values => {
    const {
      isCheck, httpSend, interval, fall, rise,
      http_1xx, http_2xx, http_3xx, http_4xx, http_5xx
    } = values
    let expectAlive = []
    http_1xx && expectAlive.push('http_1xx')
    http_2xx && expectAlive.push('http_2xx')
    http_3xx && expectAlive.push('http_3xx')
    http_4xx && expectAlive.push('http_4xx')
    http_5xx && expectAlive.push('http_5xx')
    this.setState({
      healthCheck: isCheck,
      healthOptions: {
        httpSend,
        interval,
        fall,
        rise,
        expectAlive
      }
    })
  }
  
  cancelModal = () => {
    const { closeModal } = this.props
    closeModal()
  }
  
  confirmModal = () => {
    const { healthOptions, healthCheck } = this.state
    const { closeModal, form, callback } = this.props
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        confirmLoading: true
      })
      this.confirmSetTimeout = setTimeout(() => {
        this.setState({
          confirmLoading: false
        })
        const newValues = Object.assign({}, values, { healthOptions, healthCheck })
        callback && callback(newValues)
        closeModal()
      }, 500)
    })
  }

  monitorNameCheck = (rules, value, callback) => {
    const { checkIngressNameAndHost, clusterID, lbname, form } = this.props
    let message = ingressNameCheck(value)
    if (message !== 'success') {
      return callback(message)
    }
    clearTimeout(this.nameTimeout)
    this.nameTimeout = setTimeout(() => {
      checkIngressNameAndHost(clusterID, lbname, {
        displayName: value,
        path: form.getFieldValue('host')
      }, {
        success: {
          func: () => {
            callback()
          }
        },
        failed: {
          func: res => {
            if (res.statusCode === 409) {
              return callback('监听器名称已经存在')
            }
            callback(res.message.message || res.message)
          }
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  
  hostCheck = (rules, value, callback) => {
    const { checkIngressNameAndHost, clusterID, lbname, form } = this.props
    let message = ingressRelayRuleCheck(value)
    if (message !== 'success') {
      return callback(message)
    }
    clearTimeout(this.nameTimeout)
    this.nameTimeout = setTimeout(() => {
      checkIngressNameAndHost(clusterID, lbname, {
        displayName: form.getFieldValue('monitorName'),
        path: value
      }, {
        success: {
          func: () => {
            callback()
          }
        },
        failed: {
          func: res => {
            if (res.statusCode === 409) {
              return callback('校验规则已经存在')
            }
            callback(res.message.message || res.message)
          }
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  portCheck = (rules, value, callback) => {
    if (!value) {
      return callback('请输入监听端口')
    }
    if (!/^[0-9]*$/.test(value)) {
      return callback('监听端口必须为数字')
    }
    if (+value < 1 || +value > 65535) {
      return callback('监听端口必须在1-65535之间')
    }
    callback()
  }
  render() {
    const { confirmLoading, checkVisible, healthOptions, healthCheck } = this.state
    const { visible, form, currentIngress } = this.props
    const { getFieldProps, getFieldValue, setFieldsValue, getFieldError, isFieldValidating } = form
  
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 }
    }
    const monitorNameProps = getFieldProps('monitorName', {
      rules: [
        {
          validator: this.monitorNameCheck
        }
      ],
      initialValue: currentIngress ? currentIngress.monitorName : ''
    })
    const lbAlgorithmProps = getFieldProps('lbAlgorithm', { 
      initialValue: currentIngress ? currentIngress.lbAlgorithm : 'round-robin'
    })
    const sessionProps = getFieldProps('sessionSticky', {
      valuePropName: 'checked',
      initialValue: currentIngress ? currentIngress.sessionSticky : false
    })
    const relayRuleProps = getFieldProps('host', {
      initialValue: currentIngress ? currentIngress.host : '',
      rules: [
        {
          validator: this.hostCheck
        }
      ]
    })
    const portProps = getFieldProps('port', {
      rules: [
        {
          validator: this.portCheck
        }
      ],
      initialValue: currentIngress ? currentIngress.port : ''
    })
  
    const showSlider = getFieldValue('sessionSticky') && (getFieldValue('lbAlgorithm') !== 'ip_hash')
    return (
      <Modal
        title="配置监听器"
        width={560}
        visible={visible}
        onCancel={this.cancelModal}
        onOk={this.confirmModal}
        confirmLoading={confirmLoading}
      >
        {
          checkVisible &&
          <HealthCheckModal
            visible={checkVisible}
            healthOptions={healthOptions}
            closeModal={this.closeCheckModal}
            callback={this.getHealthData}
          />
        }
        <Form form={form}>
          <FormItem
            label="监听器名称"
            {...formItemLayout}
            hasFeedback={!!getFieldValue('monitorName')}
            help={isFieldValidating('monitorName') ? '校验中...' : (getFieldError('monitorName') || []).join(', ')}
          >
            <Input {...monitorNameProps} placeholder="请输入监听器名称"/>
          </FormItem>
          <FormItem
            label="调度算法"
            {...formItemLayout}
          >
            <RadioGroup {...lbAlgorithmProps}>
              <Radio value="round-robin">加权轮询</Radio>
              <Radio value="least_conn">最小连接数</Radio>
              <Radio value="ip_hash">源地址散列IP_HASH</Radio>
            </RadioGroup>
          </FormItem>
          {
            getFieldValue('lbAlgorithm') !== 'ip_hash' &&
            <FormItem
              label="会话保持"
              {...formItemLayout}
            >
              <Checkbox {...sessionProps}>启用会话</Checkbox>
            </FormItem>
          }
          {
            showSlider &&
            <Row>
              <Col span={16}>
                <FormItem
                  label="保持时间"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  <Slider  max={3600} {...getFieldProps('sessionPersistent', {
                    initialValue: currentIngress ? currentIngress.sessionPersistent : 100
                  })}/>
                </FormItem>
              </Col>
              <Col span={6}>
                <InputNumber
                  style={{ marginRight: 0 }} max={100}
                  value={getFieldValue('sessionPersistent')} onChange={value => setFieldsValue({sessionPersistent: value})}/> s
              </Col>
            </Row>
          }
          <FormItem
            label="健康检查"
            {...formItemLayout}
          >
            <p className="ant-form-text">
              <span className={classNames("successColor", { 'hintColor': !healthCheck })}>{healthCheck ? '已开启' : '未开启'}</span>&nbsp;
              <i className="fa fa-pencil-square-o pointer" aria-hidden="true" onClick={this.openCheckModal}/>
            </p>
          </FormItem>
          <FormItem
            label="添加 HTTP头 "
            {...formItemLayout}
          >
            <p className="ant-form-text">已开启客户端真实 IP<span className="hintColor">（通过 X-Forwarded-For 头字段获取）</span></p>
            <p className="ant-form-text">已开启负载均衡监听协议<span className="hintColor">（通过 X-Forwarded-Proto 头字段获取）</span></p>
          </FormItem>
          <FormItem
            label="转发规则"
            {...formItemLayout}
            hasFeedback={!!getFieldValue('host')}
            help={isFieldValidating('host') ? '校验中...' : (getFieldError('host') || []).join(', ')}
          >
            <Input placeholder="输入域名 URL " {...relayRuleProps}/>
          </FormItem>
          <FormItem
            label="端口"
            {...formItemLayout}
          >
            <Input placeholder="输入端口" {...portProps}/>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(IngressModal)