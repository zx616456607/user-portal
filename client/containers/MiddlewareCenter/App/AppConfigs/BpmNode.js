/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Bpm of app config
 *
 * @author zhangxuan
 * @date 2018-09-08
 */
import React from 'react'
import TenxPage from '@tenx-ui/page'
import { Form, Row, Col, Button, Icon, InputNumber, Select, Radio } from 'antd'
import IntlMessage from '../../Intl'
import PanelHeader from './PanelHeader'
import './style/BpmNode.less'
import {
  RESOURCES_CPU_MAX, RESOURCES_CPU_MIN,
  RESOURCES_CPU_STEP, RESOURCES_MEMORY_MAX,
  RESOURCES_MEMORY_MIN,
  RESOURCES_MEMORY_STEP,
  RESOURCES_CPU_DEFAULT,
} from '../../../../../src/constants';
import classNames from 'classnames';

const FormItem = Form.Item
const Option = Select.Option

export default class BpmNode extends React.PureComponent {
  state = {
    composeType: 512,
  }

  selectComposeType = type => {
    this.setState({
      composeType: type,
    })
  }

  minMemoryChange = value => {
    const { getFieldsValue, setFieldsValue } = this.props.form
    const { DIYMaxMemory } = getFieldsValue()
    if (value > DIYMaxMemory) {
      setFieldsValue({
        DIYMaxMemory: value,
      })
    }
  }

  minCpuChange = value => {
    const { getFieldsValue, setFieldsValue } = this.props.form
    const { DIYMaxCpu } = getFieldsValue()
    if (value > DIYMaxCpu) {
      setFieldsValue({
        DIYMaxCpu: value,
      })
    }
  }

  checkReplicas(rule, value, callback) {
    const { intl } = this.props
    if (!value) {
      callback()
    }
    if (value < 1 || value > 10) {
      return callback(intl.formatMessage(IntlMessage.replicaLengthLimit))
    }
    callback()
  }

  render() {
    const { composeType } = this.state
    const { formItemLayout, intl, form } = this.props
    const { getFieldProps, getFieldValue } = form
    const accessMethod = getFieldValue('accessMethod')
    const DIYMinMemoryProps = getFieldProps('DIYMinMemory', {
      initialValue: RESOURCES_MEMORY_MIN,
      onChange: this.minMemoryChange,
    })
    const DIYMaxMemoryProps = getFieldProps('DIYMaxMemory', {
      initialValue: RESOURCES_MEMORY_MIN,
    })
    const DIYMinCPUProps = getFieldProps('DIYMinCPU', {
      initialValue: RESOURCES_CPU_DEFAULT,
      onChange: this.minCpuChange,
    })
    const DIYMaxCPUProps = getFieldProps('DIYMaxCpu', {
      initialValue: RESOURCES_CPU_DEFAULT,
    })
    const replicasProps = getFieldProps('replicas', {
      rules: [
        { required: true, message: intl.formatMessage(IntlMessage.replicaLengthLimit) },
        { validator: this.checkReplicas },
      ],
      initialValue: 1,
    })
    const accessMethodProps = getFieldProps('accessMethod', {
      initialValue: 'PublicNetwork',
    })
    return (
      <TenxPage inner className="bpm-node-config">
        <PanelHeader
          title={intl.formatMessage(IntlMessage.bpmNodeTitle)}
        />
        <div className="form-field-box">
          <Row className="configRow">
            <Col span={formItemLayout.labelCol.span}>
              {intl.formatMessage(IntlMessage.containerConfig)}
            </Col>
            <Col span={formItemLayout.wrapperCol.span} className="configBox">
              <Button className="configList" type={composeType === 512 ? 'primary' : 'ghost'}
                onClick={() => this.selectComposeType(512)}>
                <div className="topBox">
                  2X
                </div>
                <div className="bottomBox">
                  <span>512 MB {intl.formatMessage(IntlMessage.memory)}</span><br />
                  <span>0.1 {intl.formatMessage(IntlMessage.core)} CPU</span>
                  <div className="triangle"/>
                  <Icon type="check" />
                </div>
              </Button>
              <div className={classNames('configList DIY', {
                'btn ant-btn-primary': composeType === 'DIY',
                'btn ant-btn-ghost': composeType !== 'DIY',
              })} onClick={() => this.selectComposeType('DIY')}>
                <div className="topBox">
                  {intl.formatMessage(IntlMessage.customize)}
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
                    <Col span={7} style={{ lineHeight: '32px' }}>MB&nbsp;{intl.formatMessage(IntlMessage.memory)}</Col>
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
                    <Col span={7} style={{ lineHeight: '32px' }}>{intl.formatMessage(IntlMessage.core)} CPU</Col>
                  </Row>
                  <div className="triangle"/>
                  <Icon type="check" />
                </div>
              </div>
            </Col>
          </Row>
          <FormItem
            label={intl.formatMessage(IntlMessage.instanceNum)}
            {...formItemLayout}
          >
            <InputNumber
              min={1} max={10}
              {...replicasProps}
            />
            <span className="unit">{intl.formatMessage(IntlMessage.one)}</span>
          </FormItem>
          <FormItem
            label={intl.formatMessage(IntlMessage.sharedStorage)}
            {...formItemLayout}
          >
            <Col span={10}>
              <FormItem>
                <Select
                  style={{ width: '100%' }}
                  placeholder={intl.formatMessage(IntlMessage.pleaseSelect, {
                    item: intl.formatMessage(IntlMessage.storageType),
                  })}
                >
                  <Option value="nfs">NFS</Option>
                  <Option value="glusterfs">GlusterFS</Option>
                </Select>
              </FormItem>
            </Col>
            <Col span={10} offset={2}>
              <FormItem>
                <Select
                  style={{ width: '100%' }}
                  placeholder={intl.formatMessage(IntlMessage.pleaseSelect, {
                    item: intl.formatMessage(IntlMessage.storageCluster),
                  })}
                >
                  <Option value="nfs">NFS</Option>
                  <Option value="glusterfs">GlusterFS</Option>
                </Select>
              </FormItem>
            </Col>
          </FormItem>
          <FormItem
            label={intl.formatMessage(IntlMessage.accessMethod)}
            {...formItemLayout}
          >
            <Radio.Group {...accessMethodProps}>
              <Radio value="PublicNetwork" key="PublicNetwork">
                {intl.formatMessage(IntlMessage.publicNetAccess)}
              </Radio>
              <Radio value="InternalNetwork" key="InternalNetwork">
                {intl.formatMessage(IntlMessage.intranetAccess)}
              </Radio>
            </Radio.Group>
          </FormItem>
          <FormItem
            label={' '}
            {...formItemLayout}
          >
            <p className="ant-form-text hintColor">
              {
                accessMethod === 'PublicNetwork' ?
                  intl.formatMessage(IntlMessage.publicTip) :
                  intl.formatMessage(IntlMessage.internalTip)
              }
            </p>
          </FormItem>
          {
            accessMethod === 'PublicNetwork' ?
              <FormItem
                label={' '}
                {...formItemLayout}
              >
                <Select
                  style={{ width: 200 }}
                  {...getFieldProps('publicNetwork', {
                    initialValue: '',
                    rules: [{
                      required: true, message: intl.formatMessage(IntlMessage.plsSltNexport),
                    }],
                  })}
                  placeholder={intl.formatMessage(IntlMessage.pleaseSelect, {
                    item: intl.formatMessage(IntlMessage.nexport),
                  })}
                >
                  <Option key={'public1'}>public1</Option>
                  <Option key={'public2'}>public2</Option>
                </Select>
              </FormItem> :
              <FormItem
                label={' '}
                {...formItemLayout}
              >
                <Select
                  style={{ width: 200 }}
                  {...getFieldProps('internalNetwork', {
                    initialValue: '',
                    rules: [{
                      required: true, message: intl.formatMessage(IntlMessage.plsSltNexport),
                    }],
                  })}
                  placeholder={intl.formatMessage(IntlMessage.pleaseSelect, {
                    item: intl.formatMessage(IntlMessage.nexport),
                  })}
                >
                  <Option key={'internal1'}>internal1</Option>
                  <Option key={'internal'}>internal2</Option>
                </Select>
              </FormItem>
          }
        </div>
      </TenxPage>
    )
  }
}

