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
  Form, Collapse, Row, Col, Radio, Input, InputNumber,
} from 'antd'
import './style/LivenessSetting.less'

const Panel = Collapse.Panel
const FormItem = Form.Item
const RadioGroup = Radio.Group
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../containers/Application/ServiceConfigIntl'

const LivenessSetting = React.createClass({
  changeType(e) {
    if(e.target.value !== 'none') {
      setTimeout(()=> {
        document.getElementById('livenessPort').focus()
      },300)
    }
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
            }
          ],
        })
      }
    }
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
    return (
      <div id="livenessConfigureService">
        <Collapse>
          <Panel header={header}>
            <FormItem
              {...formItemLayout}
              className="lastFormItem"
              label="类型"
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
                      {
                        livenessPathProps && [
                          <Row className="configHeader" key="configHeader">
                            <Col span={6}>
                              {intl.formatMessage(IntlMessage.path)}
                            </Col>
                          </Row>,
                          <Row className="configBody" key="configBody">
                            <Col span={6}>
                              <FormItem>
                                <Input
                                  size="default"
                                  {...livenessPathProps}
                                />
                              </FormItem>
                            </Col>
                          </Row>
                        ]
                      }
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
