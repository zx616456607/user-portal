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
        'strategy',
        'readOnly',
      ])
      return
    }
    const { type, mountPath, readOnly } = item
    form.setFieldsValue(item)
  },

  componentWillMount() {
    const { currentIndex, fieldsList } = this.props
    this.restFormValues(fieldsList[currentIndex])
  },

  componentWillReceiveProps(nextProps) {
    const { visible } = this.props
    if (!visible && nextProps.visible) {
      this.restFormValues(nextProps.fieldsList[nextProps.currentIndex])
    }
  },

  typeChange(type) {
    const { form, loadFreeVolume, clusterID } = this.props
    const { resetFields, setFieldsValue } = form
    resetFields([
      'mountPath',
      'strategy',
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
    if (type == 'host') {
      setFieldsValue({
        'strategy': true
      })
    }
  },

  renderDifferentType(type, volume) {
    switch (type) {
      case 'host':
        return this.renderHostType()
      case 'private':
        return this.renderExclusiveType(volume)
      case 'share':
        return this.renderShareType(volume)
      default:
        return null
    }
  },

  renderHostType() {
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
    </div>
  },

  renderExclusiveType(volume) {
    if (volume === 'create') {
      const { form } = this.props
      const { getFieldProps } = form
      return <div>
        <FormItem
          label="存储卷设置"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          className='volume_setting'
        >
          <FormItem className='name'>
            <Input
              placeholder="请输入存储名称"
              {...getFieldProps('name', {
                rules: [{
                  validator: (rule, value, callback) => {
                    if (!value) {
                      return callback('存储名称不能为空')
                    }
                    return callback()
                  }
                }]
              }) }
            />
          </FormItem>
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
            />
          </FormItem>
          <FormItem className='type'>
            <Select
              {...getFieldProps('fsType', {
                initialValue: 'ext4',
                required: true,
                message: '不能为空'
              }) }
            >
              <Option value="ext4" key="ext4">ext4</Option>
              <Option value="xfs" key="xfs">xfs</Option>
            </Select>
          </FormItem>
        </FormItem>
      </div>
    }
    return null
  },

  renderShareType(volume) {
    if (volume === 'create') {
      const { form } = this.props
      const { getFieldProps } = form
      const formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 17 }
      }
      const fsTypeProps = getFieldProps('fsType', {
        initialValue: 'ext4',
        required: true,
        message: '不能为空'
      })
      return <FormItem
        label="存储设置"
        {...formItemLayout}
      >
        <Input
          placeholder="请输入存储名称"
          {...getFieldProps('setting', {
            rules: [{
              validator: (rule, value, callback) => {
                if (!value) {
                  return callback('存储设置不能为空')
                }
                return callback()
              }
            }]
          }) }
        />
      </FormItem>
    }
    return null
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
        'strategy',
        'readOnly',
      ]
      let array = []
      const volumeType = form.getFieldValue("type")
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
            'setting'
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
    const { form } = this.props
    form.setFieldsValue({
      volumeIsOld: value.split(' ')[3] === 'true',
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
    volumes.forEach(volume => {
      const { name, fsType, size, isOld } = volume
      const value = `${name} ${fsType || '-'} ${size || '-'} ${isOld || '-'}`
      let disabled = selectedVolumes.indexOf(value) > -1
      options.push(
        <Option
          key={value}
          disabled={disabled}
        >
          {name} {fsType} {size}
        </Option>
      )
    })
    return options
  },

  render() {
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
        rules: [{
          required: true,
          initialValue: false,
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
              服务中含有以下设置不能添加 <span style={{ fontWeight: 'bold' }}>独享型或host存储：</span><br />
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
                >
                  <Option key="host" value="host" disabled={unableToChangeType}>host</Option>
                  <Option key="private" value="private" disabled={unableToChangeType}>独享型</Option>
                  <Option key="share" value="share">共享型</Option>
                </Select>
              </FormItem>
              {
                type === 'private' || type === "share"
                  ? <FormItem className='not_host_type'>
                    <Select
                      placeholder="请选择"
                      {...getFieldProps('type_1', {
                        rules: [{
                          required: true,
                          message: '不能为空'
                        }]
                      }) }
                    >
                      {
                        type === 'private'
                          ? <Option type="rbd" value="rbd">RBD</Option>
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
                    >
                      {this.renderVolumesOptions()}
                    </Select>
                  </FormItem>
                  {
                    volume === 'create' && <FormItem className='not_host_type'>
                      <Select
                        placeholder="请选择一个 server"
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
                              {server.parameters.ip || server.metadata.name}
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
              label={
                <span>回收策略
                  <Tooltip
                    title={
                      <div>
                        <div>保留：服务删除时删除存储</div>
                        <div>删除：删除服务时删除存储</div>
                      </div>
                    }
                  >
                    <Icon type="question-circle-o" className='question_icon' />
                  </Tooltip>
                </span>
              }
              {...formItemLayout}
              className='strategy form_item_bottom'
            >
              <Radio.Group
                disabled={type == 'host'}
                {...getFieldProps('strategy', {
                  initialValue: true,
                }) }
              >
                <Radio key="yes" value={true}>保留</Radio>
                <Radio key="no" value={false} className='delete'>删除</Radio>
              </Radio.Group>
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
  return {
    clusterID,
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