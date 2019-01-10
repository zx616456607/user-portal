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
import {ingressContextCheck, ingressNameCheck, ingressRelayRuleCheck} from '../../../../../common/naming_validation'
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../../containers/Application/ServiceConfigIntl'

const FormItem = Form.Item
const RadioGroup = Radio.Group

class IngressModal extends React.Component {
  state = {

  }

  componentWillMount() {
    const { currentIngress } = this.props
    if (currentIngress) {
      const { healthOptions } = currentIngress
      const { interval, fall, rise } = healthOptions || { interval: '', fall: '', rise: '' }
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
    const { checkIngressNameAndHost, clusterID, lbname, form, currentIngress, intl } = this.props
    if (currentIngress && (currentIngress.monitorName === value)) {
      return callback()
    }
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
              return callback(intl.formatMessage(IntlMessage.monitorNameExist))
            }
            callback(res.message.message || res.message)
          }
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }

  hostCheck = (rules, value, callback) => {
    const { checkIngressNameAndHost, clusterID, lbname, form, currentIngress, intl } = this.props
    if (currentIngress && (currentIngress.host === value)) {
      return callback()
    }
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
              return callback(intl.formatMessage(IntlMessage.verRuleExist))
            }
            callback(res.message.message || res.message)
          }
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  contextCheck = (rule, value, callback) => {
    const message = ingressContextCheck(value)
    if (message !== 'success') {
      return callback(message)
    }
    callback()
  }
  portCheck = (rules, value, callback) => {
    const { intl } = this.props
    if (!value) {
      return callback(intl.formatMessage(IntlMessage.pleaseEnter, {
        item: intl.formatMessage(IntlMessage.containerPort),
        end: ''
      }))
    }
    if (!/^[0-9]*$/.test(value)) {
      return callback(intl.formatMessage(IntlMessage.containerPortRegMsg))
    }
    if (+value < 1 || +value > 65535) {
      return callback(intl.formatMessage(IntlMessage.containerPortRangeMsg))
    }
    callback()
  }
  getInitClientMaxBody = () => {
    const { currentIngress } = this.props
    if (!currentIngress || !currentIngress.clientMaxBody) {
      return
    }
    return +currentIngress.clientMaxBody
  }
  render() {
    const { confirmLoading, checkVisible, healthOptions, healthCheck } = this.state
    const { visible, form, currentIngress, intl } = this.props
    const { getFieldProps, getFieldValue, setFieldsValue, getFieldError, isFieldValidating } = form

    const formItemLayout = {
      labelCol: { span: 6 },
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
    const clientMaxBodyProps = getFieldProps('clientMaxBody', {
      initialValue: this.getInitClientMaxBody(),
    })
    const contextProps = getFieldProps('context', {
      initialValue: currentIngress && currentIngress.context,
      rules: [
        {
          validator: this.contextCheck
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

    const showSlider = getFieldValue('sessionSticky') && (getFieldValue('lbAlgorithm') === 'round-robin')
    return (
      <Modal
        title={intl.formatMessage(IntlMessage.configIngress)}
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
            label={intl.formatMessage(IntlMessage.ingressName)}
            {...formItemLayout}
            hasFeedback={!!getFieldValue('monitorName')}
            help={isFieldValidating('monitorName') ?
              `${intl.formatMessage(IntlMessage.validating)}...` :
              (getFieldError('monitorName') || []).join(', ')}
          >
            <Input {...monitorNameProps} placeholder="请输入监听器名称"/>
          </FormItem>
          <FormItem
            label={intl.formatMessage(IntlMessage.schedulingAlgorithm)}
            {...formItemLayout}
          >
            <RadioGroup {...lbAlgorithmProps}>
              <Radio value="round-robin">{intl.formatMessage(IntlMessage.roundRobin)}</Radio>
              <Radio value="least_conn">{intl.formatMessage(IntlMessage.leastConnect)}</Radio>
              <Radio value="ip_hash">{intl.formatMessage(IntlMessage.ipHash)}</Radio>
            </RadioGroup>
          </FormItem>
          {
            getFieldValue('lbAlgorithm') !== 'ip_hash' &&
              <FormItem
                label={intl.formatMessage(IntlMessage.weights)}
                {...formItemLayout}
              >
                <InputNumber
                  disabled
                  style={{ width: '100%' }}
                  min={0} max={100}
                  placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                    item: intl.formatMessage(IntlMessage.weights),
                    end: '',
                  })}
                  {...getFieldProps('weight', {
                    initialValue: 1,
                  })}
                />
              </FormItem>
          }
          {
            getFieldValue('lbAlgorithm') === 'round-robin' &&
            <FormItem
              label={intl.formatMessage(IntlMessage.sessionSticky)}
              {...formItemLayout}
            >
              <Checkbox {...sessionProps}>{intl.formatMessage(IntlMessage.enableSession)}</Checkbox>
            </FormItem>
          }
          {
            showSlider &&
            <Row>
              <Col span={17}>
                <FormItem
                  label={intl.formatMessage(IntlMessage.holdTime)}
                  labelCol={{ span: 7 }}
                  wrapperCol={{ span: 17 }}
                >
                  <Slider  max={3600} {...getFieldProps('sessionPersistent', {
                    initialValue: currentIngress ? currentIngress.sessionPersistent : 100
                  })}/>
                </FormItem>
              </Col>
              <Col span={6}>
                <InputNumber
                  style={{ marginRight: 0 }} max={3600}
                  value={getFieldValue('sessionPersistent')} onChange={value => setFieldsValue({sessionPersistent: value})}/> s
              </Col>
            </Row>
          }
          <FormItem
            label={intl.formatMessage(IntlMessage.healthCheck)}
            {...formItemLayout}
          >
            <p className="ant-form-text">
              <span className={classNames("successColor", { 'hintColor': !healthCheck })}>
                {healthCheck ? intl.formatMessage(IntlMessage.turnedOn) : intl.formatMessage(IntlMessage.unopened)}
                </span>&nbsp;
              <i className="fa fa-pencil-square-o pointer" aria-hidden="true" onClick={this.openCheckModal}/>
            </p>
          </FormItem>
          <FormItem
            label={intl.formatMessage(IntlMessage.addHttpHeader)}
            {...formItemLayout}
          >
            <p className="ant-form-text">{intl.formatMessage(IntlMessage.clientIPEnabled)}
            <span className="hintColor">（{intl.formatMessage(IntlMessage.throughXForwardedFor)}）</span></p>
            <p className="ant-form-text">{intl.formatMessage(IntlMessage.lbEnabled)}
            <span className="hintColor">（{intl.formatMessage(IntlMessage.throughXForwardedProto)}）</span></p>
          </FormItem>
          <FormItem
            label={intl.formatMessage(IntlMessage.clientMaxBody)}
            {...formItemLayout}
          >
            <div>
              <InputNumber {...clientMaxBodyProps}/> MiB
            </div>
          </FormItem>
          <FormItem
            label={intl.formatMessage(IntlMessage.serviceLocation)}
            {...formItemLayout}
            hasFeedback={!!getFieldValue('host')}
            help={isFieldValidating('host') ?
              `${intl.formatMessage(IntlMessage.validating)}...` :
              (getFieldError('host') || []).join(', ')}
          >
            <Input placeholder={intl.formatMessage(IntlMessage.serviceLocationPlaceholder)} {...relayRuleProps}/>
          </FormItem>
          <FormItem
            label={intl.formatMessage(IntlMessage.accessPath)}
            {...formItemLayout}
          >
            <Input placeholder={intl.formatMessage(IntlMessage.accessPathPlaceholder)} {...contextProps}/>
          </FormItem>
          <FormItem
            label={intl.formatMessage(IntlMessage.containerPort)}
            {...formItemLayout}
          >
            <Input
              placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                item: intl.formatMessage(IntlMessage.containerPort),
                end: '',
              })}
              {...portProps}
            />
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(injectIntl(IngressModal, {
  withRef: true,
}))
