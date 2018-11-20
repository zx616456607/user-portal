/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * OpenstackSetting Modal
 *
 * 2018-11-14
 * @author rensiwei
 */

import React, { Component, PropTypes } from 'react'
import { Input, Form, Modal, Radio, Row, Col, Button, notification } from 'antd'
import { validateOpenstack } from '../../actions/global_config'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router';
import cloneDeep from 'lodash/cloneDeep'
import './style/OpenstackSetting.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group

class OpenstackSetting extends React.Component {
  state = {
    readOnly: true,
    isAllowClick: false,
    checkLoading: false,
  }
  validateFunc = _cb => {
    const { onOk, form } = this.props
    const { validateFields, getFieldValue } = form
    let arr = [ 'host', 'protocol', 'user', 'password', 'keystone', 'type' ]
    const type_value = getFieldValue('type')
    if (type_value === 0) {
      arr = [].concat([ 'project', 'neutron', 'cinder', 'glance', 'ceilometer', 'nova' ], arr)
    } else {
      arr.push('websso')
    }
    validateFields(arr, (err, values) => {
      if (err) return
      _cb(values)
    })
  }
  onOk = () => {
    const cb = values => {
      const { onOk } = this.props
      !!onOk && onOk(values)
    }
    this.validateFunc(cb)
  }
  onValidate = () => {
    const cb = values => {
      const { validateOpenstack, config } = this.props
      const temp = cloneDeep(config)
      temp.configDetail = values
      this.setState({
        checkLoading: true,
      }, () => {
        validateOpenstack(temp, {
          success: {
            func: res => {
              if (res.valid === true) {
                this.setState({
                  isAllowClick: true,
                })
                notification.success({
                  message: '配置信息检测成功',
                })
                return
              }
              notification.warn({
                message: '配置信息检测失败',
              })
            },
            isAsync: true,
          },
          failed: {
            func: () => {
              notification.warn({
                message: '配置信息检测失败',
              })
            }
          },
          finally: {
            func: () => {
              this.setState({
                checkLoading: false,
              })
            }
          }
        })
      })
    }
    this.validateFunc(cb)
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 15 },
    }
    const formItemSmallLayout = {
      labelCol: { span: 12 },
      wrapperCol: { span: 12 },
    }
    const { isAllowClick, checkLoading } = this.state
    const { visible, onCancel, form, config } = this.props
    let { configDetail: defaultValues } = config
    if(typeof defaultValues === 'string') defaultValues = JSON.parse(defaultValues)
    const { host, protocol, user, password, keystone, type, websso,
      project, neutron, cinder, glance, ceilometer, nova } = defaultValues || {}
    const { getFieldProps, getFieldValue } = form
    const temp = getFieldValue('type')
    let type_value = 1
    if(temp === undefined) type_value = 0
    if(type === 1 || type === 0) type_value = type
    if(temp === 0) type_value = 0
    if(temp === 1) type_value = 1
    return (
      <Modal
        wrapClassName='openstack-wrapper'
        width={580}
        title="配置"
        visible={visible}
        onCancel={onCancel}
        onOk={this.onOk}
        footer={
          <div className="footer">
            <div className="left">
              <Button loading={checkLoading} disabled={isAllowClick} size="large" type="primary" onClick={this.onValidate}>配置信息检测</Button>
            </div>
            <div className="right">
              <Button size="large" type="ghost" onClick={onCancel}>取消</Button>
              <Button disabled={!isAllowClick} size="large" type="primary" onClick={this.onOk}>确定</Button>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
        }
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label="OpenStack 主机协议"
          >
            <Input
              placeholder="所使用的 OpenStack 主机协议"
              {...getFieldProps('protocol', {
                initialValue: protocol || '',
                rules: [
                  {
                    required: true, message: '请输入所使用的 OpenStack 主机协议',
                  }
                ]
              })}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="OpenStack 主机地址"
          >
            <Input
              placeholder="所使用的 OpenStack 主机地址"
              {...getFieldProps('host', {
                initialValue: host || '',
                rules: [
                  {
                    required: true, message: '请输入所使用的 OpenStack 主机地址',
                  }
                ]
              })}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="OpenStack 用户"
          >
            <Input
              placeholder="所使用的 OpenStack 用户"
              {...getFieldProps('user', {
                initialValue: user || '',
                rules: [
                  {
                    required: true, message: '请输入所使用的 OpenStack 用户',
                  }
                ]
              })}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="OpenStack 密码"
          >
            <Input
              type="password"
              type="password"
              autoComplete="new-password"
              readOnly={!!this.state.readOnly}
              onFocus={() => this.setState({ readOnly: false })}
              onBlur={() => this.setState({ readOnly: true })}
              placeholder="所使用的 OpenStack 用户密码"
              {...getFieldProps('password', {
                initialValue: password || '',
                rules: [
                  {
                    required: true, message: '请输入所使用的 OpenStack 用户密码',
                  }
                ]
              })}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="Keystone 端口"
          >
            <Input
              placeholder="所使用的 OpenStack KeyStone 服务端口"
              {...getFieldProps('keystone', {
                initialValue: keystone || '5000',
                rules: [
                  {
                    required: true, message: '请输入所使用的 OpenStack KeyStone 服务端口',
                  }
                ]
              })}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="集成方式"
          >
            <RadioGroup
              {...getFieldProps('type', {
                initialValue: type === 0 ? 0 : 1,
              })}
            >
              <Radio value={1}>原生 Portal (Web-SSO)</Radio>
              <Radio value={0}>使用平台内简单 Portal</Radio>
            </RadioGroup>
          </FormItem>
          {
            type_value === 1 ?
              <FormItem
                {...formItemLayout}
                label="ES webSSO 地址"
              >
                <Input
                  placeholder="请输入 ES webSSO 地址"
                  {...getFieldProps('websso', {
                    initialValue: websso || '',
                    rules: [
                      {
                        required: true, message: '请输入ES webSSO 地址',
                      }
                    ]
                  })}
                />
              </FormItem>
              :
              <Row>
                  <Row>
                    <Col span={1}></Col>
                    <Col span={10}>
                      <FormItem
                        {...formItemSmallLayout}
                        label="使用的用户租户"
                      >
                        <Input
                          placeholder="请输入使用的用户租户"
                          {...getFieldProps('project', {
                            initialValue: project || '',
                            rules: [
                              { required: true, message: '使用的用户租户' }
                            ]
                          })}
                        />
                      </FormItem>
                    </Col>
                    <Col span={11}>
                      <FormItem
                        {...formItemSmallLayout}
                        label="Neutron 端口"
                      >
                        <Input
                          placeholder="请输入 Neutron 端口"
                          {...getFieldProps('neutron', {
                            initialValue: neutron || '9696',
                            rules: [
                              { required: true, message: 'Neutron 端口' }
                            ]
                          })}
                        />
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={1}></Col>
                    <Col span={10}>
                      <FormItem
                        {...formItemSmallLayout}
                        label="Cinder 端口"
                      >
                        <Input
                          placeholder="请输入 Cinder 端口"
                          {...getFieldProps('cinder', {
                            initialValue: cinder || '8776',
                            rules: [
                              { required: true, message: 'Cinder 端口' }
                            ]
                          })}
                        />
                      </FormItem>
                    </Col>
                    <Col span={11}>
                      <FormItem
                        {...formItemSmallLayout}
                        label="Glance 端口"
                      >
                        <Input
                          placeholder="请输入 Glance 端口"
                          {...getFieldProps('glance', {
                            initialValue: glance || '9292',
                            rules: [
                              { required: true, message: 'Glance 端口' }
                            ]
                          })}
                        />
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={1}></Col>
                    <Col span={10}>
                      <FormItem
                        {...formItemSmallLayout}
                        label="监控服务端口"
                      >
                        <Input
                          placeholder="请输入监控服务端口"
                          {...getFieldProps('ceilometer', {
                            initialValue: ceilometer || '8777',
                            rules: [
                              // { required: true, message: '监控服务端口' }
                            ]
                          })}
                        />
                      </FormItem>
                    </Col>
                    <Col span={11}>
                      <FormItem
                        {...formItemSmallLayout}
                        label="Nova 端口"
                      >
                        <Input
                          placeholder="请输入 Nova 端口"
                          {...getFieldProps('nova', {
                            initialValue: nova || '8774',
                            rules: [
                              { required: true, message: 'Nova 端口' }
                            ]
                          })}
                        />
                      </FormItem>
                    </Col>
                  </Row>
              </Row>
          }
        </Form>
      </Modal>
    )
  }
}

function mapStateToProps(state, props) {
  return {

  }
}

export default connect(mapStateToProps, {
  validateOpenstack,
})(Form.create()(OpenstackSetting));
