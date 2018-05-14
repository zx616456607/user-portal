/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Access Method component
 *
 * v0.1 - 2017-7-3
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Button, Input, Table, Modal, Form, Select, Icon, Tooltip, Col, InputNumber, Slider } from 'antd'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import QueueAnim from 'rc-queue-anim'
import yaml from 'js-yaml'
import { getClusterStorageList } from '../../../actions/cluster'
import { createStorage, loadStorageList, deleteStorage, searchStorage, getCheckVolumeNameExist } from '../../../actions/storage'
import PersistentVolumeClaim from '../../../../kubernetes/objects/persistentVolumeClaim'
import { serviceNameCheck } from '../../../common/naming_validation'
import { formatDate, adjustBrowserUrl, mergeQueryFunc } from '../../../common/tools'
import { DEFAULT_IMAGE_POOL, ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import NotificationHandler from '../../Notification'
import './style/index.less'

const FormItem = Form.Item
const Option = Select.Option

const DEFAULT_QUERY = {
  storagetype: 'nfs,glusterfs',
  srtype: 'share',
}

class ShareMemory extends Component {
  constructor(props) {
    super(props)
    this.onSelectChange = this.onSelectChange.bind(this)
    this.tableRowClick = this.tableRowClick.bind(this)
    this.loadData = this.loadData.bind(this)
    this.searchStorage = this.searchStorage.bind(this)
    this.checkVolumeNameExist = this.checkVolumeNameExist.bind(this)
    this.state = {
      selectedRowKeys: [],
      createShareMemoryVisible: false,
      confirmLoading: false,
      deleteModalVisible: false,
      searchInput: '',
      modalStorageType: 'nfs',
      sliderValue: 1,
      filteredValue: [],
    }
  }

  loadData(query = {}, isFirstLoad) {
    const { loadStorageList, clusterID, location } = this.props
    const { searchInput } = this.state
    query = Object.assign({}, mergeQueryFunc(DEFAULT_QUERY, query))
    loadStorageList(DEFAULT_IMAGE_POOL, clusterID, query, {
      success: {
        func: () => {
          this.setState({ selectedRowKeys: [] })
          if (searchInput) {
            return this.searchStorage(query)
          }
          //adjustBrowserUrl(location, query, isFirstLoad)
        },
        isAsync: true,
      }
    })
  }

  componentDidMount() {
    this.loadData({}, true)
  }

  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  deleteItem(){
    const { selectedRowKeys } = this.state
    if(!selectedRowKeys.length){
      return
    }
    this.setState({
      confirmLoading: false,
      deleteModalVisible: true,
    })
  }

  confirmDeleteItem() {
    const { deleteStorage, clusterID, location } = this.props
    const { query = {} } = location
    const { selectedRowKeys, searchInput } = this.state
    const notification = new NotificationHandler
    this.setState({
      confirmLoading: true,
    })
    deleteStorage(DEFAULT_IMAGE_POOL, clusterID, { volumes: selectedRowKeys }, {
      success: {
        func: () => {
          notification.success(`删除存储卷 ${selectedRowKeys.join(', ')} 成功`)
          this.loadData({ page: query.page || 1, search: searchInput })
          this.setState({
            deleteModalVisible: false,
          })
        },
        isAsync: true,
      },
      error: {
        func: () => {
          notification.error(`删除存储卷 ${selectedRowKeys.join(', ')} 失败`)
        },
      },
      finally: {
        func: () => {
          this.setState({
            confirmLoading: false,
          })
        },
      },
    })
  }

  tableRowClick(record, index) {
    if (record.status == 'used') {
      return
    }
    const { selectedRowKeys } = this.state
    const newSelectedRowKeys = cloneDeep(selectedRowKeys)
    if(newSelectedRowKeys.indexOf(record.name) > -1){
      newSelectedRowKeys.splice(newSelectedRowKeys.indexOf(record.name), 1)
    } else {
      newSelectedRowKeys.push(record.name)
    }
    this.setState({
      selectedRowKeys: newSelectedRowKeys
    })
  }

  openCreateModal(){
    const { form, getClusterStorageList, clusterID } = this.props
    form.resetFields()
    this.setState({
      createShareMemoryVisible: true,
      confirmLoading: false,
    })
    getClusterStorageList(clusterID)
  }

  confirmCreateShareMemory() {
    const { form, createStorage, clusterID } = this.props
    const notification = new NotificationHandler()
    const viladateArray = [
      'storageType',
      'storageClassName',
      'name',
    ]
    if(this.state.modalStorageType === 'glusterfs'){
      viladateArray.push('storage');
    }
    this.setState({ confirmLoading: true })
    form.validateFields(viladateArray, (errors, values) => {
      if(!!errors){
        this.setState({
          confirmLoading: false,
        })
        return
      }
      const { name, storageType, storageClassName } = values
      const config = {
        name,
        storageType,
        storageClassName,
        reclaimPolicy: 'retain',
      }
      if(storageType === 'glusterfs'){
        config.storage = values.storage
      }
      const persistentVolumeClaim = new PersistentVolumeClaim(config)
      const body = {
        cluster: clusterID,
        template: yaml.dump(persistentVolumeClaim),
      }
      createStorage(body, {
        success: {
          func: () => {
            notification.success(`创建共享型存储 ${name} 操作成功`)
            this.setState({
              createShareMemoryVisible: false,
              searchInput: '',
            })
            this.loadData({ page: 1, search: '' })
          },
          isAsync: true,
        },
         error: {
          func: () => {
            notification.error(`创建共享型存储 ${name} 操作失败`)
          }
        },
        finally: {
          func: () => {
            this.setState({
              confirmLoading: false,
              modalStorageType: 'nfs'
            })
          }
        }
      })
    })
  }

  searchStorage(query = { page: 1}) {
    const { searchInput } = this.state
    const { searchStorage, location } = this.props
    searchStorage(searchInput.trim())
    const mergedQuery = mergeQueryFunc(DEFAULT_QUERY, { page: query.page, search: searchInput})
    adjustBrowserUrl(location, mergedQuery)
  }

  formatStatus(status){
    switch(status){
      case 'pending':
        return <span>
        <i className="fa fa-circle icon-marginRight penging"></i>
        创建中
      </span>
      case 'used':
        return <span>
        <i className="fa fa-circle icon-marginRight used"></i>
        使用中
      </span>
      case 'unused':
        return <span>
        <i className="fa fa-circle icon-marginRight no_used"></i>
        未使用
      </span>
      default:
        return <span>
        <i className="fa fa-circle icon-marginRight unknown"></i>
        未知
      </span>
    }
  }

  checkVolumeNameExist(rule, value, callback) {
    const { getCheckVolumeNameExist, clusterID } = this.props
    let msg = serviceNameCheck(value, '存储名称')
    if (msg !== 'success') {
      return callback(msg)
    }
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
  }
  onModalStorageTypeChange = (value) => {
    this.setState({
      modalStorageType: value
    })
  }
  onSliderChange = (num) => {
    this.props.form.setFieldsValue({
      storage: num
    })
    this.setState({
      sliderValue: num
    })
  }

  onTableChange = (pagination, filters, sorter) => {
    if(!!filters && !!filters.format){
      if(filters.format.length === 0){
        this.setState({
          filteredValue: [],
        }, () => {
          this.loadData();
        })
      }else{
        this.setState({
          filteredValue: filters.format,
        }, () => {
          this.loadData({storagetype: this.state.filteredValue.join(",")});
        })
      }
    }
  }
  reflesh(query, searchInput) {
    this.setState({
      filteredValue: []
    }, () => {
      this.loadData({ page: parseInt(query.page) || 1, search: searchInput })
    })
  }
  render() {
    const {
      form, nfsList, storageList, storageListIsFetching, clusterID,
      storageClassType, location, gfsList
    } = this.props
    const {
      selectedRowKeys,
      createShareMemoryVisible,
      confirmLoading,
      deleteModalVisible,
      searchInput,
    } = this.state
    const { query = {} } = location
    const { getFieldProps } = form
    const columns = [
      {
        key: 'name',
        title: '存储名称',
        dataIndex: 'name',
        width: '15%',
        render: (text, record, index) => {
          return (
            <Link to={`/app_manage/storage/shared/${clusterID}/${text}?diskType=${record.diskType}`}>
              {text}
            </Link>
          )
        }
      },
      {
        key: 'status',
        title: '状态',
        dataIndex: 'status',
        width: '10%',
        render: (status, record) => <div>{ this.formatStatus(status, record)}</div>
      },
      {
        key: 'format',
        title: '类型',
        dataIndex: 'diskType',
        filteredValue: this.state.filteredValue,
        filters:[
          { text: 'GlusterFS', value: 'glusterfs' },
          { text: 'NFS', value: 'nfs' }
        ],
        width: '15%',
      },
      {
        key: 'storageServer',
        title: '存储 server',
        dataIndex: 'storageServer',
        width: '20%',
      },
      {
        key: 'deployServiceList',
        title: '共享服务',
        dataIndex: 'deployServiceList',
        width: '20%',
        render: deployServiceList => deployServiceList && deployServiceList.length || '-'
      },
      {
        key: 'createTime',
        title: '创建时间',
        dataIndex: 'createTime',
        width: '20%',
        sorter: (a, b) => new Date(formatDate(a.createTime)) - new Date(formatDate(b.createTime)),
        render: text => formatDate(text)
      }
    ]
    const rowSelection = {
      getCheckboxProps: record => ({
        disabled: record.status == 'used',    // 配置无法勾选的列
      }),
      selectedRowKeys,
      onChange: this.onSelectChange,
    }
    const formItemLayout = {
    	labelCol: {span: 5},
    	wrapperCol: {span: 16}
    }
    let canCreate = false
    if(storageClassType.share){
      canCreate = storageClassType.share
    }
    let title = ''
    if (!canCreate) {
      title = '尚未配置共享存储，暂不能创建'
    }
    const mergedQuery = mergeQueryFunc(DEFAULT_QUERY, { page: query.page || 1, search: query.search })
    const paginationProps = {
      simple: true,
      current: parseInt(query.page) || 1,
      onChange: (page) => {
        console.log("page", Object.assign({}, mergedQuery, {page}))
        adjustBrowserUrl(location, Object.assign({}, mergedQuery, {page}));
      },
    }
    return(
      <QueueAnim className='share_memory'>
        <div id='share_memory' key="share_memory">
          <div className='alertRow'>
            共享型存储支持多个容器实例同时对同一个共享目录进行读写操作
          </div>
          <div className='data_container'>
            <div className='handle_box'>
              <Tooltip title={title} placement="right">
                <Button
                  type="primary"
                  size='large'
                  className='button_margin'
                  onClick={() => this.openCreateModal()}
                  disabled={!canCreate}
                >
                  <i className="fa fa-plus button_icon" aria-hidden="true"></i>
                  创建共享存储
                </Button>
              </Tooltip>
              <Button
                size="large"
                className='button_refresh'
                onClick={this.reflesh.bind(this, query, searchInput)}
              >
                <i className="fa fa-refresh button_icon" aria-hidden="true"
                  onClick={this.reflesh.bind(this, query, searchInput)}
                />
                刷新
              </Button>
              <Button
                size="large"
                icon="delete"
                className='button_refresh'
                onClick={() => this.deleteItem()}
                disabled={!selectedRowKeys.length}
              >
                删除
              </Button>
              <div className='search_box'>
                <Input
                  size="large"
                  placeholder="按存储名称搜索"
                  value={searchInput}
                  onChange={e => this.setState({ searchInput: e.target.value })}
                  onPressEnter={() => this.searchStorage({ page: 1 })}
                />
                <i className="fa fa-search search_icon" onClick={this.searchStorage}></i>
              </div>
              {
                storageList.length
                ? <div className='totle_num'>共计 {storageList.length} 条</div>
                : null
              }
            </div>
            <div className="table_container">
              <Table
              	columns={columns}
              	dataSource={storageList}
              	rowSelection={rowSelection}
              	pagination={paginationProps}
              	loading={storageListIsFetching}
                onRowClick={this.tableRowClick}
                rowKey={row => row.name}
                onChange={this.onTableChange}
              />
            </div>
          </div>
          <Modal
            title="删除存储卷操作"
            visible={deleteModalVisible}
            closable={true}
            onOk={() => this.confirmDeleteItem()}
            onCancel={() => this.setState({deleteModalVisible:false})}
            width="570px"
            maskClosable={false}
            confirmLoading={confirmLoading}
            wrapClassName="delete_share_memory_modal"
          >
            <div className='warning_tips'>
              <Icon type="question-circle-o" className='question_icon'/>
              确定要删除这 {selectedRowKeys.length} 个存储吗？
            </div>
          </Modal>
          <Modal
            className="createShareMemoryModal"
            title="创建共享存储目录"
            visible={createShareMemoryVisible}
            closable={true}
            onOk={() => this.confirmCreateShareMemory()}
            onCancel={() => this.setState({createShareMemoryVisible:false, modalStorageType: 'nfs'})}
            width="570px"
            maskClosable={false}
            confirmLoading={confirmLoading}
            wrapClassName="create_share_memory_path"
          >
            <Form>
              <FormItem
                label="存储类型"
                {...formItemLayout}
              >
                <Select
                  placeholder='请选择类型'
                  {...getFieldProps('storageType', {
                    initialValue:'nfs',
                    onChange: this.onModalStorageTypeChange
                  })}
                  className="left"
                >
                  <Option key="nfs" value="nfs">NFS</Option>
                  <Option key="glusterfs" value="glusterfs">GlusterFS</Option>
                </Select>
                <FormItem
                  className="right"
                >
                  <Select
                    placeholder='请选择一个server'
                    {...getFieldProps('storageClassName', {
                      rules:[{
                        required:true,
                        message:'server不能为空',
                      }],
                    })}
                  >
                  {
                    this.state.modalStorageType === 'nfs' ?
                    nfsList.map(nfs =>
                      <Option key={nfs.metadata.name}>
                        {nfs.metadata.annotations['tenxcloud.com/scName'] || nfs.metadata.name}
                      </Option>
                    )
                    :
                    gfsList.map(gfs =>
                      <Option key={gfs.metadata.name}>
                        {(!!gfs.metadata.annotations && gfs.metadata.annotations['tenxcloud.com/scName']) || gfs.metadata.name}
                      </Option>
                    )
                  }
                  </Select>
                </FormItem>

              </FormItem>
              <FormItem
                label="存储名称"
                {...formItemLayout}
              >
                <Input
                  placeholder="请输入存储名称"
                  {...getFieldProps('name', {
                    rules:[{
                      validator: this.checkVolumeNameExist
                    }],
                  })}
                />
              </FormItem>
              {
                this.state.modalStorageType === 'nfs' ?
                null
                :
                <FormItem
                  label="存储大小"
                  {...formItemLayout}
                >
                  <Col
                    className="left">
                    <Slider min={1} max={20} onChange={this.onSliderChange} value={this.state.sliderValue} />
                  </Col>
                  <Col
                    className="right">
                    <InputNumber
                      className="inputNumWid"
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
                  </Col>
                  <div className='unit'>GB</div>
                </FormItem>
              }
            </Form>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

ShareMemory = Form.create()(ShareMemory)

function mapStateToProp(state, props) {
  const { entities, cluster, storage } = state
  const { current } = entities
  const clusterID = current.cluster.clusterID
  const nfsList = cluster.clusterStorage && cluster.clusterStorage[clusterID] && cluster.clusterStorage[clusterID].nfsList || [];
  const gfsList = cluster.clusterStorage && cluster.clusterStorage[clusterID] && cluster.clusterStorage[clusterID].glusterfsList || [];
  const storageList = storage.storageList[DEFAULT_IMAGE_POOL] || {}
  let defaultStorageClassType = {
    private: false,
    share: false,
    host: false,
  }
  if(current.cluster.storageClassType){
    defaultStorageClassType = current.cluster.storageClassType
  }
  return {
    clusterID,
    nfsList,
    gfsList,
    storageList: storageList && storageList.storageList || [],
    storageListIsFetching: storageList.isFetching,
    storageClassType: defaultStorageClassType,
  }
}

export default connect(mapStateToProp, {
  getClusterStorageList,
  createStorage,
  loadStorageList,
  deleteStorage,
  searchStorage,
  getCheckVolumeNameExist,
})(ShareMemory)