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
import cloneDeep from 'lodash/cloneDeep'
import {
  Form, Tooltip, Icon,
  Switch, Radio, Input,
  InputNumber, Select, Button,
  Checkbox, Col, Row,
  Spin, Modal
} from 'antd'
import { loadFreeVolume } from '../../../../../actions/storage'
import { volNameCheck } from '../../../../../common/naming_validation'
import NotificationHandler from '../../../../../components/Notification'
import classNames from 'classnames'
import './style/Storage.less'
import ContainerCatalogueModal from '../../../ContainerCatalogueModal'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option
const MIN = 512
const STEP = 512
const MAX = 20480

const Storage = React.createClass({
  propTypes: {
    mountPath: PropTypes.object,
  },
  getInitialState() {
    return {
      volumeName: '',
      volumeSize: MIN,
      volumeFormat: 'ext4',
      tips: '',
      createVolumeLoading: false,
      addContainerPathModal: false,
      currentIndex: null,
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
    const { setReplicasToDefault, form } = this.props
    if(!value){
      setReplicasToDefault(value)
    }
    if (value) {
      this.setStorageTypeToDefault()
      this.setBindVolumesToDefault()
      this.getVolumes()
      let storageList = form.getFieldValue('storageList') || []
      this.setReplicasStatus(storageList)
      if(!storageList.length){
        this.setState({
          addContainerPathModal: true,
          currentIndex: storageList.length,
        })
      }
    }
    this.setState({
      replicasInputDisabled: !!value
    })
  },
  renderStorageType() {
    const { currentCluster, form, isCanCreateVolume } = this.props
    if (!isCanCreateVolume) {
      return
    }
    const { storageTypes } = currentCluster
    // for test
    // const storageTypes= [ 'rbd', 'hostPath' ]
    return (
      <FormItem key="storageType" className="floatRight storageType">
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
        <div className="floatRight" key="service">有状态服务</div>,
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
    this.setState({ volumeSize: value })
  },
  renderStorageList() {
    const { form } = this.props
    const { getFieldValue, getFieldProps } = form
    const storageListProps = getFieldProps('storageList')
    const serviceType = getFieldValue('serviceType')
    const storageList = getFieldValue('storageList') || []
    if (serviceType && storageList.length > 0) {
      return storageList.map((item, index) => {
        let {
          type, mountPath, strategy,
          readOnly, volume, name,
          size, fsType
        } = item
        let volumeName = volume
        if (volume === 'create') {
          if(type == 'private'){
            volumeName = `${name} ${fsType || '-'}`
          }
          if(type == 'share'){
            volumeName = `${name} -`
          }
          if(type == 'host'){
            volumeName = '-'
          }
        } else {
          if(type == 'private'){
            volumeName = volume
          }
          if(type == 'share'){
            const name = volume.split(' ')[0]
            volumeName = `${name} -`
          }
          if(type == 'host'){
            volumeName = '-'
          }
        }
        return <Row key={`storagelist${index}`} className='storage_row_style'>
          <Col span="4" className='text'>
            {this.formatType(type)}
          </Col>
          <Col span="4" className='text'>
            {volumeName || '-'}
          </Col>
          <Col span="8" className='text mountPath_style'>
            <Input value={mountPath} disabled />
          </Col>
          {/*<Col span="3">
            {
              type == 'private'
                ? <Checkbox checked disabled>{strategy ? '保留' : '删除'}</Checkbox>
                : <span>&nbsp;</span>
            }
          </Col>*/}
          <Col span="3">
            <Checkbox checked={readOnly} disabled>只读</Checkbox>
          </Col>
          <Col span="4">
            <Button
              icon="edit"
              style={{ marginRight: 8 }}
              onClick={() => this.editStorage(index)}
            />
            <Button
              icon="delete"
              onClick={() => this.deleteStorage(index)}
            />
          </Col>
        </Row>
      })
    }
    return <div></div>
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
    const { isFetching } = avaliableVolume
    const { getFieldValue } = form
    const storageList = getFieldValue('storageList') || []
    const bindVolumesClass = classNames({
      'bindVolume': true,
      'ant-spin-container': avaliableVolume.isFetching,
    })
    return (
      <div>
        <div>
          {this.renderStorageList()}
        </div>
        <div className={bindVolumesClass} key="storageKeys">
          <span className="addMountPath"
            onClick={() => this.setState({
              addContainerPathModal: true,
              currentIndex: storageList.length,
            })}
          >
            <Icon type="plus-circle-o" />
            <span>添加一个容器目录</span>
          </span>
        </div>
      </div>
    )
  },
  callbackFields(fields) {
    const { volumeList, currentIndex } = this.state
    const { form } = this.props
    let storageList = form.getFieldValue('storageList') || []
    const list = cloneDeep(storageList)
    const type = fields.type
    if (type == 'cancel') {
      if(!storageList.length){
        const { setReplicasToDefault } = this.props
        setReplicasToDefault(false)
        form.setFieldsValue({
          serviceType: false,
        })
      }
      this.setState({
        addContainerPathModal: false,
      })
      return
    }
    if (type === 'confirm') {
      this.setState({
        addContainerPathModal: false,
      })
      if (list[currentIndex]) {
        list[currentIndex] = Object.assign({}, list[currentIndex], fields.values)
      } else {
        list.push(fields.values)
      }
      this.setReplicasStatus(list)
      form.setFieldsValue({
        storageList: list,
      })
    }
  },
  formatType(type) {
    switch (type) {
      case 'host':
        return <span>host</span>
      case 'private':
        return <span>独享型（可靠块存储）</span>
      case 'share':
        return <span>共享型（nfs）</span>
      default:
        return <span>未知</span>
    }
  },
  editStorage(index) {
    this.setState({
      currentIndex: index,
      addContainerPathModal: true,
    })
  },
  setReplicasStatus(list){
    const { setReplicasToDefault, replicasInputDisabled } = this.props
    let incloudPrivate = false
    for(let i = 0; i < list.length; i++){
    	if(list[i].type == 'private'){
        incloudPrivate = true
        break
      }
    }
    if(replicasInputDisabled && !incloudPrivate){
      setReplicasToDefault(incloudPrivate)
      return
    }
    if(!replicasInputDisabled && incloudPrivate){
      setReplicasToDefault(incloudPrivate)
    }
  },
  deleteStorage(index) {
    const { form } = this.props
    const storageList = form.getFieldValue('storageList')
    const list = cloneDeep(storageList)
    list.splice(index, 1)
    this.setReplicasStatus(list)
    form.setFieldsValue({
      storageList: list,
    })
  },
  render() {
    const {
      formItemLayout, form, isCanCreateVolume,
      fields, avaliableVolume, currentFields,
    } = this.props
    const { getFieldProps, getFieldValue } = form
    const { serviceType } = fields || {}
    const { isFetching } = avaliableVolume
    const serviceTypeProps = getFieldProps('serviceType', {
      valuePropName: 'checked',
      onChange: this.onServiceTypeChange
    })
    const storageList = getFieldValue('storageList') || []
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
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              )
            }
            {this.renderServiceType(serviceType)}
            {
              (serviceType && serviceType.value) && (
                <div className={volumesClass}>
                  <div>
                    独享型存储，仅支持一个容器实例读写操作；<br/>
                    共享型支持多个容器实例同时对同一个存储卷读写操作；<br/>
                    host 型存储支持在宿主机节点上保存数据。
                  </div>
                  <Spin className={volumeSpinClass} />
                  {this.renderConfigure()}
                </div>
              )
            }
          </FormItem>
        </Col>
        <Modal
          title="添加容器目录"
          visible={this.state.addContainerPathModal}
          closable={true}
          onCancel={() => this.setState({ addContainerPathModal: false })}
          width="570px"
          maskClosable={false}
          wrapClassName="add_container_path"
          footer={[]}
        >
          <ContainerCatalogueModal
            visible={this.state.addContainerPathModal}
            callbackFields={this.callbackFields}
            fieldsList={storageList}
            currentIndex={this.state.currentIndex}
            replicas={currentFields.replicas && currentFields.replicas.value || 1}
            isAutoScale={false}
            from={'createApp'}
          />
        </Modal>
      </Row>
    )
  }
})

function mapStateToProps(state, props) {
  const { entities, storage, quickCreateApp } = state
  const { current } = entities
  const { cluster } = current
  const { storageTypes } = cluster
  let isCanCreateVolume = true
  if (!storageTypes || storageTypes.length <= 0) {
    isCanCreateVolume = false
  }
  const avaliableVolume = storage.avaliableVolume || {}
  return {
    currentCluster: cluster,
    isCanCreateVolume,
    currentFields: quickCreateApp.fields[props.id] || {},
    avaliableVolume: {
      volumes: (avaliableVolume.data ? avaliableVolume.data.volumes : []),
      isFetching: avaliableVolume.isFetching,
    },
  }
}

export default connect(mapStateToProps, {
  loadFreeVolume,
})(Storage)
