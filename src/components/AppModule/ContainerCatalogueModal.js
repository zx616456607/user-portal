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
import { Form, Select, Row, Col, Radio, Input, Tooltip, Icon, InputNumber, Button } from 'antd'
import { connect } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import { loadFreeVolume } from '../../actions/storage'
import { getClusterStorageList } from '../../actions/cluster'
import { isStorageUsed } from '../../common/tools'
import { DEFAULT_IMAGE_POOL } from '../../constants'
import './style/ContainerCatalogueModal.less'

const FormItem = Form.Item
const Option = Select.Option
const PATH_REG = /^\/[a-zA-Z0-9_\-\/]*$/

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
    const { currentIndex, fieldsList } = this.props
    this.restFormValues(fieldsList[currentIndex])
  },

  componentWillReceiveProps(nextProps) {
    const { visible, clusterID, loadFreeVolume } = this.props
    if (!visible && nextProps.visible) {
      this.restFormValues(nextProps.fieldsList[nextProps.currentIndex])
      if(nextProps.fieldsList.length !== nextProps.currentIndex){
        const srtype = nextProps.fieldsList[nextProps.currentIndex].type
        if(srtype !== 'host'){
          loadFreeVolume(clusterID, { srtype })
        }
      }
    }
  },

  typeChange(type) {
    const { form, loadFreeVolume, clusterID } = this.props
    const { resetFields, setFieldsValue } = form
    resetFields([
      'mountPath',
      'readOnly',
    ])
    if (type == 'private') {
      loadFreeVolume(clusterID, { srtype: 'private' })
      setFieldsValue({
        type_1: 'rbd',
      })
      resetFields([
        "volume"
      ])
    }
    if (type === 'share') {
      loadFreeVolume(clusterID, { srtype: 'share' })
      setFieldsValue({
        type_1: 'nfs',
      })
      resetFields([
        "volume"
      ])
    }
    /* if (type == 'host') {
      setFieldsValue({
        'strategy': true
      })
    } */
  },

  checkVolumeName(rule, value, callback) {
    if (!value) {
      return callback('存储名称不能为空')
    }
    if(!value){
      return callback('请输入存储名称')
    }
    if(value.length > 32){
      return callback('存储名称不能超过32个字符')
    }
    if(!/^[A-Za-z]{1}/.test(value)){
      return callback('存储名称必须以字母开头')
    }
    if(!/^[A-Za-z]{1}[A-Za-z0-9_-]*$/.test(value)){
      return callback('存储名称由字母、数字、中划线-、下划线_组成')
    }
    if(value.length < 3){
      return callback('存储名称不能少于3个字符')
    }
    if(!/^[A-Za-z]{1}[A-Za-z0-9_\-]{1,61}[A-Za-z0-9]$/.test(value)){
      return callback('存储名称必须由字母或数字结尾')
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
      if (item.type == type) {
        if (item.volume !== 'create') {
          volumeNameArray.push(item.volume.split(' ')[0])
        } else {
          volumeNameArray.push(item.name)
        }
      }
    })
    for(let i = 0; i < volumeNameArray.length; i++){
      if(value == volumeNameArray[i]){
        return callback('存储名称已存在！')
      }
    }
    return callback()
  },

  renderDifferentType(type, volume) {
    if(type == 'host' ) {
      return this.renderHostType()
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
          <FormItem className='name' style={{width}}>
            <Input
              placeholder="请输入存储名称"
              {...getFieldProps('name', {
                rules: [{
                  validator: this.checkVolumeName
                }]
              }) }
            />
          </FormItem>
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
    const { form, fieldsList, currentIndex } = this.props
    const { getFieldProps } = form
    const bind = false
    return <div>
      <Row className='host_node_row'>
        <Col span="4">绑定节点</Col>
        <Col span="17">
          {
            bind
              ? <span>已绑定  ubuntu-26 | 192.168.1.26</span>
              : <span>未绑定  如需保持数据一致性建议绑定具体节点</span>
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
    const { callbackFields, form } = this.props
    this.setState({
      isResetComponent: true
    })
    if (type === 'cancel') {
      const obj = {
        type,
      }
      return callbackFields(obj)
    }
    if (type === 'confirm') {
      const validateArray = [
        'type',
        'mountPath',
        'readOnly',
        'volumeIsOld',
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
          'volume'
        ]
        const volume = form.getFieldValue('volume')
        if (volume === "create") {
          array = [
            'type_1',
            'storageClassName',
            'volume',
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
        }
      }
      array.forEach(item => {
        validateArray.push(item)
      })
      form.validateFields(validateArray, (errors, values) => {
        if (!!errors) {
          return
        }
        const obj = {
          type,
          values,
        }
        return callbackFields(obj)
      })
    }
    return null
  },

  onVolumeChange(value) {
    if (value === 'create') {
      const { getClusterStorageList, clusterID } = this.props
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
    form.setFieldsValue({
      volumeIsOld,
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
      const value = `${name} ${fsType || '-'}`
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
        options.push(
          <Option
            key={value}
          >
            {name}
          </Option>
        )
      }
    })
    return options
  },

  render() {
    const { storageClassType } = this.props
    const {
      form, replicas, isAutoScale,
      volumes, from, storageList,
      nfsList, cephList, fieldsList,
      currentIndex
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
    let volumeProps
    let volumeIsOldProps
    let volume
    let typeWidth = "100%"
    const serverList = type === 'share'
      ? nfsList
      : cephList
    if (type === 'private' || type === "share") {
      typeWidth = 175
      volumeProps = getFieldProps('volume', {
        rules: [{
          required: true,
          message: '存储卷不能为空'
        }],
        onChange: this.onVolumeChange,
      })
      volume = form.getFieldValue('volume')
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
    if (volume === 'create') {
      volumeWidth = 175
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
              <FormItem style={{ width: typeWidth, float: 'left' }}>
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
              {
                type === 'private' || type === "share"
                  ? <FormItem className='not_host_type'>
                    <Select
                      placeholder="请选择"
                      disabled={isEdit && fieldsList[currentIndex].oldVolume}
                      {...getFieldProps('type_1', {
                        rules: [{
                          required: true,
                          message: '不能为空'
                        }]
                      }) }
                    >
                      {
                        type === 'private'
                          ? <Option type="rbd" value="rbd">块存储（rbd）</Option>
                          : <Option type="nfs" value="nfs">NFS</Option>
                      }
                    </Select>
                  </FormItem>
                  : null
              }
            </FormItem>
            {
              type === 'private' || type === "share"
                ? <FormItem
                  label="选择存储"
                  {...formItemLayout}
                >
                  <FormItem style={{ width: volumeWidth, float: 'left' }}>
                    <Select
                      placeholder="请选择存储卷"
                      {...volumeProps}
                      disabled={isEdit && fieldsList[currentIndex].oldVolume}
                    >
                      {this.renderVolumesOptions()}
                    </Select>
                  </FormItem>
                  {
                    volume === 'create' && <FormItem className='not_host_type'>
                      <Select
                        placeholder="请选择一个 server"
                        disabled={isEdit && fieldsList[currentIndex].oldVolume}
                        {...getFieldProps('storageClassName', {
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
                  }
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
                      const list = cloneDeep(fieldsList)
                      list.splice(currentIndex, 1)
                      for (let i = 0; i < list.length; i++) {
                        if (value === list[i].mountPath) {
                          return callback('已填写过该路径')
                        }
                      }
                      return callback()
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
  }
}

ContainerCatalogueModal = Form.create()(ContainerCatalogueModal)

export default connect(mapStateToProp, {
  getClusterStorageList,
  loadFreeVolume,
})(ContainerCatalogueModal)