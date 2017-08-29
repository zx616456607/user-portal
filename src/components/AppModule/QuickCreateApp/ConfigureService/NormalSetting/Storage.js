/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: storage configure for service
 *
 * v0.1 - 2017-05-10
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import {
  Form, Tooltip, Icon,
  Switch, Radio, Input,
  InputNumber, Select, Button,
  Checkbox, Col, Row,
  Spin,
} from 'antd'
import { loadFreeVolume, createStorage } from '../../../../../actions/storage'
import { volNameCheck } from '../../../../../common/naming_validation'
import NotificationHandler from '../../../../../components/Notification'
import classNames from 'classnames'
import './style/Storage.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option
const MIN = 512
const STEP = 512
const MAX = 20480
const PATH_REG = /^\/[a-zA-Z0-9_\-\/]*$/

const Storage = React.createClass({
  propTypes: {
    mountPath: PropTypes.array,
  },
  getInitialState() {
    return {
      volumeName: '',
      volumeSize: MIN,
      volumeFormat: 'ext4',
      tips: '',
      createVolumeLoading: false,
    }
  },
  getVolumes() {
    const { loadFreeVolume, currentCluster } = this.props
    loadFreeVolume(currentCluster.clusterID)
  },
  componentWillMount() {
    const { fields } = this.props
    if (!fields || !fields.storageType) {
      this.setStorageTypeToDefault()
    }
    if (!fields || !fields.serviceType) {
      this.setServiceTypeToDefault()
    }
    this.getVolumes()
  },
  setStorageTypeToDefault() {
    const { currentCluster, form, isCanCreateVolume } = this.props
    if (!isCanCreateVolume) {
      return
    }
    form.setFieldsValue({
      storageType: currentCluster.storageTypes[0],
    })
  },
  setServiceTypeToDefault() {
    this.props.form.setFieldsValue({
      serviceType: false,
    })
  },
  setBindVolumesToDefault() {
    let { mountPath, form } = this.props
    const { setFieldsValue } = form
    if (!mountPath || !Array.isArray(mountPath)) {
      mountPath = []
    }
    const storageKeys = []
    mountPath.map((path, index) => {
      storageKeys.push(index)
      setFieldsValue({
        [`mountPath${index}`]: path,
      })
    })
    // if set stateful service, storage is required
    if (storageKeys.length < 1) {
      storageKeys.push(0)
    }
    setFieldsValue({
      storageKeys,
    })
  },
  onServiceTypeChange(value) {
    const { setReplicasToDefault } = this.props
    setReplicasToDefault(value)
    if (value) {
      this.setStorageTypeToDefault()
      this.setBindVolumesToDefault()
      this.getVolumes()
    }
    this.setState({
      replicasInputDisabled: !!value
    })
  },
  translateStorageType(type) {
    switch(type) {
      case 'rbd':
        return '分布式存储'
      case 'hostPath':
        return '本地存储'
    }
  },
  renderStorageType() {
    const { currentCluster, form, isCanCreateVolume } = this.props
    if (!isCanCreateVolume) {
      return
    }
    const storageTypeProps = form.getFieldProps('storageType', {
      rules: [
        { required: true },
      ],
    })
    const { storageTypes } = currentCluster
    // for test
    // const storageTypes= [ 'rbd', 'hostPath' ]
    return (
      <FormItem key="storageType" className="floatRight storageType">
        <RadioGroup {...storageTypeProps}>
          {
            storageTypes.map(type => (
              <Radio value={type} key={type}>
                {this.translateStorageType(type)}
              </Radio>
            ))
          }
        </RadioGroup>
        {
          storageTypes.indexOf('hostPath') > -1 && (
            <span>
              Tips：选择『本地存储』时，为保证有状态有效，推荐使用『绑定节点』功能&nbsp;
              <Tooltip title="以保证容器及其Volume存储不被系统调度迁移"
                getTooltipContainer={() => document.getElementById('normalConfigureService')}>
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          )
        }
      </FormItem>
    )
  },
  renderServiceType(serviceType) {
    const serviceTypeValue = serviceType && serviceType.value
    let descContent
    if (!serviceTypeValue) {
      descContent = '无状态服务'
    } else {
      descContent = [
        <div className="floatRight">有状态服务</div>,
        this.renderStorageType()
      ]
    }
    return (
      <div className="serviceType">
        {descContent}
      </div>
    )
  },
  setTips(tips, focus) {
    this.setState({
      tips,
    })
    focus && this.volumeNameInput.refs.input.focus()
  },
  createVolume() {
    const { volumeName, volumeFormat, volumeSize } = this.state
    if (!volumeName || !volumeName.trim()) {
      this.setTips('请填写存储卷名称', true)
      return
    }
    const message = volNameCheck(volumeName, '存储名称')
    if(message !== 'success'){
      this.setTips(message, true)
      return
    }
    const { currentCluster, createStorage } = this.props
    const { clusterID } = currentCluster
    const notification = new NotificationHandler()
    this.setState({
      createVolumeLoading: true,
      tips: '',
    })
    const volumeConfig = {
      driver: 'rbd',
      name: volumeName,
      driverConfig: {
        size: volumeSize,
        fsType: volumeFormat,
      },
      cluster: clusterID
    }
    createStorage(volumeConfig, {
      success: {
        func: () => {
          notification.success('存储卷创建成功')
          this.setState({
            volumeName: '',
            volumeSize: MIN,
            volumeFormat: 'ext4',
          })
          this.getVolumes()
        },
        isAsync: true
      },
      failed: {
        func: (result) => {
          notification.close()
          if(result.statusCode == 409){
            this.setTips('存储名称已被占用', true)
            return
          }
          this.setTips('存储卷创建失败')
        }
      },
      finally: {
        func: () => {
          this.setState({
            createVolumeLoading: false
          })
        }
      }
    })
  },
  onVolumeNameChange(e) {
    const value = e.target.value
    const newState = {
      volumeName: value
    }
    if (value && value.trim()) {
      newState.tips = ''
    }
    this.setState(newState)
  },
  onVolumeSizeChange(value) {
    if (!value) {
      value = 512
    }
    this.setState({volumeSize: value})
  },
  renderCreateVolume() {
    const { volumeName, volumeFormat, volumeSize, tips, createVolumeLoading } = this.state
    return (
      <div className="createVolume" key="createVolume">
        <Input
          className="volumeInput"
          placeholder="存储卷名称"
          value={volumeName}
          onChange={this.onVolumeNameChange}
          ref={ref => this.volumeNameInput = ref}
          disabled={createVolumeLoading}
        />
        <InputNumber
          className="volumeInput"
          placeholder="存储卷大小"
          min={MIN}
          max={MAX}
          step={STEP}
          value={volumeSize}
          onChange={this.onVolumeSizeChange}
          disabled={createVolumeLoading}
        />
        <Select
          className="volumeInput"
          placeholder="请选择格式"
          value={volumeFormat}
          onChange={value => this.setState({volumeFormat: value})}
          disabled={createVolumeLoading}
        >
          <Option value='ext4'>ext4</Option>
          <Option value='xfs'>xfs</Option>
        </Select>
        <Button
          onClick={this.createVolume}
          loading={createVolumeLoading}
        >
          创建存储卷
        </Button>
        <span className="tips">{tips}</span>
      </div>
    )
  },
  renderVolumesOption(volume) {
    const { form, allFields } = this.props
    const { getFieldValue } = form
    const storageKeys = getFieldValue('storageKeys') || []
    const { name, fsType, size } = volume
    const value = `${name}/${fsType}`
    let disabled = false
    for (let fieldsKey in allFields) {
      if (allFields.hasOwnProperty(fieldsKey)) {
        const storageKeysField = allFields[fieldsKey].storageKeys || {}
        const storageKeys = storageKeysField.value || []
        storageKeys.every(key => {
          const volumeField = allFields[fieldsKey][`volume${key}`] || {}
          const volumeValue = volumeField.value
          if (volumeValue === value) {
            disabled = true
            return false
          }
          return true
        })
      }
    }
    return (
      <Option
        key={value}
        disabled={disabled}
      >
        {name} {fsType} {size}
      </Option>
    )
  },
  checkMountPath(key, rule, value, callback) {
    if (!value) {
      return callback()
    }
    if (!PATH_REG.test(value)) {
      return callback('请输入正确的路径')
    }
    const { getFieldValue } = this.props.form
    const storageKeys = getFieldValue('storageKeys') || []
    let error
    storageKeys.every(_key => {
      const mountPath = getFieldValue(`mountPath${_key}`)
      if (_key !== key && value === mountPath) {
        error = '已填写过该路径'
        return false
      }
      return true
    })
    callback(error)
  },
  renderConfigureItem(key, index) {
    const { avaliableVolume, form } = this.props
    const { volumes } = avaliableVolume
    const { getFieldProps, getFieldValue } = form
    const serviceType = getFieldValue('serviceType')
    const storageType = getFieldValue('storageType')
    const hostPathFlag = storageType === 'hostPath'
    const mountPathkey = `mountPath${key}`
    const hostPathkey = `hostPath${key}`
    const volumekey = `volume${key}`
    const readOnlykey = `readOnly${key}`
    let mountPathProps
    let hostPathProps
    let volumeProps
    let readOnlyProps
    if (serviceType) {
      mountPathProps = getFieldProps(mountPathkey, {
        rules: [
          { required: true, message: '请输入容器目录' },
          { validator: this.checkMountPath.bind(this, key) }
        ],
      })
      if (hostPathFlag) {
        hostPathProps = getFieldProps(hostPathkey, {
          rules: [
            { required: true, message: '请输入本地目录' },
          ],
        })
      } else {
        volumeProps = getFieldProps(volumekey, {
          rules: [
            { required: true, message: '请选择存储卷' },
            // { validator: this.checkAppName }
          ],
        })
        readOnlyProps = getFieldProps(readOnlykey)
      }
    }
    return (
      <Row gutter={16} className="configureItem" key={`configureItem${key}`}>
        {
          mountPathProps && (
            <Col span={6}>
              <FormItem key={mountPathkey}>
                <Input
                  className="formInput"
                  placeholder="请输入容器目录"
                  size="default"
                  {...mountPathProps}
                />
              </FormItem>
            </Col>
          )
        }
        {
          hostPathProps && (
            <Col span={6}>
              <FormItem key={hostPathkey}>
                <Input
                  className="formInput"
                  placeholder="请输入本地目录"
                  size="default"
                  {...hostPathProps}
                />
              </FormItem>
            </Col>
          )
        }
        {
          volumeProps && (
            <Col span={6}>
              <FormItem key={volumekey}>
                <Select
                  placeholder="请选择存储卷"
                  size="default"
                  {...volumeProps}
                  showSearch
                  optionFilterProp="children"
                >
                  { volumes.map(this.renderVolumesOption) }
                </Select>
              </FormItem>
            </Col>
          )
        }
        {
          readOnlyProps && (
            <Col span={3}>
              <FormItem key={readOnlykey}>
                <Checkbox {...readOnlyProps}>只读</Checkbox>
              </FormItem>
            </Col>
          )
        }
        <Col span={6} className="operating">
          {
            !hostPathFlag && (
              <Tooltip title="刷新">
                <Button type="dashed" size="small" onClick={this.getVolumes} >
                  <Icon type="reload"/>
                </Button>
              </Tooltip>
            )
          }
          <Tooltip title="删除">
            <Button
              type="dashed"
              size="small"
              onClick={this.removeStorageKey.bind(this, key)}
              disabled={index === 0}
            >
              <Icon type="delete" />
            </Button>
          </Tooltip>
        </Col>
      </Row>
    )
  },
  addStorageKey() {
    const { form } = this.props
    const { setFieldsValue, getFieldValue, validateFields } = form
    const storageType = getFieldValue('storageType')
    const hostPathFlag = storageType === 'hostPath'
    let storageKeys = getFieldValue('storageKeys') || []
    const validateFieldsKeys = []
    storageKeys.forEach(key => {
      validateFieldsKeys.push(`mountPath${key}`)
      if (hostPathFlag) {
        validateFieldsKeys.push(`hostPath${key}`)
      } else {
        validateFieldsKeys.push(`volume${key}`)
      }
    })
    validateFields(validateFieldsKeys, (errors, values) => {
      if (!!errors) {
        return
      }
      let uid = storageKeys[storageKeys.length - 1] || 0
      uid ++
      storageKeys = storageKeys.concat(uid)
      setFieldsValue({
        storageKeys,
      })
    })
  },
  removeStorageKey(key) {
    const { form } = this.props
    const { setFieldsValue, getFieldValue } = form
    const storageKeys = getFieldValue('storageKeys') || []
    setFieldsValue({
      storageKeys: storageKeys.filter(_key => _key !== key)
    })
  },
  renderConfigure() {
    const { avaliableVolume, form } = this.props
    const { volumes, isFetching } = avaliableVolume
    let createVolumeElement
    if (volumes.length < 1 && !isFetching) {
      createVolumeElement = this.renderCreateVolume()
    }
    const { getFieldValue } = form
    const storageKeys = getFieldValue('storageKeys') || []
    const serviceType = getFieldValue('serviceType') || []
    const bindVolumesClass = classNames({
      'bindVolume': true,
      'ant-spin-container': avaliableVolume.isFetching,
    })
    return [
      createVolumeElement,
      <div className={bindVolumesClass} key="storageKeys">
        {storageKeys.map(this.renderConfigureItem) }
        <span className="addMountPath" onClick={this.addStorageKey}>
          <Icon type="plus-circle-o" />
          <span>添加一个容器目录</span>
        </span>
      </div>
    ]
  },
  render() {
    const { formItemLayout, form, isCanCreateVolume, fields, avaliableVolume } = this.props
    const { getFieldProps } = form
    const { serviceType } = fields || {}
    const { isFetching } = avaliableVolume
    const serviceTypeProps = getFieldProps('serviceType', {
      valuePropName: 'checked',
      onChange: this.onServiceTypeChange
    })
    const volumesClass = classNames({
      'volumes': true,
      'ant-spin-nested-loading': isFetching,
    })
    const volumeSpinClass = classNames({
      'displayNone': !isFetching,
    })
    return (
      <Row className="storageConfigureService">
        <Col span={formItemLayout.labelCol.span} className="formItemLabel label">
          <div>
            服务类型&nbsp;
            <a href="http://docs.tenxcloud.com/faq#you-zhuang-tai-fu-wu-yu-wu-zhuang-tai-fu-wu-de-qu-bie" target="_blank">
              <Tooltip title="若需数据持久化，请使用有状态服务">
                <Icon type="question-circle-o" />
              </Tooltip>
            </a>
          </div>
        </Col>
        <Col span={formItemLayout.wrapperCol.span}>
          <FormItem>
            <Switch
              className="floatRight"
              {...serviceTypeProps}
              disabled={!isCanCreateVolume}
            />
            {
              !isCanCreateVolume && (
                <span className="noVolumeServiceSpan">
                  <Tooltip title="无存储服务可用, 请配置存储服务">
                    <Icon type="question-circle-o"/>
                  </Tooltip>
                </span>
              )
            }
            {this.renderServiceType(serviceType)}
            {
              (serviceType && serviceType.value) && (
                <div className={volumesClass}>
                  <Spin className={volumeSpinClass}/>
                  {this.renderConfigure()}
                </div>
              )
            }
          </FormItem>
        </Col>
      </Row>
    )
  }
})

function mapStateToProps(state, props) {
  const { entities, storage, quickCreateApp } = state
  const { current } = entities
  const { cluster } = current
  const { avaliableVolume } = storage
  const { storageTypes } = cluster
  let isCanCreateVolume = true
  if(!storageTypes || storageTypes.length <= 0) {
    isCanCreateVolume = false
  }
  return {
    currentCluster: cluster,
    isCanCreateVolume,
    avaliableVolume: {
      volumes: (avaliableVolume.data ? avaliableVolume.data.volumes : []),
      isFetching: avaliableVolume.isFetching,
    },
    allFields: quickCreateApp.fields,
  }
}

export default connect(mapStateToProps, {
  loadFreeVolume,
  createStorage,
})(Storage)
