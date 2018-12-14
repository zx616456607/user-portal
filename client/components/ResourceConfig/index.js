/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * resourceConfig component
 *
 * v0.1 - 2018-07-12
 * @author zhouhaitao
 */

import React from 'react'
import { Row, Col, Form, Icon, InputNumber } from 'antd'
import './index.less'
import {
  RESOURCES_CPU_DEFAULT,
  RESOURCES_CPU_MAX,
  RESOURCES_CPU_MIN, RESOURCES_CPU_STEP,
  RESOURCES_MEMORY_MAX, RESOURCES_MEMORY_MIN,
  RESOURCES_MEMORY_STEP,
} from '../../../src/constants'
import classNames from 'classnames'
const FormItem = Form.Item
class ResourceConfig extends React.Component {
  getCustomValue = (maxMemory, minMemory, maxCPU, minCPU) => {
    const { getFieldValue } = this.props.form
    const maxMemoryValue = maxMemory || getFieldValue('DIYMaxMemory')
    const minMemoryValue = minMemory || getFieldValue('DIYMinMemory')
    const maxCPUValue = maxCPU || getFieldValue('DIYMaxCPU')
    const minCPUValue = minCPU || getFieldValue('DIYMinCPU')
    const value = { maxMemoryValue, minMemoryValue, maxCPUValue, minCPUValue }
    return value
  }

  selectComposeType(type) {
    if (type === 512) {
      const value = {
        maxMemoryValue: 512,
        minMemoryValue: 512,
        maxCPUValue: 1,
        minCPUValue: 0.2,
      }
      this.props.onValueChange(value)
    }
    if (type === 1024) {
      const value = {
        maxMemoryValue: 1024,
        minMemoryValue: 1024,
        maxCPUValue: 1,
        minCPUValue: 0.4,
      }
      this.props.onValueChange(value)
    }
    if (type === 'DIY') {
      this.props.onValueChange(this.getCustomValue())
    }
    this.props.toggleComposeType(type)
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
        DIYMaxMemory: value,
      })
    }
    // 获取所有值传递出去
    this.props.onValueChange(this.getCustomValue(null, value, null, null))
  }

  DIYMaxMemoryChange = value => {
    // 获取所有值传递出去
    this.props.onValueChange(this.getCustomValue(value, null, null, null))
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
        DIYMaxCPU: value,
      })
    }
    // 获取所有值传递出去
    this.props.onValueChange(this.getCustomValue(null, null, null, value))
  }

  DIYMaxCPUChange = value => {
    // 获取所有值传递出去
    this.props.onValueChange(this.getCustomValue(null, null, value, null))

  }

  DIYMaxCPUCheck = (rules, value, callback) => {
    if (!value) {
      return callback('最大CPU不能为空')
    }
    callback()
  }

  reset = () => {
    this.props.form.resetFields()
  }
  render() {
    const { freeze, composeType, should4X } = this.props
    const { value } = this.props || { value: {} }
    const { maxCPUValue, maxMemoryValue, minCPUValue, minMemoryValue } = value || {
      maxCPUValue: '',
      maxMemoryValue: '',
      minCPUValue: '',
      minMemoryValue: '',
    }

    const { getFieldProps, getFieldValue } = this.props.form
    // 集群配置相关
    const DIYMinMemoryProps = getFieldProps('DIYMinMemory', {
      rules: [
        {
          validator: this.DIYMinMemoryCheck,
        },
      ],
      initialValue: minMemoryValue || (should4X ? 512 : RESOURCES_MEMORY_MIN),
      onChange: this.DIYMinMemoryChange,
    })
    const DIYMaxMemoryProps = getFieldProps('DIYMaxMemory', {
      rules: [
        {
          validator: this.DIYMaxMemoryCheck,
        },
      ],
      initialValue: maxMemoryValue || (should4X ? 1024 : RESOURCES_MEMORY_MIN),
      onChange: this.DIYMaxMemoryChange,
    })
    const DIYMinCPUProps = getFieldProps('DIYMinCPU', {
      rules: [
        {
          validator: this.DIYMinCPUCheck,
        },
      ],
      initialValue: minCPUValue || (should4X ? 0.5 : RESOURCES_CPU_DEFAULT),
      onChange: this.DIYMinCPUChange,
    })
    const DIYMaxCPUProps = getFieldProps('DIYMaxCPU', {
      rules: [
        {
          validator: this.DIYMaxCPUCheck,
        },
      ],
      initialValue: maxCPUValue || (should4X ? 1 : RESOURCES_CPU_DEFAULT),
      onChange: this.DIYMaxCPUChange,
    })
    const edit = <Col span={18} className="configBox">
      <div className={classNames('configItems DIY', {
        'btn ant-btn-primary': composeType === 512 || composeType === 1024,
        'btn ant-btn-ghost': composeType !== 512 && composeType !== 1024,
      })}
      onClick={!freeze ? () => this.selectComposeType(should4X ? 1024 : 512) : () => {}}>
        <div className="resourceLimitTitleBox">
          {should4X ? '4X' : '2X'}
        </div>
        <div className="contentBox">
          <span>{should4X ? '1G' : '512 MB'} 内存</span><br />
          <span>{should4X ? '0.4' : '0.2'}-1 核 CPU</span>
          <div className="triangle"/>
          <Icon type="check" />
        </div>
      </div>
      <div className={classNames('configItems DIY', {
        'btn ant-btn-primary': composeType === 'DIY',
        'btn ant-btn-ghost': composeType !== 'DIY',
      })} onClick={!freeze ? () => this.selectComposeType('DIY') : () => {}}>
        <div className="resourceLimitTitleBox">
          自定义
        </div>
        <div className="contentBox">
          <Row>
            <Col span={8}>
              <FormItem>
                <InputNumber
                  disabled={freeze}
                  {...DIYMinMemoryProps}
                  size="small"
                  step={RESOURCES_MEMORY_STEP}
                  min={should4X ? 512 : RESOURCES_MEMORY_MIN}
                  max={RESOURCES_MEMORY_MAX} />
              </FormItem>
            </Col>
            <Col span={1} style={{ lineHeight: '32px' }}>~</Col>
            <Col span={8}>
              <FormItem>
                <InputNumber
                  disabled={freeze}
                  {...DIYMaxMemoryProps}
                  size="small"
                  step={RESOURCES_MEMORY_STEP}
                  min={should4X ? 1024 : getFieldValue('DIYMinMemory')}
                  max={RESOURCES_MEMORY_MAX} />
              </FormItem>
            </Col>
            <Col span={7} style={{ lineHeight: '32px' }}>MB&nbsp;内存</Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem>
                <InputNumber
                  disabled={freeze}
                  {...DIYMinCPUProps}
                  size="small"
                  step={RESOURCES_CPU_STEP}
                  min={should4X ? 0.5 : RESOURCES_CPU_MIN}
                  max={RESOURCES_CPU_MAX}/>
              </FormItem>
            </Col>
            <Col span={1} style={{ lineHeight: '32px' }}>~</Col>
            <Col span={8}>
              <FormItem>
                <InputNumber
                  disabled={freeze}
                  {...DIYMaxCPUProps}
                  size="small"
                  step={RESOURCES_CPU_STEP}
                  min={should4X ? 1 : getFieldValue('DIYMinCPU')}
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
    const freezed = <Col span={18} className="configBox">
      <div className={classNames('configItems DIY', {
        'btn ant-btn-primary': composeType === 512 || composeType === 1024,
        'btn ant-btn-disabled': composeType !== 512 && composeType !== 1024,
      })}>
        <div className="resourceLimitTitleBox">
          {should4X ? '4X' : '2X'}
        </div>
        <div className="contentBox">
          <span>{should4X ? '1G' : '512 MB'} 内存</span><br />
          <span>{should4X ? '0.4' : '0.2'}-1 核 CPU</span>
          <div className="triangle"/>
          <Icon type="check" />
        </div>
      </div>
      <div className={classNames('configItems DIY', {
        'btn ant-btn-primary': composeType === 'DIY',
        'btn ant-btn-disabled': composeType !== 'DIY',
      })}>
        <div className="resourceLimitTitleBox">
          自定义
        </div>
        <div className="contentBox">
          <Row>
            <Col span={8}>
              <FormItem>
                <InputNumber
                  disabled={freeze}
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
                  disabled={freeze}
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
                  disabled={freeze}
                  {...DIYMinCPUProps}
                  size="small"
                  step={RESOURCES_CPU_STEP}
                  min={parseInt(RESOURCES_CPU_MIN)}
                  max={parseInt(RESOURCES_CPU_MAX)}/>
              </FormItem>
            </Col>
            <Col span={1} style={{ lineHeight: '32px' }}>~</Col>
            <Col span={8}>
              <FormItem>
                <InputNumber
                  disabled={freeze}
                  {...DIYMaxCPUProps}
                  size="small"
                  step={RESOURCES_CPU_STEP}
                  min={parseInt(getFieldValue('DIYMinCPU'))}
                  max={parseInt(RESOURCES_CPU_MAX)}/>
              </FormItem>
            </Col>
            <Col span={7} style={{ lineHeight: '32px' }}>核 CPU</Col>
          </Row>
          <div className="triangle"/>
          <Icon type="check" />
        </div>
      </div>
    </Col>
    return <div className="resourceConfig">
      <Form className="commonBox config">
        { freeze ? freezed : edit }
      </Form>
    </div>
  }
}

export default Form.create()(ResourceConfig)
