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
import { Form, Tooltip, Icon, Switch, Radio, Input, InputNumber, Select, Button } from 'antd'
import { loadFreeVolume, createStorage } from '../../../../actions/storage'
import { volNameCheck } from '../../../../common/naming_validation'
import NotificationHandler from '../../../../common/notification_handler'
import './style/Storage.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option
const MIN = 512
const STEP = 512
const MAX = 20480

const Storage = React.createClass({
  getInitialState() {
    return {
      volumeName: '',
      volumeSize: MIN,
      volumeFormat: 'ext4',
      tips: '',
      createVolumeLoading: false,
    }
  },
  componentWillMount() {
    const { fields, loadFreeVolume, currentCluster } = this.props
    if (!fields || !fields.storageType) {
      this.setStorageTypeToDefault()
    }
    if (!fields || !fields.serviceType) {
      this.setServiceTypeToDefault()
    }
    loadFreeVolume(currentCluster.clusterID)
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
  onServiceTypeChange(value) {
    const { setReplicasToDefault } = this.props
    if (value) {
      setReplicasToDefault()
      this.setStorageTypeToDefault()
      const { loadFreeVolume, currentCluster } = this.props
      loadFreeVolume(currentCluster.clusterID)
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
          storageTypes.length > 1 && (
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
    const { currentCluster, createStorage, loadFreeVolume } = this.props
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
          loadFreeVolume(clusterID)
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
  onVolumeSizeChange(e) {
    if (!value) {
      value = 512
    }
    this.setState({volumeSize: value})
  },
  renderCreateVolume() {
    const { volumeName, volumeFormat, volumeSize, tips, createVolumeLoading } = this.state
    return (
      <div className="createVolume">
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
  renderVolumes(serviceType) {
    const serviceTypeValue = serviceType && serviceType.value
    if (!serviceTypeValue) {
      return
    }
    const { avaliableVolume } = this.props
    const { volumes, isFetching } = avaliableVolume
    if (isFetching) {
      return (
        <div><Icon type="loading" /> 加载存储卷中</div>
      )
    }
    if (volumes.length < 1) {
      return this.renderCreateVolume()
    }
    return (
      <div className="bindVolume">
        <pre>
          {JSON.stringify(volumes, null, 2)}
        </pre>
      </div>
    )
  },
  render() {
    const { formItemLayout, form, isCanCreateVolume, fields } = this.props
    const { getFieldProps } = form
    const { serviceType } = fields || {}
    const serviceTypeProps = getFieldProps('serviceType', {
      valuePropName: 'checked',
      onChange: this.onServiceTypeChange
    })
    return (
      <FormItem
        className="storageConfigureService"
        {...formItemLayout}
        label={
          <div>
            服务类型&nbsp;
            <a href="http://docs.tenxcloud.com/faq#you-zhuang-tai-fu-wu-yu-wu-zhuang-tai-fu-wu-de-qu-bie" target="_blank">
              <Tooltip title="若需数据持久化，请使用有状态服务">
                <Icon type="question-circle-o" />
              </Tooltip>
            </a>
          </div>
        }
        key="serviceType"
      >
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
        <div className="volumes">
        {this.renderVolumes(serviceType)}
        </div>
      </FormItem>
    )
  }
})

function mapStateToProps(state, props) {
  const { entities, storage } = state
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
  }
}

export default connect(mapStateToProps, {
  loadFreeVolume,
  createStorage,
})(Storage)
