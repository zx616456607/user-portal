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
import { Form, Select, Row, Col, Radio, Input, Tooltip, Icon, InputNumber, Button, Spin } from 'antd'
import { connect } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import { loadFreeVolume, getCheckVolumeNameExist } from '../../actions/storage'
import { getClusterStorageList } from '../../actions/cluster'
import { isStorageUsed } from '../../common/tools'
import { serviceNameCheck } from '../../common/naming_validation'
import { DEFAULT_IMAGE_POOL, ASYNC_VALIDATOR_TIMEOUT } from '../../constants'
import './style/ContainerCatalogueModal.less'
import { checkVolumeMountPath } from './QuickCreateApp/utils'

const FormItem = Form.Item
const Option = Select.Option
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
      loading: true,
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
    const { currentIndex, fieldsList, isTemplate, getClusterStorageList, clusterID } = this.props
    this.restFormValues(fieldsList[currentIndex])
    if (isTemplate) {
      getClusterStorageList(clusterID)
    }
  },

  componentWillReceiveProps(nextProps) {
    const { visible, clusterID, loadFreeVolume } = this.props
    if (!visible && nextProps.visible || firstShowModal) {
      this.restFormValues(nextProps.fieldsList[nextProps.currentIndex])
      if(nextProps.fieldsList.length !== nextProps.currentIndex){
        const srtype = nextProps.fieldsList[nextProps.currentIndex].type;
        const type_1 = nextProps.fieldsList[nextProps.currentIndex].type_1;
        if(srtype !== 'host'){
          loadFreeVolume(clusterID, { srtype, storagetype: type_1 })
        }
      }
      firstShowModal = false;
    }
  },

  typeChange(type) {
    const { form, loadFreeVolume, clusterID } = this.props
    const { resetFields, setFieldsValue } = form
    resetFields([
      'mountPath',
      'readOnly',
      'storageClassName',
    ])
    if (type == 'private') {
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
    if (type === 'share') {
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
    const { getCheckVolumeNameExist, clusterID } = this.props
    let msg = serviceNameCheck(value, '存储名称')
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
        return callback('存储名称已存在！')
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
              msg = serviceNameCheck(value, '存储名称', true)
              return callback(msg)
            }
          },
          isAsync: true
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  },

  renderDifferentType(type, volume) {
    const { isTemplate } = this.props;
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
          label="存储卷设置"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          className='volume_setting'
        >
          {
            !isTemplate ?
            <div>
              <div style={{ width : this.state.type_1Value === 'glusterfs' ? 175 : '100%'}}>
                <FormItem className={this.state.type_1Value === 'glusterfs' ? 'glusterfsName name' : 'name'} style={{width: this.state.type_1Value !== 'glusterfs' ? width : "100%"}}>
                  <Input
                    placeholder="请输入存储名称"
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
                        placeholder="请输入存储大小" min={1} max={20}
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
                            return callback('不能为空')
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
                    <Option value="xfs" key="xfs">xfs</Option>
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
    const { form, fieldsList, currentIndex, isBindNode } = this.props
    const { getFieldProps } = form
    return <div>
      <Row className='host_node_row'>
        <Col span="4">绑定节点</Col>
        <Col span="17">
          {
            isBindNode
              ? <span>已绑定</span>
              : <span>未绑定</span>
          }
        </Col>
      </Row>
      <FormItem
        label="宿主机目录"
        key="host_path"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 17 }}
      >
        <Input
          placeholder='请输入宿主机目录'
          {...getFieldProps('hostPath', {
            initialValue: undefined,
            rules: [{
              validator: (rule, value, callback) => {
                if(!value){
                  return callback('宿主机目录不能为空')
                }
                if (!PATH_REG.test(value)) {
                  return callback('请输入正确的路径')
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
          if(this.state.type_1Value === 'glusterfs')
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
        loading: true, //选择存储loading 状态
        type_1Value: "nfs"
      })
    },1000);
  },

  onVolumeChange(value) {
    if (value === 'create') {
      const { getClusterStorageList, clusterID,
        form } = this.props
      getClusterStorageList(clusterID)
      return
    }
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
    const { avaliableVolume, fieldsList, currentIndex } = this.props
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
      <Option key="create" value="create">动态生成一个存储卷</Option>,
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
            {name} {size}
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
      const { form, loadFreeVolume, clusterID } = this.props
      const { resetFields, getFieldValue } = form
      const type = getFieldValue('type');
      if (type === 'share') {
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
      ])
    })
  },
  render() {
    const { storageClassType } = this.props
    const {
      form, replicas, isAutoScale,
      volumes, from, storageList,
      nfsList, cephList, glusterfsList, fieldsList,
      currentIndex, isTemplate, parentForm,
    } = this.props
    const { getFieldProps, getFieldValue } = form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 17 }
    }
    let isEdit = false
    if(from == 'editService' && fieldsList.length !== currentIndex){
      isEdit = true
    }
    const typeProps = getFieldProps('type', {
      rules: [{
        required: true,
        message: '存储类型不能为空'
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
          message: '存储卷不能为空'
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
    setTimeout(() => {
      this.setState({
        loading: false, //选择存储loading 状态
      })
    },1000);
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

    return (
      <div id='container_catalogue'>
        <div className="body">
          {
            from !== 'createApp' && <div className='alertRow'>
              服务中含有以下设置不能添加 <span style={{ fontWeight: 'bold' }}>独享型：</span><br />
              1.服务中的容器数量大于1个（不含1）；<br />
              2.开启自动伸缩的服务；
            </div>
          }
          <Form>
            <FormItem
              label="存储类型"
              {...formItemLayout}
            >
              <Row>
                <Col span={typeSpan}>
                  <FormItem style={{ width: typeWidth}}>
                    <Select
                      placeholder="请选择存储类型"
                      {...typeProps}
                      disabled={isEdit && fieldsList[currentIndex].oldVolume}
                    >
                      <Option key="private" value="private" disabled={unableToChangeType || !storageClassType.private}>独享型</Option>
                      <Option key="share" value="share" disabled={!storageClassType.share}>共享型</Option>
                      <Option key="host" value="host" disabled={!storageClassType.host}>本地存储</Option>
                    </Select>
                  </FormItem>
                </Col>
                {
                  type === 'private' || type === 'share'
                    ? <Col span={12}>
                      <FormItem className='not_host_type'>
                        <Select
                          placeholder="请选择"
                          disabled={isEdit && fieldsList[ currentIndex ].oldVolume}
                          {...getFieldProps('type_1', {
                            rules: [ {
                              required: true,
                              message: '不能为空'
                            } ],
                            onChange: this.type_1Change
                          })}
                        >
                          {
                            type === 'private'
                              ? <Option type="rbd" value="rbd">块存储（rbd）</Option>
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
                  label="选择存储"
                  {...formItemLayout}
                >
                <Row>
                  <Col span={volumeSpan}>
                    <Spin spinning={this.state.loading} >
                      <FormItem style={{ width: volumeWidth }}>
                        <Select
                          placeholder="请选择存储卷"
                          {...volumeProps}
                          disabled={isTemplate || isEdit && fieldsList[currentIndex].oldVolume}
                        >
                          {this.renderVolumesOptions()}
                        </Select>
                      </FormItem>
                    </Spin>
                  </Col>
                  { volume === 'create' &&  <Col span={12}>
                    <FormItem className='not_host_type'>
                      <Select
                        placeholder="请选择一个存储集群"
                        disabled={isEdit && fieldsList[currentIndex].oldVolume}
                        {...getFieldProps('storageClassName', {
                          initialValue: init_storageClassName,
                          rules: [{
                            validator: (rule, value, callback) => {
                              if (!value) {
                                return callback('server 不能为空')
                              }
                              return callback()
                            }
                          }],
                        }) }
                      >
                        {
                          serverList.map(server =>
                            <Option key={server.metadata.name}>
                              {server.metadata.annotations['tenxcloud.com/scName'] || server.metadata.name}
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
              label="容器目录"
              {...formItemLayout}
            >
              <Input
                placeholder="请输入容器目录"
                {...getFieldProps('mountPath', {
                  rules: [{
                    whitespace: false,
                    validator: (rule, value, callback) => {
                      if (!value) {
                        return callback('容器目录不能为空')
                      }
                      if (!PATH_REG.test(value)) {
                        return callback('请输入正确的路径')
                      }
                      if (!parentForm) {
                        const list = cloneDeep(fieldsList)
                        list.splice(currentIndex, 1)
                        for (let i = 0; i < list.length; i++) {
                          if (value === list[i].mountPath) {
                            return callback('已填写过该路径')
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
              label="读写权限"
              {...formItemLayout}
              className='form_item_bottom'
            >
              <Radio.Group
                {...getFieldProps('readOnly', {
                  initialValue: false,
                }) }
              >
                <Radio key="yes" value={false}>可读可写</Radio>
                <Radio key="no" value={true}>只读</Radio>
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
            取消
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={this.addOrEditFields.bind(this, 'confirm')}
            loading={this.state.confirmLoading}
          >
            确定
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
  }
}

ContainerCatalogueModal = Form.create()(ContainerCatalogueModal)

export default connect(mapStateToProp, {
  getClusterStorageList,
  loadFreeVolume,
  getCheckVolumeNameExist,
})(ContainerCatalogueModal)
