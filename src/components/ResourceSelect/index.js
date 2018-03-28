/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Resource select
 *
 * v0.1 - 2017-05-08
 * @author Zhangpc
 */

import React, { PropTypes, Component } from 'react'
import { Input, Button, Icon, InputNumber, Form, Row, Col, Radio  } from 'antd'
import classNames from 'classnames'
import {
  RESOURCES_MEMORY_MAX,
  RESOURCES_MEMORY_MIN,
  RESOURCES_MEMORY_STEP,
  RESOURCES_CPU_MAX,
  RESOURCES_CPU_STEP,
  RESOURCES_CPU_MIN,
  RESOURCES_CPU_DEFAULT,
  RESOURCES_DIY,
  DEFAULT_ALGORITHM,
  RESOURCES_GPU_MAX,
  RESOURCES_GPU_MIN,
  RESOURCES_GPU_STEP
} from '../../constants'
import './style/index.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group

export default class ResourceSelect extends Component {
  static propTypes = {
    standardFlag: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super()
    this.selectResourceType = this.selectResourceType.bind(this)
    const { resourceType, DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU } = props
    this.state = {
      resourceType: resourceType || 512,
      DIYMemory: DIYMemory || RESOURCES_MEMORY_MIN,
      DIYCPU: DIYCPU || RESOURCES_CPU_DEFAULT,
      DIYMaxMemory: DIYMaxMemory || RESOURCES_MEMORY_MIN,
      DIYMaxCPU: DIYMaxCPU || RESOURCES_CPU_DEFAULT,
      resourceAlgorithm: DEFAULT_ALGORITHM,
    }
  }

  componentWillMount() {
    const { onChange } = this.props
    onChange(this.state)
  }

  componentWillReceiveProps(nextProps) {
    const { resourceType } = nextProps
    if (resourceType === this.props.resourceType) {
      return
    }
    this.setState({
      resourceType: resourceType || 512,
    })
  }

  selectResourceType(type) {
    this.setState({
      resourceType: type
    })
    const { DIYMemory, DIYCPU } = this.state
    this.props.onChange({
      resourceType: type,
    })
  }

  render() {
    const {
      standardFlag, DIYMemoryProps, DIYCPUProps, DIYMaxMemoryProps, DIYMaxCPUProps,
      GPURequestProps, GPULimitsProps, algorithmProps, memoryMin, cpuMin, form
      } = this.props
    const { resourceType, DIYMemory, DIYCPU } = this.state
    const { getFieldProps } = form;
    return (
      <div className="resourceSelect">
        <FormItem>
          <RadioGroup {...algorithmProps}>
            <Radio key="X86" value="X86">X86 计算</Radio>
            <Radio key="GPU" value="GPU">高性能计算 GPU</Radio>
          </RadioGroup>
        </FormItem>
        <ul className={classNames("resourceList", {
          'hidden': algorithmProps.value !== DEFAULT_ALGORITHM
        })}>
          {/*<li className="resourceDetail">
            <Button type={resourceType == 256 ? "primary" : "ghost"}
              onClick={() => this.selectResourceType(256)}>
              <div className="topBox">
                1X
              </div>
              <div className="bottomBox">
                <span>256M&nbsp;内存</span><br />
                <span>1CPU&nbsp;(共享)</span>
              </div>
            </Button>
          </li>*/}
          <li className="resourceDetail">
            <Button type={resourceType == 512 ? "primary" : "ghost"}
                    onClick={() => this.selectResourceType(512)}>
              <div className="topBox">
                2X
              </div>
              <div className="bottomBox">
                <span>512M&nbsp;内存</span><br />
                <span>0.2~1CPU</span>
                <div className="triangle"></div>
                <Icon type="check" />
              </div>
            </Button>
          </li>
          <li className="resourceDetail">
            <Button type={resourceType == 1024 ? "primary" : "ghost"}
                    onClick={() => this.selectResourceType(1024)}>
              <div className="topBox">
                4X
              </div>
              <div className="bottomBox">
                <span>1GB&nbsp;内存</span><br />
                <span>0.4~1CPU</span>
                <div className="triangle"></div>
                <Icon type="check" />
              </div>
            </Button>
          </li>
          <li className="resourceDetail">
            <Button type={resourceType == 2048 ? "primary" : "ghost"}
                    onClick={() => this.selectResourceType(2048)}>
              <div className="topBox">
                8X
              </div>
              <div className="bottomBox">
                <span>2GB&nbsp;内存</span><br />
                <span>0.8~1CPU</span>
                <div className="triangle"></div>
                <Icon type="check" />
              </div>
            </Button>
          </li>
          <li className="resourceDetail">
            <Button type={resourceType == 4096 ? "primary" : "ghost"}
                    onClick={() => this.selectResourceType(4096)}>
              <div className="topBox">
                16X
              </div>
              <div className="bottomBox">
                <span>4GB&nbsp;内存</span><br />
                <span>1CPU</span>
                <div className="triangle"></div>
                <Icon type="check" />
              </div>
            </Button>
          </li>
          <li className="resourceDetail">
            <Button type={resourceType == 8192 ? "primary" : "ghost"}
                    onClick={() => this.selectResourceType(8192)}>
              <div className="topBox">
                32X
              </div>
              <div className="bottomBox">
                <span>8GB&nbsp;内存</span><br />
                <span>2CPU</span>
                <div className="triangle"></div>
                <Icon type="check" />
              </div>
            </Button>
          </li>
          {
            !standardFlag &&
            <li className="resourceDetail DIY">
              <div
                className={
                  resourceType == RESOURCES_DIY
                    ? "btn ant-btn-primary"
                    : "btn ant-btn-ghost"
                }
                onClick={()=> this.selectResourceType(RESOURCES_DIY)}>
                <div className="topBox">
                  自定义
                </div>
                <div className="bottomBox">
                  <Row>
                    <Col span={8}>
                      <FormItem>
                        <InputNumber
                          {...DIYMemoryProps}
                          step={RESOURCES_MEMORY_STEP}
                          min={RESOURCES_MEMORY_MIN}
                          max={RESOURCES_MEMORY_MAX}
                          size="default"/>
                      </FormItem>
                    </Col>
                    <Col span={1} style={{ lineHeight: '32px' }}>~</Col>
                    <Col span={8}>
                      <FormItem>
                        <InputNumber
                          {...DIYMaxMemoryProps}
                          step={RESOURCES_MEMORY_STEP}
                          min={memoryMin}
                          max={RESOURCES_MEMORY_MAX}
                          size="default"
                        />
                      </FormItem>
                    </Col>
                    <Col span={7} style={{ lineHeight: '32px' }}>MB&nbsp;内存</Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem>
                        <InputNumber
                          {...DIYCPUProps}
                          step={RESOURCES_CPU_STEP}
                          min={RESOURCES_CPU_MIN}
                          max={RESOURCES_CPU_MAX}
                          size="default"/>
                      </FormItem>
                    </Col>
                    <Col span={1} style={{ lineHeight: '32px' }}>~</Col>
                    <Col span={8}>
                      <FormItem>
                        <InputNumber
                          {...DIYMaxCPUProps}
                          step={RESOURCES_CPU_STEP}
                          min={cpuMin}
                          max={RESOURCES_CPU_MAX}
                          size="default"
                        />
                      </FormItem>
                    </Col>
                    <Col span={7} style={{ lineHeight: '32px' }}>核 CPU</Col>
                  </Row>
                  <div className="triangle"/>
                  <Icon type="check" />
                </div>
              </div>
            </li>
          }
        </ul>
        <ul className={classNames("resourceList", {
          'hidden': algorithmProps.value === DEFAULT_ALGORITHM
        })}>
          {
            !standardFlag &&
            <li className="resourceDetail DIY GPU">
              <div
                className="btn ant-btn-primary">
                <div className="topBox">
                  自定义
                </div>
                <div className="bottomBox">
                  <Row>
                    <Col span={8}>
                      <FormItem>
                        <InputNumber
                          {...DIYMemoryProps}
                          step={RESOURCES_MEMORY_STEP}
                          min={RESOURCES_MEMORY_MIN}
                          max={RESOURCES_MEMORY_MAX}
                          size="default"/>
                      </FormItem>
                    </Col>
                    <Col span={1} style={{ lineHeight: '32px' }}>~</Col>
                    <Col span={8}>
                      <FormItem>
                        <InputNumber
                          {...DIYMaxMemoryProps}
                          step={RESOURCES_MEMORY_STEP}
                          min={memoryMin}
                          max={RESOURCES_MEMORY_MAX}
                          size="default"
                        />
                      </FormItem>
                    </Col>
                    <Col span={7} style={{ lineHeight: '32px' }}>MB&nbsp;内存</Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem>
                        <InputNumber
                          {...DIYCPUProps}
                          step={RESOURCES_CPU_STEP}
                          min={RESOURCES_CPU_MIN}
                          max={RESOURCES_CPU_MAX}
                          size="default"/>
                      </FormItem>
                    </Col>
                    <Col span={1} style={{ lineHeight: '32px' }}>~</Col>
                    <Col span={8}>
                      <FormItem>
                        <InputNumber
                          {...DIYMaxCPUProps}
                          step={RESOURCES_CPU_STEP}
                          min={cpuMin}
                          max={RESOURCES_CPU_MAX}
                          size="default"
                        />
                      </FormItem>
                    </Col>
                    <Col span={7} style={{ lineHeight: '32px' }}>核 CPU</Col>
                  </Row>
                  <Row>
                  <Col span={8}>
                    <FormItem>
                      <InputNumber
                        disabled
                        value={GPULimitsProps.value}
                        size="default"
                      />
                    </FormItem>
                    </Col>
                    <Col span={1} style={{ lineHeight: '32px' }}>~</Col>
                    <Col span={8}>
                      <FormItem>
                        <InputNumber
                          {...GPULimitsProps}
                          step={RESOURCES_GPU_STEP}
                          min={RESOURCES_GPU_MIN}
                          max={RESOURCES_GPU_MAX}
                          size="default"
                        />
                      </FormItem>
                    </Col>
                    <Col span={7} style={{ lineHeight: '32px' }}>颗 GPU</Col>
                  </Row>
                  <div className="triangle"/>
                  <Icon type="check" />
                </div>
              </div>
              <div className="hintColor">
                * GPU 配置仅支持整数颗，GPU 型号根据不同节点，类型可能不同。
              </div>
            </li>
          }
        </ul>
      </div>
    )
  }
}
