/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/25
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {
  Button, Row, Col, InputNumber, Icon, Switch,
  Modal, Form, Select, Input, Tabs
} from 'antd'
import {
  loadAutoScale,
  updateAutoScale,
  updateAutoScaleStatus,
  getAutoScaleLogs
} from '../../../actions/services'
import AppAutoScaleLogs from './AppAutoScaleLogs'
import './style/AppAutoScale.less'
import NotificationHandler from '../../../components/Notification'
import isEmpty from 'lodash/isEmpty'
const FormItem = Form.Item
const Option = Select.Option;
const TabPane = Tabs.TabPane;

const sendEmailOpt = [{
  type: 'SendEmailWhenScale',
  text: '伸缩时发送邮件'
}, {
  type: 'SendEmailWhenScaleUp',
  text: '扩展时发送邮件'
}, {
  type: 'SendEmailWHenScaleDown',
  text: '收缩时发送邮件'
}, {
  type: 'SendNoEmail',
  text: '不发送邮件'
}]

class AppAutoScale extends Component {
  constructor() {
    super()
    this.state = {
      scaleDetail: null,
      switchOpen: false,
      isEdit: false,
      activeKey: 'autoScaleForm'
    }
  }
  componentWillMount() {
    this.loadData(this.props)
  }

  componentWillReceiveProps(nextProps) {
    const { serviceName: newServiceName, isCurrentTab: newCurrentTab, form, serviceDetailmodalShow: newScopeModal } = nextProps
    const { serviceName: oldServiceName, isCurrentTab: oldCurrentTab, serviceDetailmodalShow: oldScopeModal } = this.props
    if (newServiceName !== oldServiceName || (newCurrentTab && !oldCurrentTab)) {
      this.loadData(nextProps)
      this.setState({
        activeKey: 'autoScaleForm'
      })
    }
    if (oldScopeModal && !newScopeModal) {
      form.resetFields()
      this.setState({
        activeKey: 'autoScaleForm'
      })
    }
  }
  loadData = props => {
    const { serviceName, cluster, loadAutoScale } = props
    loadAutoScale(cluster, serviceName, {
      success: {
        func: (res) => {
          if (!isEmpty(res.data)) {
            const { metadata, spec } = res.data
            const { name: scale_strategy_name } = metadata
            const { serviceName } = metadata.labels
            const { alertStrategy: alert_strategy, alertgroupId: alert_group, status } = metadata.annotations
            const { maxReplicas: max, minReplicas: min, metrics } = spec
            let cpu, memory
            metrics.forEach(item => {
              if (item.resource.name === 'memory') {
                memory = item.resource.targetAverageUtilization
              } else if (item.resource.name === 'cpu') {
                cpu = item.resource.targetAverageUtilization
              }
            })
            const scaleDetail = {
              scale_strategy_name,
              serviceName,
              alert_group,
              alert_strategy,
              max,
              min,
              cpu,
              memory,
              type: status === 'RUN' ? 1 : 0
            }
            this.setState({
              scaleDetail,
              switchOpen: scaleDetail.type ? true : false
            })
          } else {
            this.setState({
              scaleDetail: null
            })
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {
          this.setState({
            scaleDetail: null
          })
        }
      }
    })
  }
  cancelEdit = () => {
    const { scaleDetail } = this.state
    const { scale_strategy_name,
      serviceName,
      alert_group,
      alert_strategy,
      max,
      min,
      cpu,
      memory,
      type } = scaleDetail
    const { setFieldsValue } = this.props.form
    setFieldsValue({
      scale_strategy_name,
      serviceName,
      alert_strategy,
      alert_group,
      max,
      min,
      cpu,
      memory
    })
    this.setState({
      isEdit: false,
      switchOpen: type ? true : false
    })
  }
  saveEdit = () => {
    const { form, updateAutoScale, cluster } = this.props
    const { scaleDetail, switchOpen } = this.state
    const { validateFields, resetFields } = form
    let notify = new NotificationHandler()
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        btnLoading: true
      })
      const msgSpin = isEmpty(scaleDetail) ? '创建中...' : '修改中'
      notify.spin(msgSpin)
      const { scale_strategy_name, serviceName, min, max, cpu, memory, alert_strategy, alert_group} = values
      let body = { scale_strategy_name, min, max, cpu, memory, alert_strategy, alert_group, type: switchOpen ? 1 : 0 }
      body = Object.assign(body, {operationType: isEmpty(scaleDetail) ? 'create' : 'update'})
      updateAutoScale(cluster, serviceName, body, {
        success: {
          func: () => {
            this.setState({
              btnLoading: false,
              isEdit: false
            })
            this.loadData(this.props)
            notify.close()
            notify.success('操作成功')
            resetFields()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            this.setState({
              btnLoading: false,
              isEdit: false
            })
            notify.close()
            notify.error('操作失败')
            resetFields()
          }
        }
      })
    })
  }
  updateScaleStatus = () => {
    const { updateAutoScaleStatus, cluster, serviceName } = this.props
    const { switchOpen, scaleDetail } = this.state
    let notify = new NotificationHandler()
    notify.spin('修改中...')
    this.setState({
      switchOpen: !switchOpen
    }, () => {
      updateAutoScaleStatus(cluster, {
        services: {
          [serviceName]: scaleDetail.scale_strategy_name
        },
        type: this.state.switchOpen ? 1 : 0
      }, {
        success: {
          func: () => {
            this.loadData(this.props)
            notify.close()
            notify.success('修改成功')
          },
          isAsync: true
        },
        failed: {
          func: () => {
            notify.close()
            notify.success('修改失败')
          }
        }
      })
    })
  }
  render() {
    const { isEdit, scaleDetail, switchOpen, btnLoading, activeKey } = this.state
    const { form, services, alertList, getAutoScaleLogs, cluster, serviceName, serviceDetailmodalShow, isCurrentTab } = this.props
    const { getFieldProps } = form
    const formItemLargeLayout = {
      labelCol: { span: 2},
      wrapperCol: { span: 10}
    }
    const formItemSmallLayout = {
      labelCol: { span: 2},
      wrapperCol: { span: 6}
    }
    const formItemInnerLayout = {
      labelCol: { span: 8},
      wrapperCol: { span: 16}
    }
    const formItemInnerLargeLayout = {
      labelCol: { span: 4},
      wrapperCol: { span: 20}
    }
    const scaleName = getFieldProps('scale_strategy_name', {
      rules: [{
        required: true,
        message: '请输入策略名称'
      }],
      // validator: this.checkScaleName.bind(this),
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.scale_strategy_name
    })
    const selectService = getFieldProps('serviceName', {
      rules: [{
        required: true,
        message: '请选择服务'
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.serviceName
    })
    const minReplicas = getFieldProps('min', {
      rules: [{
        required: true,
        message: '请输入最小实例数'
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.min
    })
    const maxReplicas = getFieldProps('max', {
      rules: [{
        required: true,
        message: '请输入最大实例数'
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.max
    })
    const cpuProps = getFieldProps('cpu', {
      rules: [{
        required: true,
        message: '请输入CPU阈值'
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.cpu
    })
    const memoryProps = getFieldProps('memory', {
      rules: [{
        required: true,
        message: '请输入内存阈值'
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.memory
    })
    const selectEmailSendType = getFieldProps('alert_strategy', {
      rules: [{
        required: true,
        message: '请选择邮件发送方式'
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.alert_strategy
    })
    const selectAlertGroup = getFieldProps('alert_group', {
      rules: [{
        required: true,
        message: '请选择告警通知组'
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.alert_group
    })
    return(
      <div id="AppAutoScale">
        <div className="autoScaleSwitch">
          <span>自动弹性伸缩</span>
          <Switch checked={switchOpen} onChange={this.updateScaleStatus} checkedChildren="开" unCheckedChildren="关" />
        </div>
        <Tabs activeKey={activeKey} onChange={activeKey => this.setState({activeKey})} type="card" id="autoScaleTabs">
          <TabPane tab="伸缩策略" key="autoScaleForm">
            <div className="autoScaleFormBox">
              <div className="alertRow">
                任意指标超过阈值都会触发扩展，所有指标都满足n-1个实例平均值低于阈值才会触发收缩
              </div>
              <div className="autoScaleInnerBox">
                <Form form={form} className="autoScaleForm">
                  <FormItem
                    {...formItemLargeLayout}
                    label="策略名称"
                  >
                    <Input disabled={!isEdit} type="text" {...scaleName} placeholder="请输入策略名称"/>
                  </FormItem>
                  <FormItem
                    {...formItemLargeLayout}
                    label="选择服务"
                  >
                    <Select
                      showSearch
                      disabled={!isEdit || !isEmpty(scaleDetail)}
                      optionFilterProp="children"
                      notFoundContent="无法找到"
                      {...selectService}
                      placeholder="请选择服务">
                      {
                        services && services.length && services.map(item =>
                          <Option key={item.metadata.name} value={item.metadata.name}>{item.metadata.name}</Option>)
                      }
                    </Select>
                  </FormItem>
                  <FormItem
                    {...formItemSmallLayout}
                    label="最小实例数"
                  >
                    <InputNumber disabled={!isEdit} {...minReplicas}/> 个
                  </FormItem>
                  <FormItem
                    {...formItemSmallLayout}
                    label="最大实例数"
                  >
                    <InputNumber disabled={!isEdit} {...maxReplicas}/> 个
                  </FormItem>
                  <Row>
                    <Col span={6}>
                      <FormItem
                        {...formItemInnerLayout}
                        label="CPU阈值"
                      >
                        <InputNumber disabled={!isEdit} {...cpuProps}/> %
                      </FormItem>
                    </Col>
                    <Col span={18} className="hintBox">
                      <Icon type="exclamation-circle-o" /> 所有实例平均使用率超过阈值自动扩展，n-1个实例平均值低于阈值自动收缩
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>
                      <FormItem
                        {...formItemInnerLayout}
                        label="内存阈值"
                      >
                        <InputNumber disabled={!isEdit} {...memoryProps}/> %
                      </FormItem>
                    </Col>
                    <Col span={18} className="hintBox">
                      <Icon type="exclamation-circle-o" /> 所有实例平均使用率超过阈值自动扩展，n-1个实例平均值低于阈值自动收缩
                    </Col>
                  </Row>
                  <FormItem
                    {...formItemLargeLayout}
                    label="发送邮件"
                  >
                    <Select
                      disabled={!isEdit}
                      {...selectEmailSendType}
                      placeholder="请选择邮件发送方式"
                      showSearch
                      optionFilterProp="children"
                      notFoundContent="无法找到">
                      {
                        sendEmailOpt.map(item => <Option key={item.type} value={item.type}>{item.text}</Option>)
                      }
                    </Select>
                  </FormItem>
                  <Row>
                    <Col span={12}>
                      <FormItem
                        {...formItemInnerLargeLayout}
                        label="告警通知组"
                      >
                        <Select
                          disabled={!isEdit}
                          {...selectAlertGroup}
                          placeholder="请选择告警通知组"
                          showSearch
                          optionFilterProp="children"
                          notFoundContent="无法找到">
                          {
                            alertList && alertList.length && alertList.map(item =>
                              <Option key={item.name} value={item.groupID}>{item.name}</Option>
                            )
                          }
                        </Select>
                      </FormItem>
                    </Col>
                    <Col offset={1} span={11} className="hintBox">
                      <Icon type="exclamation-circle-o" /> 发生弹性伸缩时会向该通知组发送邮件通知
                    </Col>
                  </Row>
                </Form>
                <Row className="autoScaleBtnGroup">
                  <Col offset={2}>
                    {
                      !isEdit
                        ?
                        <Button key="edit" size="large" type="primary" onClick={() => this.setState({isEdit: true})}>编辑</Button>
                        :
                        [
                          <Button key="cancel" size="large" onClick={this.cancelEdit}>取消</Button>,
                          <Button type="primary" key="save" size="large" loading={btnLoading} onClick={this.saveEdit}>保存</Button>
                        ]
                    }

                  </Col>
                </Row>
              </div>
            </div>
          </TabPane>
          <TabPane tab="伸缩日志" key="autoScaleLogs">
            <AppAutoScaleLogs
              getAutoScaleLogs={getAutoScaleLogs}
              cluster={cluster}
              isCurrentTab={isCurrentTab}
              serviceDetailmodalShow={serviceDetailmodalShow}
              serviceName={serviceName}
            />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

AppAutoScale.propTypes = {
  cluster: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired,
  loadAutoScale: PropTypes.func.isRequired,
  updateAutoScale: PropTypes.func.isRequired,
}

function mapStateToProps(state, props) {

  return {}
}

export default connect(mapStateToProps, {
  loadAutoScale,
  updateAutoScale,
  updateAutoScaleStatus,
  getAutoScaleLogs
})(Form.create()(AppAutoScale))