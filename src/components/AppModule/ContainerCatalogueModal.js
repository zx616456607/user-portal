/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * container catalogue Modal component
 *
 * v0.1 - 2017-9-11
 * @author ZhangChengZheng
 */

import React, { PropTypes } from 'react'
import { Form, Select, Row, Col, Radio, Input, InputNumber, Button } from 'antd'
import { connect } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import { loadFreeVolume, getCheckVolumeNameExist } from '../../actions/storage'
import { getClusterStorageList } from '../../actions/cluster'
import { serviceNameCheck } from '../../common/naming_validation'
import { DEFAULT_IMAGE_POOL, ASYNC_VALIDATOR_TIMEOUT } from '../../constants'
import './style/ContainerCatalogueModal.less'
import { checkVolumeMountPath } from './QuickCreateApp/utils'
import { injectIntl } from 'react-intl'
import IntlMessage from '../../containers/Application/ServiceConfigIntl'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const PATH_REG = /^\//
let firstShowModal = true;

let ContainerCatalogueModal = React.createClass({
  propTypes: {
    visible: PropTypes.bool.isRequired,
    callbackFields: PropTypes.func.isRequired,
    fieldsList: PropTypes.array.isRequired,
    currentIndex: PropTypes.number.isRequired,
    replicas: PropTypes.number.isRequired,
    isAutoScale: PropTypes.bool.isRequired,
    from: PropTypes.oneOf([ 'createApp', 'editService' ]),
  },
  getInitialState() {
    return {
      isResetComponent: false,
      confirmLoading: false,
      type_1Value: 'nfs',
      serverType: 'random',
      hostDir: '',
      createStorage: false
      // loading: true,
    }
  },

  restFormValues(item) {
    const { form } = this.props
    const { resetFields, setFieldsValue } = form
    if (!item) {
      return resetFields()
    }
    let itemKeys = Object.keys(item)
    if (!itemKeys.length) {
      form.resetFields([
        'type',
        'mountPath',
        'readOnly',
        'serverDir'
      ])
      return
    }
    const { type, mountPath, readOnly } = item
    form.setFieldsValue(item)
    if(item.volume == 'create'){
      setTimeout(() => {
        form.setFieldsValue({name: item.name})
      }, 100)
    }
  },

  componentWillMount() {
    const { currentIndex, fieldsList, getClusterStorageList, clusterID, namespace } = this.props
    this.restFormValues(fieldsList[currentIndex])
    getClusterStorageList(clusterID, {
      success: {
        func: res => {
          this.setState({
            hostDir: res.data.hostList[0] && (res.data.hostList[0].parameters.baseDir + '/' + namespace),
          })
        },
      },
    })
  },

  componentWillReceiveProps(nextProps) {
    const { visible, clusterID, loadFreeVolume, isTemplate } = this.props
    if (!visible && nextProps.visible || firstShowModal) {
      this.restFormValues(nextProps.fieldsList[nextProps.currentIndex])
      if(nextProps.fieldsList.length !== nextProps.currentIndex){
        const srtype = nextProps.fieldsList[nextProps.currentIndex].type;
        const type_1 = nextProps.fieldsList[nextProps.currentIndex].type_1;
        if(srtype !== 'host' && !isTemplate){
          loadFreeVolume(clusterID, { srtype, storagetype: type_1 })
        }
      }
      firstShowModal = false;
    }
  },

  typeChange(type) {
    const { form, loadFreeVolume, clusterID, isTemplate } = this.props
    const { resetFields, setFieldsValue } = form
    resetFields([
      'mountPath',
      'readOnly',
      'storageClassName',
    ])
    if (type == 'private' && !isTemplate) { // 应用模板不需要选择存储卷
      loadFreeVolume(clusterID, { srtype: 'private' }, {
        success:{
          func: (res) => {

          },
          isAsync: true
        }
      }).then(() =>{
        setFieldsValue({
          type_1: 'rbd',
          type: 'private'
        })
        resetFields([
          "volume"
        ])
      })
    }
    if (type === 'share' && !isTemplate) {
      loadFreeVolume(clusterID, { srtype: 'share', storagetype: this.state.type_1Value }, {
        success:{
          func: (res) => {

          },
          isAsync: true
        }
      }).then(() =>{
        setFieldsValue({
          type_1: 'nfs',
          type: 'share'
        })
        resetFields([
          "volume"
        ])
      })
    }
  },

  checkVolumeName(rule, value, callback) {
    const { getCheckVolumeNameExist, clusterID, intl } = this.props
    let msg = serviceNameCheck(value, intl.formatMessage(IntlMessage.storageName))
    if (msg !== 'success') {
      return callback(msg)
    }
    const { avaliableVolume, fieldsList, form, currentIndex } = this.props
    const type = form.getFieldValue('type')
    const volumeNameArray = []
    avaliableVolume.volumes.forEach((item, index) => {
      volumeNameArray.push(item.name)
    })
    const list = cloneDeep(fieldsList)
    list.splice(currentIndex, 1)
    list.forEach((item, index) => {
      if (item.volume !== 'create') {
        volumeNameArray.push(item.volume.split(' ')[0])
      } else {
        volumeNameArray.push(item.name)
      }
    })
    // 判断新增的存储卷是否在当前服务列表中重名
    for(let i = 0; i < volumeNameArray.length; i++){
      if(value == volumeNameArray[i]){
        return callback(intl.formatMessage(IntlMessage.storageNameExist))
      }
    }
    // 判断新增的存储卷是否与数据库与的存储卷重名
    clearTimeout(this.volumeNameChechTimeout)
    this.volumeNameChechTimeout = setTimeout(() => {
      getCheckVolumeNameExist(clusterID, value, {
        success: {
          func: () => {
            return callback()
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            if(res.statusCode == 409){
              msg = serviceNameCheck(value, intl.formatMessage(IntlMessage.storageName), true)
              return callback(msg)
            }
          },
          isAsync: true
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  },

  renderDifferentType(type, volume) {
    const { isTemplate, intl } = this.props;
    if(type == 'host' ) {
      return this.renderHostType()
    }
    if (type === 'share' && volume === 'create' && isTemplate) {
      return;
    }
    if(type !== 'host' && volume == 'create'){
      const { form } = this.props
      const { getFieldProps } = form
      let width = '361px'
      if(type == 'private'){
        width = '138px'
      }
      return (
        <FormItem
          label={intl.formatMessage(IntlMessage.storageVolumeSetting)}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 17 }}
          className='volume_setting'
        >
          {
            !isTemplate ?
            <div>
              <div style={{ width : this.state.type_1Value === 'glusterfs' ? 175 : '100%'}}>
                <FormItem className={this.state.type_1Value === 'glusterfs' ? 'glusterfsName name' : 'name'} style={{width: this.state.type_1Value !== 'glusterfs' ? width : "100%"}}>
                  <Input
                    placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                      item: intl.formatMessage(IntlMessage.storageName),
                      end: '',
                    })}
                    {...getFieldProps('name', {
                      rules: [{
                        validator: this.checkVolumeName
                      }]
                    }) }
                  />
                </FormItem>
              </div>
              {
                this.state.type_1Value === 'glusterfs' ?
                <div>
                  <FormItem style={{ width: 175 }} className="inputNumWid">
                    <InputNumber
                        className="inputNum"
                        placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                          item: intl.formatMessage(IntlMessage.storageSize),
                          end: '',
                        })}
                        min={1} max={20}
                        {...getFieldProps('storage', {
                          initialValue: 1,
                          onChange: this.onSliderChange,
                          rules:[{
                            type: "number"
                            //validator: this.checkVolumeNameExist
                          }],
                        })}
                      />
                  </FormItem>
                  <div className="unit">GB</div>
                </div>
                :
                null
              }
            </div>
            :
            null
          }
          {
            type == 'private'
              ? <div>
                <FormItem className='size'>
                  <InputNumber
                    min={512}
                    max={20480}
                    {...getFieldProps('size', {
                      initialValue: 512,
                      rules: [{
                        validator: (rule, value, callback) => {
                          if (!value) {
                            return callback(intl.formatMessage(IntlMessage.canNotBeEmpty))
                          }
                          return callback()
                        }
                      }]
                    }) }
                  /> MB
                </FormItem>
                <FormItem className='type'>
                  <Select
                    {...getFieldProps('fsType', {
                      initialValue: 'ext4',
                      rules: [{
                        required: true,
                      }],
                    }) }
                  >
                    <Option value="ext4" key="ext4">ext4</Option>
                  {/* KK-2502 创建应用过程中，动态生成存储时，只能选择 ext4 不能使用 xfs 格式
                    <Option value="xfs" key="xfs">xfs</Option> */}
                  </Select>
                </FormItem>
              </div>
              : null
          }
        </FormItem>
      )
    }
    return null
  },

  renderHostType() {
    const { form, fieldsList, currentIndex, isBindNode, intl } = this.props
    const { getFieldProps } = form
    return <div>
      <Row className='host_node_row'>
        <Col span="5">{intl.formatMessage(IntlMessage.bindingNode)}</Col>
        <Col span="17">
          {
            isBindNode
              ? <span>{intl.formatMessage(IntlMessage.bindings)}</span>
              : <span>{intl.formatMessage(IntlMessage.unbound)}</span>
          }
        </Col>
      </Row>
      <FormItem
        label={intl.formatMessage(IntlMessage.hostDirectory)}
        key="host_path"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 17 }}
      >

        <div className='host_wrapper'>
          <Input
            addonBefore={this.state.hostDir}
            placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
              item: intl.formatMessage(IntlMessage.hostDirectory),
              end: '',
            })}
            {...getFieldProps('hostPath', {
              initialValue: undefined,
              rules: [{
                validator: (rule, value, callback) => {
                  if(!value){
                    return callback(intl.formatMessage(IntlMessage.pleaseEnter, {
                      item: intl.formatMessage(IntlMessage.hostDirectory),
                      end: '',
                    }))
                  }
                  if (!PATH_REG.test(value)) {
                    return callback(intl.formatMessage(IntlMessage.plsEnterCorrectPath))
                  }
                  // if (value.lastIndexOf('/') > 0) {
                  //   return callback('本地存储不支持挂载多级目录')
                  // }
                  //const list = cloneDeep(fieldsList)
                  //list.splice(currentIndex, 1)
                  //for (let i = 0; i < list.length; i++) {
                  //  if (value === list[i].hostPath) {
                  //    return callback('已填写过该路径')
                  //  }
                  //}
                  return callback()
                }
              }]
            })}
          />
        </div>
      </FormItem>
    </div>
  },

  addOrEditFields(type) {
    const { callbackFields, form, isTemplate } = this.props
    this.setState({
      isResetComponent: true,

    })
    if (type === 'cancel') {
      const obj = {
        type,
      }
      this.setState({
        confirmLoading: false
      })
      this.resetState();
      return callbackFields(obj)
    }
    if (type === 'confirm') {
      this.setState({
        confirmLoading: true,
      })
      const validateArray = [
        'type',
        'mountPath',
        'readOnly',
      ]
      let array = []
      const volumeType = form.getFieldValue("type")
      if(volumeType === 'host'){
        array = [
          'hostPath',
        ]
      }
      if (volumeType === 'private') {
        array = [
          'type_1',
          'volume',
          'volumeIsOld',
        ]
        const volume = form.getFieldValue('volume')
        if (volume === "create") {
          array = [
            'type_1',
            'storageClassName',
            'volume',
            'volumeIsOld',
            'name',
            'size',
            'fsType',
            //'strategy',
          ]
          if (this.state.serverType === 'custom') array.push('serverDir')
        }
      }
      if (volumeType === 'share') {
        array = [
          'type_1',
          'volume'
        ]
        const volume = form.getFieldValue('volume')
        if (volume === "create") {
          array = [
            'type_1',
            'storageClassName',
            'volume',
            'name',
            //'size',
            //'fsType',
          ]
          if (this.state.serverType === 'custom') array.push('serverDir')
          if(this.state.type_1Value === 'glusterfs' && !isTemplate)
          {
            array.push('storage');
          }
        }
      }
      if (isTemplate) {
        let validateSet = new Set(array);
        validateSet.delete('name');
        array = Array.from(validateSet);
      }
      array.forEach(item => {
        validateArray.push(item)
      });

      form.validateFields(validateArray, (errors, values) => {
        this.setState({
          confirmLoading: false
        })
        if (!!errors) {
          return
        }
        const obj = {
          type,
          values,
        }
        this.resetState();
        return callbackFields(obj)
      })
    }

    return null
  },

  resetState(){
    setTimeout(() => {
      this.setState({
        // loading: true, //选择存储loading 状态
        type_1Value: "nfs"
      })
    },1000);
  },

  onVolumeChange(value) {
    if (value === 'create') {
      const { getClusterStorageList, clusterID,
        form } = this.props
      getClusterStorageList(clusterID)
      this.setState({createStorage: true})
      return
    }
    this.setState({createStorage: false})

    const { form, avaliableVolume } = this.props
    const { volumes } = avaliableVolume
    let volumeIsOld = false
    const volumeName = value.split(' ')[0]
    volumes.every(volume => {
      if (volume.name === volumeName) {
        volumeIsOld = volume.isOld
        return false
      }
      return true
    })
    let storageClassName
    let tempList
    const type_1 = form.getFieldValue('type_1')
    if (!!type_1) {
      if(type_1 === 'nfs'){
        tempList = this.props.nfsList
      } else if(type_1 === 'glusterfs') {
        tempList = this.props.glusterfsList
      } else {
        tempList = this.props.cephList
      }
      tempList.map(item => {
        if(item.metadata.labels["system/storageDefault"] === "true"){
          storageClassName = item.metadata.name
        }
      })
    }
    form.setFieldsValue({
      volumeIsOld,
      storageClassName,
    })
  },

  renderVolumesOptions() {
    const { avaliableVolume, fieldsList, currentIndex, intl } = this.props
    const { volumes, isFetching } = avaliableVolume
    if (isFetching) {
      return (
        <Option
          key="loading"
          disabled={true}
        >
          loading ...
        </Option>
      )
    }
    const options = [
      <Option key="create" value="create">{intl.formatMessage(IntlMessage.dynGenerateStorageVolume)}</Option>,
    ]
    const list = cloneDeep(fieldsList)
    list.splice(currentIndex, 1)
    const selectedVolumes = list.map(fields => fields.volume)
    const type = this.props.form.getFieldValue('type')
    volumes.forEach(volume => {
      const { name, fsType, size, isOld, isUsed } = volume
      const value = `${name} ${fsType || '-'} ${size}`
      if (type == 'private') {
        let disabled = selectedVolumes.indexOf(value) > -1 || isUsed
        options.push(
          <Option
            key={value}
            disabled={disabled}
          >
            {name} {fsType} {size}
          </Option>
        )
      } else {
        let disabled = false
        selectedVolumes.forEach(item => {
          if(item.indexOf(name) > -1){
            disabled = true
          }
        })
        options.push(
          <Option
            key={value}
            disabled={disabled}
          >
            {name}
          </Option>
        )
      }
    })
    return options
  },
  type_1Change(value) {
    this.setState({
      type_1Value: value
    }, () => {
      const { form, loadFreeVolume, isTemplate, clusterID } = this.props
      const { resetFields, getFieldValue } = form
      const type = getFieldValue('type');
      if (type === 'share' && !isTemplate) {
        loadFreeVolume(clusterID, { srtype: 'share', storagetype: value }, {
          success:{
            func: (res) => {
              // todo
            },
            isAsync: true
          }
        })
      }
      resetFields([
        "volume",
        'mountPath',
        'readOnly',
        'storageClassName'
      ])
    })
  },
  // 选择server 共享目录
  serverTypeChange(e) {
    this.setState({
      serverType: e.target.value
    })
  },
  testPath(rule, value, callback) {
    const { intl } = this.props
    if (!value) {
      return callback(intl.formatMessage(IntlMessage.pleaseNFSServerPath))
    }
    if (!PATH_REG.test(value)) {
      return callback(intl.formatMessage(IntlMessage.pathInCorrect))
    }
    callback()
  },
  render() {
    const { storageClassType, intl } = this.props
    const {
      form, replicas, isAutoScale,
      volumes, from, storageList,
      nfsList, cephList, glusterfsList, fieldsList,
      currentIndex, isTemplate, parentForm,
    } = this.props
    const { getFieldProps, getFieldValue } = form
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 17 }
    }
    let isEdit = false
    if(from == 'editService' && fieldsList.length !== currentIndex){
      isEdit = true
    }
    const typeProps = getFieldProps('type', {
      rules: [{
        required: true,
        message: intl.formatMessage(IntlMessage.pleaseSelect, {
          item: intl.formatMessage(IntlMessage.storageType)
        })
      }],
      onChange: this.typeChange
    })
    const type = getFieldValue('type')
    const type_1 = getFieldValue('type_1')
    let volumeProps
    let volumeIsOldProps
    let volume
    let typeWidth = "100%"
    let typeSpan = 24
    const serverList = type === 'share'
      ? (type_1 === 'nfs' ?
      nfsList : glusterfsList)
      : cephList
    if (type === 'private' || type === "share") {
      typeWidth = 175
      typeSpan = 12
      volumeProps = getFieldProps('volume', {
        rules: [{
          required: true,
          message: intl.formatMessage(IntlMessage.pleaseSelect, {
            item: intl.formatMessage(IntlMessage.storageVolume)
          })
        }],
        initialValue: isTemplate ? 'create' : '',
        onChange: this.onVolumeChange,
      })
      volume = form.getFieldValue('volume')
    }
    if (type == 'private'){
      volumeIsOldProps = getFieldProps('volumeIsOld', {
        initialValue: false,
        rules: [{
          required: true,
        }],
      })
    }
    let unableToChangeType = false
    // 如果有多个容器，或者当前服务已开启弹性伸缩，不可以再选择 host 和 独享型
    if (replicas > 1 || isAutoScale) {
      unableToChangeType = true
    }
    let volumeWidth = '100%'
    let volumeSpan = 24
    if (volume === 'create') {
      volumeWidth = 175
      volumeSpan = 12
    }
    // setTimeout(() => {
    //   this.setState({
    //     loading: false, //选择存储loading 状态
    //   })
    // },1000);
    let init_storageClassName
    let tempList = []
    if (!!type_1) {
      if(type_1 === 'nfs'){
        tempList = nfsList
      } else if(type_1 === 'glusterfs') {
        tempList = glusterfsList
      } else {
        tempList = cephList
      }
      tempList.map(item => {
        if(item.metadata.labels["system/storageDefault"] === "true"){
          init_storageClassName = item.metadata.name
        }
      })
    }
    const pathProps = getFieldProps('serverDir',{
      initialValue: '',
      validate: [
        {
          rules: [
            {validator: this.testPath},
          ],
          trigger: ['onBlur', 'onChange'],
        }
      ],
      onChange: this.hostDirEdit
    })
    return (
      <div id='container_catalogue'>
        <div className="body">
          {
            from !== 'createApp' && <div className='alertRow'>
              {intl.formatMessage(IntlMessage.storageInstructions)} <span style={{ fontWeight: 'bold' }}>
              {intl.formatMessage(IntlMessage.exclusiveType)}：</span><br />
              {intl.formatMessage(IntlMessage.storageInstructionsFirst)}<br />
              {intl.formatMessage(IntlMessage.storageInstructionsSecond)}
            </div>
          }
          <Form>
            <FormItem
              label={intl.formatMessage(IntlMessage.storageType)}
              {...formItemLayout}
            >
              <Row>
                <Col span={typeSpan}>
                  <FormItem style={{ width: typeWidth}}>
                    <Select
                      placeholder={intl.formatMessage(IntlMessage.pleaseSelect, {
                        item: intl.formatMessage(IntlMessage.storageType)
                      })}
                      {...typeProps}
                      disabled={isEdit && fieldsList[currentIndex].oldVolume}
                    >
                      <Option key="private" value="private" disabled={unableToChangeType || !storageClassType.private}>
                        {intl.formatMessage(IntlMessage.exclusiveType)}
                      </Option>
                      <Option key="share" value="share" disabled={!storageClassType.share}>
                        {intl.formatMessage(IntlMessage.sharedType)}
                      </Option>
                      <Option key="host" value="host" disabled={!storageClassType.host}>
                        {intl.formatMessage(IntlMessage.localStorage)}
                      </Option>
                    </Select>
                  </FormItem>
                </Col>
                {
                  type === 'private' || type === 'share'
                    ? <Col span={12}>
                      <FormItem className='not_host_type'>
                        <Select
                          placeholder={intl.formatMessage(IntlMessage.pleaseSelect, { item: '' })}
                          disabled={isEdit && fieldsList[ currentIndex ].oldVolume}
                          {...getFieldProps('type_1', {
                            rules: [ {
                              required: true,
                              message: intl.formatMessage(IntlMessage.canNotBeEmpty)
                            } ],
                            onChange: this.type_1Change
                          })}
                        >
                          {
                            type === 'private'
                              ? <Option type="rbd" value="rbd">{intl.formatMessage(IntlMessage.blockStorage)}（rbd）</Option>
                              : [<Option type="nfs" value="nfs">NFS</Option>,<Option type="glusterfs" value="glusterfs">GlusterFS</Option>]
                          }
                        </Select>
                      </FormItem>
                    </Col>
                    : null
                }
              </Row>
            </FormItem>
            {
              type === 'private' || type === "share"
                ? <FormItem
                  label={intl.formatMessage(IntlMessage.selectStorage)}
                  {...formItemLayout}
                >
                <Row>
                  <Col span={volumeSpan}>
                    {/* <Spin spinning={this.state.loading} > */}
                      <FormItem style={{ width: volumeWidth }}>
                        <Select
                          placeholder={intl.formatMessage(IntlMessage.pleaseSelect, {
                            item: intl.formatMessage(IntlMessage.storageVolume)
                          })}
                          {...volumeProps}
                          disabled={isTemplate || isEdit && fieldsList[currentIndex].oldVolume}
                        >
                          {this.renderVolumesOptions()}
                        </Select>
                      </FormItem>
                    {/* </Spin> */}
                  </Col>
                  { volume === 'create' &&  <Col span={12}>
                    <FormItem className='not_host_type'>
                      <Select
                        placeholder={intl.formatMessage(IntlMessage.pleaseSelect, {
                          item: intl.formatMessage(IntlMessage.storageCluster)
                        })}
                        disabled={isEdit && fieldsList[currentIndex].oldVolume}
                        {...getFieldProps('storageClassName', {
                          initialValue: init_storageClassName,
                          rules: [{
                            validator: (rule, value, callback) => {
                              if (!value) {
                                return callback(`server ${intl.formatMessage(IntlMessage.canNotBeEmpty)}`)
                              }
                              return callback()
                            }
                          }],
                        }) }
                      >
                        {
                          serverList.map(server =>
                            <Option key={server.metadata.name}>
                              {server.metadata.annotations['system/scName'] || server.metadata.name}
                            </Option>
                          )
                        }
                      </Select>
                    </FormItem>
                  </Col> }
                </Row>
                </FormItem>
                : null
            }
            {this.renderDifferentType(type, volume)}
            {
              (type === 'share' && this.state.createStorage && this.state.type_1Value === 'nfs') &&
              <FormItem
                label={intl.formatMessage(IntlMessage.serverDir)}
                {...formItemLayout}
              >
                <RadioGroup value={this.state.serverType} onChange={this.serverTypeChange}>
                <Radio value='random' key='random'>{intl.formatMessage(IntlMessage.random)}</Radio>
                <Radio value='custom' key='custom'>{intl.formatMessage(IntlMessage.NFSServerPath)}</Radio>
                </RadioGroup>
                {
                  this.state.serverType === 'custom' &&
                  <Input {...pathProps} placeholder={`${intl.formatMessage(IntlMessage.pleaseNFSServerPath)}`}/>
                }
              </FormItem>
            }

            {/*
              volume === 'create' && type === 'private' && (
                <FormItem
                  label={
                    <span>回收策略
                      <Tooltip
                        title={
                          <div>
                            <div>保留：服务删除时，保留存储</div>
                            <div>删除：删除服务时，删除存储</div>
                          </div>
                        }
                      >
                        <Icon type="question-circle-o" className='question_icon' />
                      </Tooltip>
                    </span>
                  }
                  {...formItemLayout}
                  className='strategy'
                >
                  <Radio.Group
                    disabled={type == 'host'}
                    {...getFieldProps('strategy', {
                      initialValue: true,
                    }) }
                  >
                    <Radio key="yes" value={true}>保留</Radio>
                    <Radio key="no" value={false} className='delete' disabled>删除</Radio>
                  </Radio.Group>
                  <span className='strategy_tips'><Icon type="question-circle-o" className='tips_icon'/>暂不支持删除策略</span>
                </FormItem>
              )
            */}
            <FormItem
              label={intl.formatMessage(IntlMessage.containerDirectory)}
              {...formItemLayout}
            >
              <Input
                placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                  item: intl.formatMessage(IntlMessage.containerDirectory),
                  end: '',
                })}
                {...getFieldProps('mountPath', {
                  rules: [{
                    whitespace: false,
                    validator: (rule, value, callback) => {
                      if (!value) {
                        return callback(intl.formatMessage(IntlMessage.containerDirIsRequired))
                      }
                      if (!PATH_REG.test(value)) {
                        return callback(intl.formatMessage(IntlMessage.plsEnterCorrectPath))
                      }
                      if (!parentForm) {
                        const list = cloneDeep(fieldsList)
                        list.splice(currentIndex, 1)
                        for (let i = 0; i < list.length; i++) {
                          if (value === list[i].mountPath) {
                            return callback(intl.formatMessage(IntlMessage.pathExist))
                          }
                        }
                        return callback()
                      }
                      return callback(checkVolumeMountPath(parentForm, currentIndex, value, 'volume'))
                    }
                  }]
                }) }
              />
            </FormItem>
            <FormItem
              label={intl.formatMessage(IntlMessage.readWritePermission)}
              {...formItemLayout}
              className='form_item_bottom'
            >
              <Radio.Group
                {...getFieldProps('readOnly', {
                  initialValue: false,
                }) }
              >
                <Radio key="yes" value={false}>{intl.formatMessage(IntlMessage.readWrite)}</Radio>
                <Radio key="no" value={true}>{intl.formatMessage(IntlMessage.readOnly)}</Radio>
              </Radio.Group>
            </FormItem>
          </Form>
        </div>
        <div className="footer">
          <Button
            size="large"
            style={{ marginRight: 12 }}
            onClick={this.addOrEditFields.bind(this, 'cancel')}
          >
            {intl.formatMessage(IntlMessage.cancel)}
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={this.addOrEditFields.bind(this, 'confirm')}
            loading={this.state.confirmLoading}
          >
            {intl.formatMessage(IntlMessage.confirm)}
          </Button>
        </div>
      </div>
    )
  }
})

function mapStateToProp(state, props) {
  const { entities, storage, cluster } = state
  const { current } = entities
  const clusterID = current.cluster.clusterID
  const clusterStorage = cluster.clusterStorage && cluster.clusterStorage[clusterID] || {}
  const nfsList = clusterStorage.nfsList || []
  const glusterfsList = clusterStorage.glusterfsList || []
  const cephList = clusterStorage.cephList || []
  const avaliableVolume = storage.avaliableVolume || {}
  let defaultStorageClassType = {
    private: false,
    share: false,
    host: false,
  }
  if(current.cluster && current.cluster.storageClassType){
    defaultStorageClassType = current.cluster.storageClassType
  }
  return {
    clusterID,
    storageClassType: defaultStorageClassType,
    avaliableVolume: {
      volumes: (avaliableVolume.data ? avaliableVolume.data.volumes : []),
      isFetching: avaliableVolume.isFetching,
    },
    nfsList,
    cephList,
    glusterfsList,
    namespace: current.space.namespace,
  }
}

ContainerCatalogueModal = Form.create()(ContainerCatalogueModal)

export default connect(mapStateToProp, {
  getClusterStorageList,
  loadFreeVolume,
  getCheckVolumeNameExist,
})(injectIntl(ContainerCatalogueModal, {
  withRef: true,
}))
