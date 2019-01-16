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
import { connect } from 'react-redux'
import { Form, Row, Col, Button, Icon, InputNumber, Select, Radio } from 'antd'
import isEmpty from 'lodash/isEmpty'
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
import * as storageActions from '../../../../../src/actions/storage'
import * as clusterActions from '../../../../../src/actions/cluster'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { camelize } from 'humps';

const FormItem = Form.Item
const Option = Select.Option

const DEFAULT_REPLICAS = 1

const mapStateToProps = (state, props) => {
  const { clusterID } = props
  const clusterId = camelize(clusterID)
  const nfsList = getDeepValue(state, [ 'cluster', 'clusterStorage', clusterID, 'nfsList' ])
  const proxy = getDeepValue(state, [ 'cluster', 'proxy', 'result', clusterId, 'data' ])
  return {
    nfsList,
    proxy,
  }
}
@connect(mapStateToProps, {
  loadFreeVolume: storageActions.loadFreeVolume,
  getClusterStorageList: clusterActions.getClusterStorageList,
  getProxy: clusterActions.getProxy,
})
export default class BpmNode extends React.PureComponent {
  state = {
    resourceType: 512,
  }

  componentDidMount() {
    this.initBpmNode()
  }

  initBpmNode = async () => {
    const { form, getProxy, clusterID } = this.props
    const { setFieldsValue } = form
    const { resourceType } = this.state
    setFieldsValue({
      resourceType,
      DIYMinMemory: RESOURCES_MEMORY_MIN,
      DIYMinCPU: RESOURCES_CPU_DEFAULT,
      DIYMaxMemory: RESOURCES_MEMORY_MIN,
      DIYMaxCPU: RESOURCES_CPU_DEFAULT,
      replicas: DEFAULT_REPLICAS,
      accessMethod: 'PublicNetwork',
    })
    await getProxy(clusterID)
    const { proxy } = this.props
    let defaultProxy = proxy.filter(item => item.isDefault)
    if (isEmpty(defaultProxy)) {
      return
    }
    defaultProxy = defaultProxy[0]
    this.setProxyFields(defaultProxy)
  }

  setProxyFields = proxy => {
    const { setFieldsValue } = this.props.form
    const fields = {}
    switch (proxy.type) {
      case 'public':
        Object.assign(fields, {
          accessMethod: 'PublicNetwork',
          publicNetwork: proxy.id,
        })
        break
      case 'private':
        Object.assign(fields, {
          accessMethod: 'InternalNetwork',
          internalNetwork: proxy.id,
        })
        break
      default:
        break
    }
    setFieldsValue(fields)
  }

  handleStorage = value => {
    const { loadFreeVolume, clusterID, getClusterStorageList } = this.props
    loadFreeVolume(clusterID, { srtype: 'share', storagetype: value })
    getClusterStorageList(clusterID)
  }

  selectComposeType = type => {
    const { form } = this.props
    const { setFieldsValue } = form
    this.setState({
      resourceType: type,
    })
    setFieldsValue({
      resourceType: type,
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

  checkReplicas = (rule, value, callback) => {
    const { intl } = this.props
    if (!value) {
      callback()
    }
    if (value < 1 || value > 10) {
      return callback(intl.formatMessage(IntlMessage.replicaLengthLimit))
    }
    callback()
  }

  renderProxy = type => {
    const { proxy } = this.props
    if (isEmpty(proxy)) {
      return
    }
    return proxy
      .filter(item => item.type === type)
      .map(item => <Option value={item.id}>{item.name}</Option>)
  }

  accessMethodChange = e => {
    const { proxy } = this.props
    const accessMethod = e.target.value
    const proxyType = accessMethod === 'PublicNetwork' ? 'public' : 'private'
    const currentProxy = proxy.filter(item => item.type === proxyType)[0]
    this.setProxyFields(currentProxy)
  }

  isProxyDisabled = type => {
    const { proxy } = this.props
    if (isEmpty(proxy)) {
      return true
    }
    return proxy.every(item => item.type !== type)
  }

  render() {
    const { resourceType } = this.state
    const { formItemLayout, intl, form, nfsList } = this.props
    const { getFieldProps, getFieldValue } = form
    const accessMethod = getFieldValue('accessMethod')
    const DIYMinMemoryProps = getFieldProps('DIYMinMemory', {
      onChange: this.minMemoryChange,
    })
    const DIYMaxMemoryProps = getFieldProps('DIYMaxMemory', {
    })
    const DIYMinCPUProps = getFieldProps('DIYMinCPU', {
      onChange: this.minCpuChange,
    })
    const DIYMaxCPUProps = getFieldProps('DIYMaxCPU', {
    })
    const replicasProps = getFieldProps('replicas', {
      rules: [
        { required: true, message: intl.formatMessage(IntlMessage.replicaLengthLimit) },
        { validator: this.checkReplicas },
      ],
    })
    const storageType = getFieldProps('storageType', {
      rules: [
        {
          required: true, message: intl.formatMessage(IntlMessage.pleaseSelect, {
            item: intl.formatMessage(IntlMessage.storageType),
          }),
        },
      ],
      onChange: this.handleStorage,
    })
    const storageCluster = getFieldProps('storageCluster', {
      rules: [
        {
          required: true, message: intl.formatMessage(IntlMessage.pleaseSelect, {
            item: intl.formatMessage(IntlMessage.storageCluster),
          }),
        },
      ],
    })
    const accessMethodProps = getFieldProps('accessMethod', {
      rules: [
        {
          required: true,
          message: intl.formatMessage(IntlMessage.pleaseSelect, {
            item: intl.formatMessage(IntlMessage.accessMethod),
            tail: '',
          }),
        },
      ],
      onChange: this.accessMethodChange,
    })
    return (
      <div className="bpm-node-config">
        <PanelHeader
          title={intl.formatMessage(IntlMessage.bpmNodeTitle)}
        />
        <div className="form-field-box">
          <Row className="configRow">
            <Col span={formItemLayout.labelCol.span}>
              {intl.formatMessage(IntlMessage.containerConfig)}
            </Col>
            <Col span={formItemLayout.wrapperCol.span} className="configBox">
              <Button className="configList" type={resourceType === 512 ? 'primary' : 'ghost'}
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
                'btn ant-btn-primary': resourceType === 'DIY',
                'btn ant-btn-ghost': resourceType !== 'DIY',
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
                  {...storageType}
                >
                  <Option value="nfs">NFS</Option>
                  {/* <Option value="glusterfs">GlusterFS</Option>*/}
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
                  {...storageCluster}
                >
                  {
                    nfsList && nfsList.map(item =>
                      <Option key={item.metadata.name}>
                        {item.metadata.annotations['system/scName'] || item.metadata.name}
                      </Option>
                    )
                  }
                </Select>
              </FormItem>
            </Col>
          </FormItem>
          <FormItem
            label={intl.formatMessage(IntlMessage.accessMethod)}
            {...formItemLayout}
            style={{ marginBottom: 0 }}
          >
            <Radio.Group {...accessMethodProps}>
              <Radio
                value="PublicNetwork" key="PublicNetwork"
                disabled={this.isProxyDisabled('public')}
              >
                {intl.formatMessage(IntlMessage.publicNetAccess)}
              </Radio>
              <Radio
                value="InternalNetwork" key="InternalNetwork"
                disabled={this.isProxyDisabled('private')}
              >
                {intl.formatMessage(IntlMessage.intranetAccess)}
              </Radio>
            </Radio.Group>
          </FormItem>
          <FormItem
            label={' '}
            {...formItemLayout}
            style={{ marginBottom: 0 }}
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
                  {this.renderProxy('public')}
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

                  {this.renderProxy('private')}
                </Select>
              </FormItem>
          }
        </div>
      </div>
    )
  }
}

