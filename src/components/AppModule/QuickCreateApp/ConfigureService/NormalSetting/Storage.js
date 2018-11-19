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
import isEmpty from 'lodash/isEmpty'
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
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../../containers/Application/ServiceConfigIntl'

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
    const { fields, form } = this.props
    if (!fields || !fields.storageType) {
      // this.setStorageTypeToDefault()
    }
    if (!fields || !fields.serviceType) {
      this.setServiceTypeToDefault()
    }
    let storageList = form.getFieldValue('storageList') || []
    this.setReplicasStatus(storageList)
    this.getVolumes()
  },
  /* setStorageTypeToDefault() {
    const { currentCluster, form, isCanCreateVolume } = this.props
    if (!isCanCreateVolume) {
      return
    }
    const { storageTypes } = currentCluster
    console.log('storageTypes', storageTypes)
    const storageType = storageTypes && storageTypes[0] || {}
    form.setFieldsValue({
      storageType: currentCluster.storageTypes[0],
    })
  }, */
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
      // this.setStorageTypeToDefault()
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
  renderServiceType(serviceType) {
    const { intl } = this.props
    const serviceTypeValue = serviceType && serviceType.value
    let descContent
    if (!serviceTypeValue) {
      descContent = intl.formatMessage(IntlMessage.statelessService)
    } else {
      descContent = [
        <div className="floatRight" key="service">{intl.formatMessage(IntlMessage.statefulService)}</div>,
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
    const { form, isTemplate, location, intl } = this.props
    const { getFieldValue, getFieldProps } = form
    const { template } = location.query
    const storageListProps = getFieldProps('storageList')
    const serviceType = getFieldValue('serviceType')
    const storageList = getFieldValue('storageList') || []
    const templateStorage = getFieldValue('templateStorage') || []
    if (serviceType && storageList.length > 0) {
      return storageList.map((item, index) => {
        let {
          type, mountPath, strategy,
          readOnly, volume, name,
          size, fsType, type_1,
          disableEdit,
        } = item
        let volumeName = volume
        if (volume === 'create') {
          if(type == 'private'){
            volumeName = `${name} ${fsType || '-'} ${size}`
            if (isTemplate) {
              volumeName = `${fsType || '-'} ${size}`
            }
          }
          if(type == 'share'){
            volumeName = `${name}`
            if (isTemplate) {
              volumeName = '-'
            }
          }
          if(type == 'host'){
            if(this.getServiceIsBindNode()){
              volumeName = intl.formatMessage(IntlMessage.bindings)
            } else {
              volumeName = intl.formatMessage(IntlMessage.unbound)
            }
            if (isTemplate) {
              volumeName = '-'
            }
          }
        } else {
          if(type == 'private'){
            volumeName = volume
          }
          if(type == 'share'){
            const name = volume.split(' ')[0]
            volumeName = `${name}`
          }
          if(type == 'host'){
            if(this.getServiceIsBindNode()){
              volumeName = intl.formatMessage(IntlMessage.bindings)
            } else {
              volumeName = intl.formatMessage(IntlMessage.unbound)
            }
          }
        }
        const rowClassName = classNames({
          'storage_row_style': true,
          'first_row': index == 0,
        })
        let finallyName = volumeName || '-'
        if (templateStorage.includes(name)) {
          if (type === 'private') {
            finallyName = intl.formatMessage(IntlMessage.dynamicGeneration)
          } else {
            finallyName = '-'
          }
        }
        //this.formatType(type, type_1)
        return <Row key={`storagelist${index}`} className={rowClassName}>
          <Col span="4" className='text'>
            {this.formatType(type, type_1)}
          </Col>
          <Col span="4" className='text'>
            {finallyName}
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
          <Col span="3" className='read_only'>
            <Checkbox checked={readOnly} disabled>{intl.formatMessage(IntlMessage.readOnly)}</Checkbox>
          </Col>
          <Col span="4">
            <Button
              icon="edit"
              style={{ marginRight: 8 }}
              type='dashed'
              disabled={disableEdit}
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
  renderStorageErrors(){
    const { form } = this.props
    const { getFieldError } = form
    const storageErrors = form.getFieldError('storageList')
    if (isEmpty(storageErrors)) {
      return
    }
    return (
      <div className="ant-form-explain">
        {
          storageErrors.map((error, index, arr) => {
            return <span>{error}{index !== arr.length -1 ? '，' : ''}</span>
          })
        }
      </div>
    )
  },
  renderConfigure() {
    const { avaliableVolume, form, intl } = this.props
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
          <div className="has-error storageErrorBox">
            {this.renderStorageErrors()}
          </div>
        </div>
        <div className={bindVolumesClass} key="storageKeys">
          <span className="addMountPath"
            onClick={() => this.setState({
              addContainerPathModal: true,
              currentIndex: storageList.length,
            })}
          >
            <Icon type="plus-circle-o" />
            <span>{intl.formatMessage(IntlMessage.addContainer)}</span>
          </span>
        </div>
      </div>
    )
  },
  cancelAddContainerPath(){
    const fileds = {
      type: 'cancel',
      value: {},
    }
    this.callbackFields(fileds)
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
        currentIndex: undefined,
      })
      return
    }
    if (type === 'confirm') {
      this.setState({
        addContainerPathModal: false,
        currentIndex: undefined,
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
  formatType(type, type_1) {
    const { intl } = this.props
    switch (type) {
      case 'host':
        return <span>{intl.formatMessage(IntlMessage.localStorage)}</span>
      case 'private':
        return <span>{intl.formatMessage(IntlMessage.exclusiveType)}（rbd）</span>
      case 'share':
        if(!!type_1 && type_1 === "glusterfs"){
          return <span>{intl.formatMessage(IntlMessage.sharedType)}（GlusterFS）</span>
        }
        return <span>{intl.formatMessage(IntlMessage.sharedType)}（NFS）</span>
      default:
        return <span>{intl.formatMessage(IntlMessage.unknown)}</span>
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
  getCurrentErrors(list){
    const storageTypeArray = ['nfs', 'ceph', 'host', 'glusterfs']
    const { form } = this.props
    const { getFieldError } = form
    const storageErrors = getFieldError('storageList')
    if (isEmpty(storageErrors)) {
      return
    }
    return storageErrors.filter(error => {
      let flag = false
      let currentType = ''
      storageTypeArray.forEach(type => {
        if (error.includes(type)) {
          currentType = type
        }
      })
      list.forEach(record => {
        if (record.name.includes(currentType)) {
          flag = true
        }
      })
      return flag
    })
  },
  deleteStorage(index) {
    const { form } = this.props
    const storageList = form.getFieldValue('storageList')
    const list = cloneDeep(storageList)
    list.splice(index, 1)
    this.setReplicasStatus(list)
    let errorMessage = this.getCurrentErrors(list)
    let storageObject = {
      value: list
    }
    if (errorMessage) {
      storageObject = Object.assign({}, storageObject, {
        errors: this.getCurrentErrors(list).map(error => {
          return {
            message: error,
            filed: 'storageList'
          }
        })
      })
    }
    form.setFields({
      storageList: storageObject
    })
  },
  getServiceIsBindNode(){
    const { form } = this.props
    const { getFieldValue } = form
    const bindNodeType = getFieldValue('bindNodeType')
    const bindNode = getFieldValue('bindNode')
    let isBindNode = false
    if(bindNodeType == 'hostname' && bindNode !== 'tenx_system_default_schedule' ){
      isBindNode = true
    }
    return isBindNode
  },
  render() {
    const {
      formItemLayout, form, isCanCreateVolume,
      fields, avaliableVolume, currentFields,
      isTemplate, intl,
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
            {intl.formatMessage(IntlMessage.serviceType)}&nbsp;
            {/* <a href="http://docs.tenxcloud.com/faq#you-zhuang-tai-fu-wu-yu-wu-zhuang-tai-fu-wu-de-qu-bie" target="_blank"> */}
              <Tooltip title={intl.formatMessage(IntlMessage.dataPersistenceTip)}>
                <Icon type="question-circle-o" />
              </Tooltip>
            {/* </a> */}
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
                  <Tooltip title={intl.formatMessage(IntlMessage.noStorageServiceTip)}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              )
            }
            {this.renderServiceType(serviceType)}
            {
              (serviceType && serviceType.value) && (
                <div className={volumesClass}>
                  <div className='tips_container'>
                    <div className='item'>
                      <span className='icon'>。</span>
                      {intl.formatMessage(IntlMessage.exclusiveTypeTip)}
                    </div>
                    <div className='item'>
                      <span className='icon'>。</span>
                      {intl.formatMessage(IntlMessage.sharedTypeTip)}
                    </div>
                    <div className='item'>
                      <span className='icon'>。</span>
                      {intl.formatMessage(IntlMessage.localStorageTip)}
                    </div>
                  </div>
                  <Spin className={volumeSpinClass} />
                  {this.renderConfigure()}
                </div>
              )
            }
          </FormItem>
        </Col>
        <Modal
          title={
            isEmpty(storageList) || !storageList[this.state.currentIndex]
              ?
              intl.formatMessage(IntlMessage.storageModalTitle)
              :
              intl.formatMessage(IntlMessage.editStorageModalTitle)
          }
          visible={this.state.addContainerPathModal}
          closable={true}
          onCancel={this.cancelAddContainerPath}
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
            isTemplate={isTemplate}
            isBindNode={this.getServiceIsBindNode()}
            parentForm={form}
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
  let defalutStorageClassType = {
    host: false,
    private: false,
    share: false,
  }
  if(cluster.storageClassType){
    defalutStorageClassType = cluster.storageClassType
  }
  const { private: isPrivate, host: isHost, share: isShare } = defalutStorageClassType
  let isCanCreateVolume = true
  if(!isPrivate && !isHost && !isShare){
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
})(injectIntl(Storage, {
  withRef: true,
}))
