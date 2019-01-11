/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: liveness setting for service
 *
 * v0.1 - 2017-05-18
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import {
  Form, Collapse, Row, Col, Radio, Input, InputNumber, Tooltip, Icon
} from 'antd'
import isEmpty from 'lodash/isEmpty'
import './style/LivenessSetting.less'

const Panel = Collapse.Panel
const FormItem = Form.Item
const RadioGroup = Radio.Group
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../containers/Application/ServiceConfigIntl'

const LivenessSetting = React.createClass({
  getInitialState(){
    return {
      http: {},
      tcp: {},
    }
  },
  componentDidMount() {
    const { fields } = this.props
    if (!fields.livenessProtocol || !fields.livenessProtocol.value || fields.livenessProtocol.value === 'none') {
      return
    }
    const fieldsObj = {}
    const {
      livenessProtocol, livenessPort, livenessInitialDelaySeconds,
      livenessTimeoutSeconds, livenessPeriodSeconds,
      successThreshold, failureThreshold
    } = fields
    const protocol = livenessProtocol.value.toLowerCase()
    Object.assign(fieldsObj, {
      livenessPort: livenessPort.value,
      livenessInitialDelaySeconds: livenessInitialDelaySeconds.value,
      livenessTimeoutSeconds: livenessTimeoutSeconds.value,
      livenessPeriodSeconds: livenessPeriodSeconds.value,
      successThreshold: successThreshold.value,
      failureThreshold: failureThreshold.value,
    })
    if (protocol === 'http') {
      Object.assign(fieldsObj, {
        livenessPath: fields.livenessPath.value
      })
    }
    this.setState({
      [protocol]: fieldsObj,
    })
  },
  changeType(e) {
    if(e.target.value !== 'none') {
      const { form } = this.props
      const { setFieldsValue, resetFields } = form
      const protocol = e.target.value.toLowerCase()
      const preState = this.state[protocol]
      resetFields([
        'livenessPort',
        'livenessInitialDelaySeconds',
        'livenessTimeoutSeconds',
        'livenessPeriodSeconds',
        'successThreshold',
        'failureThreshold'
      ])
      if (!isEmpty(preState)) {
        setFieldsValue(preState)
      }
      setTimeout(()=> {
        document.getElementById('livenessPort').focus()
      },300)
    }
  },
  checkPath(rule, value, cb) {
    if (!value) {
      return cb()
    }
    const reg = /^(\/)/
    if (!reg.test(value)) {
      return cb('路径必须以 / 开头')
    }
    cb()
  },
  updateState(key, value) {
    const { form } = this.props
    const { getFieldValue } = form
    const protocol = getFieldValue('livenessProtocol').toLowerCase()
    this.setState(preState => {
      return {
        [protocol]: {
          ...preState[protocol],
          [key]: value,
        }
      }
    })
  },
  render() {
    const { formItemLayout, form, intl } = this.props
    const { getFieldProps, getFieldValue } = form
    const livenessProtocolProps = getFieldProps('livenessProtocol', {
      rules: [
        { required: true }
      ],
      onChange: this.changeType
    })
    const livenessProtocol = getFieldValue('livenessProtocol')
    let livenessPortProps
    let livenessPathProps
    let livenessInitialDelaySecondsProps
    let livenessTimeoutSecondsProps
    let livenessPeriodSecondsProps
    if (livenessProtocol === 'HTTP' || livenessProtocol === 'TCP') {
      livenessPortProps = getFieldProps('livenessPort', {
        rules: [
          {
            required: true,
            message: intl.formatMessage(IntlMessage.pleaseEnter, {
              item: intl.formatMessage(IntlMessage.port),
              end: '',
            })
          }
        ],
        onChange: value => this.updateState('livenessPort', value)
      })
      livenessInitialDelaySecondsProps = getFieldProps('livenessInitialDelaySeconds', {
        rules: [
          {
            required: true,
            message: intl.formatMessage(IntlMessage.pleaseEnter, {
              item: intl.formatMessage(IntlMessage.firstCheckDelay),
              end: '',
            })
          }
        ],
        onChange: value => this.updateState('livenessInitialDelaySeconds', value)
      })
      livenessTimeoutSecondsProps = getFieldProps('livenessTimeoutSeconds', {
        rules: [
          {
            required: true,
            message: intl.formatMessage(IntlMessage.pleaseEnter, {
              item: intl.formatMessage(IntlMessage.checkTimeout),
              end: '',
            })
          }
        ],
        onChange: value => this.updateState('livenessTimeoutSeconds', value)
      })
      livenessPeriodSecondsProps = getFieldProps('livenessPeriodSeconds', {
        rules: [
          {
            required: true,
            message: intl.formatMessage(IntlMessage.pleaseEnter, {
              item: intl.formatMessage(IntlMessage.checkInterval),
              end: '',
            })
          }
        ],
        onChange: value => this.updateState('livenessPeriodSeconds', value)
      })
      if (livenessProtocol === 'HTTP') {
        livenessPathProps = getFieldProps('livenessPath', {
          rules: [
            {
              required: true,
              message: intl.formatMessage(IntlMessage.pleaseEnter, {
                item: intl.formatMessage(IntlMessage.path),
                end: '',
              })
            }, {
              validator: this.checkPath,
            }
          ],
          onChange: e => this.updateState('livenessPath', e.target.value)
        })
      }
    }
    const successThresholdProps = getFieldProps('successThreshold', {
      initialValue: 1,
      rules: [
        { required: true, message: '请输入健康阈值'}
      ],
      onChange: value => this.updateState('successThreshold', value)
    })
    const failureThresholdProps = getFieldProps('failureThreshold', {
      initialValue: 3,
      rules: [
        { required: true, message: '请输入不健康阈值'}
      ],
      onChange: value => this.updateState('failureThreshold', value)
    })
    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">{intl.formatMessage(IntlMessage.highAvailability)}</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">{intl.formatMessage(IntlMessage.highAvailabilityTip)}</div>
          </Col>
        </Row>
      </div>
    )
    const sucText = 'successThreshold 探测失败后，再次探测成功最少连续如下次数认为健康（默认为 1，活跃度必须为 1 且最小值为 1）'
    const failText = 'failureThreshold 探测失败阈值，失败如下次数，将认为不健康（默认为 3，最小值为1） '
    return (
      <div id="livenessConfigureService">
        <Collapse>
          <Panel header={header}>
            <FormItem
              {...formItemLayout}
              className="lastFormItem"
              label={intl.formatMessage(IntlMessage.probeType)}
              key="type"
            >
              <RadioGroup {...livenessProtocolProps}>
                <Radio value="none">{intl.formatMessage(IntlMessage.no)}</Radio>
                <Radio value="HTTP">HTTP（{intl.formatMessage(IntlMessage.recommend)}）</Radio>
                <Radio value="TCP">TCP</Radio>
              </RadioGroup>
              <div className="tips">
                {
                  livenessProtocol === 'HTTP' && intl.formatMessage(IntlMessage.httpTip)
                }
                {
                  livenessProtocol === 'TCP' && intl.formatMessage(IntlMessage.tcpTip)
                }
              </div>
            </FormItem>
            {
              (livenessProtocol === 'HTTP' || livenessProtocol === 'TCP') && (
                <Row className="configRow">
                  <Col span={formItemLayout.labelCol.span} className="configCol">
                    {intl.formatMessage(IntlMessage.configuration)}
                    </Col>
                  <Col span={formItemLayout.wrapperCol.span}>
                    <div className="livenessConfig">
                      <Row className="configHeader">
                        <Col span={6}>
                          {intl.formatMessage(IntlMessage.port)}
                        </Col>
                        <Col span={6}>
                          {intl.formatMessage(IntlMessage.firstCheckDelay)}
                        </Col>
                        <Col span={6}>
                          {intl.formatMessage(IntlMessage.checkTimeout)}
                        </Col>
                        <Col span={6}>
                          {intl.formatMessage(IntlMessage.checkInterval)}
                        </Col>
                      </Row>
                      <Row className="configBody">
                        <Col span={6}>
                          <FormItem key="livenessPort">
                            <InputNumber
                              size="default"
                              {...livenessPortProps}
                              min={0}
                              max={65535}
                            />
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem key="livenessInitialDelaySeconds">
                            <InputNumber
                              size="default"
                              {...livenessInitialDelaySecondsProps}
                              min={0}
                            />
                            <span className="livenessUnit">
                              s
                            </span>
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem key="livenessTimeoutSeconds">
                            <InputNumber
                              size="default"
                              {...livenessTimeoutSecondsProps}
                              min={0}
                            />
                            <span className="livenessUnit">
                              s
                            </span>
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem key="livenessPeriodSeconds">
                            <InputNumber
                              size="default"
                              {...livenessPeriodSecondsProps}
                              min={0}
                            />
                            <span className="livenessUnit">
                              s
                            </span>
                          </FormItem>
                        </Col>
                      </Row>
                      <Row className="configHeader" key="configHeader">
                        {
                          livenessPathProps && <Col span={12}>
                            {intl.formatMessage(IntlMessage.path)}
                          </Col>
                        }
                        <Col span={6}>
                          健康阈值
                          <Tooltip placement="top" title={sucText}>
                            <Icon type="info-circle-o" style={{ marginLeft: 5 }} />
                          </Tooltip>
                        </Col>
                        <Col span={6}>
                          不健康阈值
                          <Tooltip placement="top" title={failText}>
                            <Icon type="info-circle-o" style={{ marginLeft: 5 }} />
                          </Tooltip>
                        </Col>
                      </Row>
                      <Row className="configBody" key="configBody">
                        {
                          livenessPathProps && <Col span={12}>
                            <FormItem>
                              <Input
                                size="default"
                                {...livenessPathProps}
                              />
                            </FormItem>
                          </Col>
                        }
                        <Col span={6}>
                          <FormItem>
                            <InputNumber
                              size="default"
                              {...successThresholdProps}
                              min={1}
                            />
                            <span className="livenessUnit">
                              次成功
                            </span>
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem>
                            <InputNumber
                              size="default"
                              {...failureThresholdProps}
                              min={1}
                            />
                            <span className="livenessUnit">
                              次失败
                            </span>
                          </FormItem>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
              )
            }
          </Panel>
        </Collapse>
      </div>
    )
  }
})

export default injectIntl(LivenessSetting, {
  withRef: true,
})
