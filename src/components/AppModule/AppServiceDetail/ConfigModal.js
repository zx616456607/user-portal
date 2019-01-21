/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  ConfigModal
 *
 * v0.1 - 2016/10/27
 * @author ZhaoXueYu
 */

import React, { Component } from 'react'
import { Row, Col, Button, Modal, InputNumber, Icon, Form, Radio } from 'antd'
import { connect } from 'react-redux'
import './style/ConfigModal.less'
import { DEFAULT_CONTAINER_RESOURCES, DEFAULT_CONTAINER_RESOURCES_MEMORY, DEFAULT_CONTAINER_RESOURCES_CPU } from '../../../../constants'
import { changeQuotaService } from '../../../actions/services'
import { getResources } from '../../../../kubernetes/utils'
import NotificationHandler from '../../../components/Notification'
import { isStorageUsed } from '../../../common/tools'
import {
  RESOURCES_MEMORY_MAX,
  RESOURCES_MEMORY_MIN,
  RESOURCES_MEMORY_STEP,
  RESOURCES_CPU_MAX,
  RESOURCES_CPU_STEP,
  RESOURCES_CPU_MIN,
  RESOURCES_CPU_DEFAULT,
  RESOURCES_DIY,
  RESOURCES_GPU_MAX,
  RESOURCES_GPU_MIN,
  RESOURCES_GPU_STEP
} from '../../../constants'
import { ENTERPRISE_MODE } from '../../../../configs/constants'
import { mode } from '../../../../configs/model'
import { relativeTimeRounding } from 'moment';
import ServiceCommonIntl, { AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl,  } from 'react-intl'

const enterpriseFlag = ENTERPRISE_MODE == mode
const PRESET_MEMORY_ARRAY = [512, 1024, 2048, 4096, 8192]
const PRESET_CPU_ARRAY = [0.2, 0.4, 0.8, 1, 2]

function getCPUByMemory(memory) {
  switch (memory.toString()) {
    case '512':
      return '0.1'
    case '1024':
      return '0.2'
    case '2048':
      return '0.4'
    case '4096':
      return '1'
    case '8192':
      return '2'
    default:
      return RESOURCES_CPU_DEFAULT.toString()
  }
}
const FormItem = Form.Item
const RadioGroup = Radio.Group

class ConfigModal extends Component {
  constructor(props) {
    super(props)
    this.selectComposeType = this.selectComposeType.bind(this)
    this.handleConfigOK = this.handleConfigOK.bind(this)
    this.handleConfigCancel = this.handleConfigCancel.bind(this)
    this.state = {
      composeType: parseInt(DEFAULT_CONTAINER_RESOURCES_MEMORY),
      haveRBDVolume: false,
      DIYMemory: RESOURCES_MEMORY_MIN,
      DIYCPU: RESOURCES_CPU_DEFAULT,
      DIYMaxMemory: RESOURCES_MEMORY_MIN,
      DIYMaxCPU: RESOURCES_CPU_DEFAULT
    }
  }

  componentWillReceiveProps(nextProps) {
    const { service, visible } = nextProps
    if (!service) {
      return
    }
    if (!visible) {
      return
    }
    if(nextProps.visible == this.props.visible) return
    let resources = service.spec.template.spec.containers[0].resources || DEFAULT_CONTAINER_RESOURCES
    let limits = resources.limits || DEFAULT_CONTAINER_RESOURCES.limits
    let requests = resources.requests || DEFAULT_CONTAINER_RESOURCES.requests
    let limitsMemory = limits.memory || DEFAULT_CONTAINER_RESOURCES.limits.memory
    let requestsMemory = requests.memory || DEFAULT_CONTAINER_RESOURCES.requests.memory
    let limitsCPU = limits.cpu || DEFAULT_CONTAINER_RESOURCES.limits.cpu
    let requestsCPU = requests.cpu
    limitsMemory = this.formatMemory(limitsMemory)
    requestsMemory = this.formatMemory(requestsMemory)
    limitsCPU = this.formatCPU(limitsCPU)
    requestsCPU = this.formatCPU(requestsCPU)

    let composeType = limitsMemory
    const memoryIndex = PRESET_MEMORY_ARRAY.indexOf(composeType)
    if ( memoryIndex < 0 || PRESET_CPU_ARRAY[memoryIndex] !== requestsCPU || limitsMemory !== requestsMemory) {
      composeType = RESOURCES_DIY
    }
    this.setState({
      composeType,
      haveRBDVolume: isStorageUsed(service.spec.template.spec.volumes),
      DIYMemory: requestsMemory,
      DIYCPU: requestsCPU,
      DIYMaxMemory: limitsMemory,
      DIYMaxCPU: limitsCPU
    })
  }

  formatMemory(memory) {
    if (memory.indexOf('Gi') > -1) {
      memory = parseInt(memory) * 1024
    } else {
      memory = parseInt(memory)
    }
    return memory
  }

  formatCPU(cpu) {
    if (cpu.indexOf('m') > -1) {
      cpu = parseInt(cpu)
      cpu /= 1000
    } else {
      cpu = parseFloat(cpu)
    }
    return cpu
  }
  selectComposeType(type) {
    this.setState({
      composeType: type
    })
  }

  handleConfigOK() {
    const { formatMessage } = this.props.intl
    const {
      parentScope,
      cluster,
      service,
      appName,
      loadServiceList,
      changeQuotaService
    } = this.props
    const { DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU } = this.state
    const { composeType } = this.state
    const serviceName = service.metadata.name
    const { getFieldValue } = this.props.form
    let resources
    const gpu = getFieldValue('GPULimits')
    if (getFieldValue('operaConfig') === 'X86') {
      resources = getResources(composeType)
      if (composeType === RESOURCES_DIY) {
        resources = getResources(DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU)
      }
    } else if (getFieldValue('operaConfig') === 'GPU') {
      resources = getResources(DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU)
      resources.requests.gpu = 1
      resources.limits.gpu = gpu
    }
    const { requests, limits } = resources
    let notification = new NotificationHandler()
    notification.spin(formatMessage(AppServiceDetailIntl.changeConfig, { serviceName }))
    changeQuotaService(cluster, serviceName, { requests, limits }, {
      success: {
        func: (res) => {
          loadServiceList(cluster, appName)
          parentScope.setState({
            configModal: false
          })
          if(res.data.code == 200) {
            notification.close()
            notification.success(formatMessage(AppServiceDetailIntl.changeConfigSuccess, { serviceName }))
          } else {
            notification.close()
            notification.warn(formatMessage(AppServiceDetailIntl.changeConfigFailure, { serviceName }))
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.close()
          notification.warn(formatMessage(AppServiceDetailIntl.changeConfigFailure, { serviceName }))
        }
      }
    })
  }

  handleConfigCancel() {
    const { parentScope } = this.props
    parentScope.setState({
      configModal: false
    })
  }

  changeDIYMemory = value => {
    const { DIYMaxMemory } = this.state
    this.setState({
      DIYMemory: value
    })
    if (value > DIYMaxMemory) {
      this.setState({
        DIYMaxMemory: value
      })
    }
  }

  changeDIYCPU = value => {
    const { DIYMaxCPU }  = this.state
    this.setState({
      DIYCPU: value
    })
    if (value > DIYMaxCPU) {
      this.setState({
        DIYMaxCPU: value
      })
    }
  }
  render() {
    const { formatMessage } = this.props.intl
    const { service, visible, form } = this.props
    const { getFieldProps, getFieldValue } = form
    const { DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU, composeType } = this.state
    if (!visible) {
      return null
    }
    const modalFooter = [
      <Button key="back" type="ghost" size="large" onClick={this.handleConfigCancel}>
        {formatMessage(ServiceCommonIntl.cancel)}
      </Button>,
      <Button
        key="submit" type="primary" size="large" loading={this.state.loading}
        onClick={this.handleConfigOK}>
        {formatMessage(ServiceCommonIntl.save)}
      </Button>
    ]
    const GPULimitsProps = getFieldProps('GPULimits', {
      initialValue: RESOURCES_GPU_MIN,
      // onChange: this.maxGpuChange
    })
    return (
      <Modal
        visible={visible}
        title={formatMessage(AppServiceDetailIntl.changeServiceConfig)}
        onOk={this.handleConfigOK}
        onCancel={this.handleConfigCancel}
        width="600px"
        footer={modalFooter}>
        <div id="ConfigModal">
          <Row className="serviceName">
            <Col className="itemTitle" span={3} style={{ textAlign: 'left' }}>{formatMessage(AppServiceDetailIntl.serviceName)}</Col>
            <Col className="itemBody" span={21}>
              {service.metadata.name}
            </Col>
          </Row>
          <Row>
            <Col className="itemTitle" span={3} style={{ textAlign: 'left', height: 32, lineHeight: 3 }}>
              {formatMessage(AppServiceDetailIntl.choiceConfig)}
            </Col>
            <Col className="itemBody" span={21}>
              <div className="operaBox">
              <FormItem style={{ marginBottom: 0 }}>
                <RadioGroup {...getFieldProps('operaConfig', { initialValue: 'X86' })}>
                  <Radio key="X86" value="X86">{formatMessage(AppServiceDetailIntl.x86caculate)}</Radio>
                  <Radio key="GPU" value="GPU">{formatMessage(AppServiceDetailIntl.highPerformancecalculate)}</Radio>
                </RadioGroup>
              </FormItem>
              {
                getFieldValue('operaConfig') === 'X86' ?
                  <div className="selectCompose">
                    <ul className="composeList">
                      {/*<li className="composeDetail">
                        <Button type={composeType == 256 ? "primary" : "ghost"}
                          onClick={() => this.selectComposeType(256)}>
                          <div className="topBox">
                            1X
                          </div>
                          <div className="bottomBox">
                            <span>256M&nbsp;内存</span><br />
                            <span>1CPU&nbsp;(共享)</span>
                          </div>
                        </Button>
                      </li>*/}
                      <li className="composeDetail">
                        <Button type={composeType == 512 ? "primary" : "ghost"}
                          onClick={() => this.selectComposeType(512)}>
                          <div className="topBox">
                            2X
                          </div>
                          <div className="bottomBox">
                            <span>512M&nbsp;{formatMessage(ServiceCommonIntl.memory)}</span><br />
                            <span>0.2~1CPU</span>
                            <div className="triangle"></div>
                            <Icon type="check" />
                          </div>
                        </Button>
                      </li>
                      <li className="composeDetail">
                        <Button type={composeType == 1024 ? "primary" : "ghost"}
                          onClick={() => this.selectComposeType(1024)}>
                          <div className="topBox">
                            4X
                          </div>
                          <div className="bottomBox">
                            <span>1GB&nbsp;{formatMessage(ServiceCommonIntl.memory)}</span><br />
                            <span>0.4~1CPU</span>
                            <div className="triangle"></div>
                            <Icon type="check" />
                          </div>
                        </Button>
                      </li>
                      <li className="composeDetail">
                        <Button type={composeType == 2048 ? "primary" : "ghost"}
                          onClick={() => this.selectComposeType(2048)}>
                          <div className="topBox">
                            8X
                          </div>
                          <div className="bottomBox">
                            <span>2GB&nbsp;{formatMessage(ServiceCommonIntl.memory)}</span><br />
                            <span>0.8~1CPU</span>
                            <div className="triangle"></div>
                            <Icon type="check" />
                          </div>
                        </Button>
                      </li>
                      <li className="composeDetail">
                        <Button type={composeType == 4096 ? "primary" : "ghost"}
                          onClick={() => this.selectComposeType(4096)}>
                          <div className="topBox">
                            16X
                          </div>
                          <div className="bottomBox">
                            <span>4GB&nbsp;{formatMessage(ServiceCommonIntl.memory)}</span><br />
                            <span>1CPU</span>
                            <div className="triangle"></div>
                            <Icon type="check" />
                          </div>
                        </Button>
                      </li>
                      <li className="composeDetail">
                        <Button type={composeType == 8192 ? "primary" : "ghost"}
                          onClick={() => this.selectComposeType(8192)}>
                          <div className="topBox">
                            32X
                          </div>
                          <div className="bottomBox">
                            <span>8GB&nbsp;{formatMessage(ServiceCommonIntl.memory)}</span><br />
                            <span>2CPU</span>
                            <div className="triangle"></div>
                            <Icon type="check" />
                          </div>
                        </Button>
                      </li>
                      {
                        enterpriseFlag &&
                        <li className="composeDetail DIY">
                          <div
                            className={
                              composeType == RESOURCES_DIY
                              ? "btn ant-btn-primary"
                              : "btn ant-btn-ghost"
                            }
                            onClick={()=> this.selectComposeType(RESOURCES_DIY)}>
                            <div className="topBox">
                              {formatMessage(ServiceCommonIntl.userDefined)}
                            </div>
                            <div className="bottomBox">
                              <Row>
                                <Col span={8}>
                                  <InputNumber
                                    onChange={value => this.changeDIYMemory(value)}
                                    value={parseInt(DIYMemory)}
                                    defaultValue={RESOURCES_MEMORY_MIN}
                                    step={RESOURCES_MEMORY_STEP}
                                    min={RESOURCES_MEMORY_MIN}
                                    max={RESOURCES_MEMORY_MAX} />
                                </Col>
                                <Col span={1} style={{ lineHeight: '32px' }}>~</Col>
                                <Col span={8}>
                                  <InputNumber
                                    onChange={(value) => this.setState({DIYMaxMemory: value})}
                                    value={parseInt(DIYMaxMemory)}
                                    defaultValue={RESOURCES_MEMORY_MIN}
                                    step={RESOURCES_MEMORY_STEP}
                                    min={DIYMemory}
                                    max={RESOURCES_MEMORY_MAX} />
                                </Col>
                                <Col span={7} style={{ lineHeight: '32px' }}>MB&nbsp;{formatMessage(ServiceCommonIntl.memory)}</Col>
                              </Row>
                              <Row>
                                <Col span={8}>
                                  <InputNumber
                                    onChange={value => this.changeDIYCPU(value)}
                                    value={DIYCPU}
                                    step={RESOURCES_CPU_STEP}
                                    min={RESOURCES_CPU_MIN}
                                    max={RESOURCES_CPU_MAX}/>
                                </Col>
                                <Col span={1} style={{ lineHeight: '32px' }}>~</Col>
                                <Col span={8}>
                                  <InputNumber
                                    onChange={(value) => this.setState({DIYMaxCPU: value})}
                                    value={DIYMaxCPU}
                                    step={RESOURCES_CPU_STEP}
                                    min={DIYCPU}
                                    max={RESOURCES_CPU_MAX}/>
                                </Col>
                                <Col span={7} style={{ lineHeight: '32px' }}>{formatMessage(ServiceCommonIntl.core)} CPU</Col>
                              </Row>
                              <div className="triangle"></div>
                              <Icon type="check" />
                            </div>
                          </div>
                        </li>
                      }
                    </ul>
                    <div style={{ clear: "both" }}></div>
                  </div>
                :
                <div className="composeDetail" style={{ margin: 0 }} >
                  <div style={{ width: 250, textAlign: 'center',
                      border: '1px solid #2db7f5',
                      position: 'relative',
                      borderRadius: 6 }}
                      className='ant-btn-primary'>
                    <div className="topBox" style={{ background: '#2db7f5', color: '#fff' }}>
                      {formatMessage(ServiceCommonIntl.userDefined)}
                    </div>
                    <div className="bottomBox" style={{ height: 105, padding: 5 }}>
                      <Row>
                        <Col span={8}>
                          <InputNumber
                            onChange={value => this.changeDIYMemory(value)}
                            value={parseInt(DIYMemory)}
                            defaultValue={RESOURCES_MEMORY_MIN}
                            step={RESOURCES_MEMORY_STEP}
                            min={RESOURCES_MEMORY_MIN}
                            max={RESOURCES_MEMORY_MAX} />
                        </Col>
                        <Col span={2} style={{ lineHeight: '32px' }}>~</Col>
                        <Col span={8}>
                          <InputNumber
                            onChange={(value) => this.setState({DIYMaxMemory: value})}
                            value={parseInt(DIYMaxMemory)}
                            defaultValue={RESOURCES_MEMORY_MIN}
                            step={RESOURCES_MEMORY_STEP}
                            min={DIYMemory}
                            max={RESOURCES_MEMORY_MAX} />
                        </Col>
                        <Col span={6} style={{ lineHeight: '32px' }}>MB&nbsp;{formatMessage(ServiceCommonIntl.memory)}</Col>
                      </Row>
                      <Row>
                        <Col span={8}>
                          <InputNumber
                            onChange={value => this.changeDIYCPU(value)}
                            value={DIYCPU}
                            step={RESOURCES_CPU_STEP}
                            min={RESOURCES_CPU_MIN}
                            max={RESOURCES_CPU_MAX}/>
                        </Col>
                        <Col span={2} style={{ lineHeight: '32px' }}>~</Col>
                        <Col span={8}>
                          <InputNumber
                            onChange={(value) => this.setState({DIYMaxCPU: value})}
                            value={DIYMaxCPU}
                            step={RESOURCES_CPU_STEP}
                            min={DIYCPU}
                            max={RESOURCES_CPU_MAX}/>
                        </Col>
                        <Col span={6} style={{ lineHeight: '32px' }}>{formatMessage(ServiceCommonIntl.core)} CPU</Col>
                      </Row>
                      <Row>
                        <Col span={8}>
                          <InputNumber
                            onChange={value => this.changeDIYGPU(value)}
                            value={RESOURCES_GPU_MIN}
                            disabled
                            step={RESOURCES_GPU_STEP}
                            min={RESOURCES_GPU_STEP}
                            max={RESOURCES_GPU_MAX}/>
                        </Col>
                        <Col span={2} style={{ lineHeight: '32px' }}>~</Col>
                        <Col span={8}>
                          <InputNumber
                            onChange={(value) => this.setState({DIYMaxCPU: value})}
                            {...GPULimitsProps}
                            step={RESOURCES_GPU_STEP}
                            min={RESOURCES_GPU_STEP}
                            max={RESOURCES_GPU_MAX}/>
                        </Col>
                        <Col span={6} style={{ lineHeight: '32px' }}>{formatMessage(ServiceCommonIntl.cases)} GPU</Col>
                      </Row>
                      <div className="triangle"></div>
                      <Icon type="check" />
                    </div>
                  </div>
                </div>
              }
              </div>
            </Col>
          </Row>
          <Row>
            <Col style={{ color: '#a0a0a0', textAlign: 'left', marginTop: '20px' }}>
              {formatMessage(AppServiceDetailIntl.rebootAllServiceInfo)}{this.state.haveRBDVolume ? formatMessage(AppServiceDetailIntl.serviceNotSupportReboot) : formatMessage(AppServiceDetailIntl.rollupUpgrade)}
            </Col>
          </Row>
        </div>
      </Modal>
    )
  }
}

function mapStateToProps(state, props) {
  const {
    changeQuotaService,
  } = state.services
  return {
    changeQuota: changeQuotaService
  }
}

export default injectIntl(connect(mapStateToProps, {
  changeQuotaService,
})(Form.create()(ConfigModal)), { withRef: true, })
