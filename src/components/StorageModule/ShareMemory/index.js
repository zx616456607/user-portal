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
import { Button, Input, Table, Modal, Form, Select, Icon } from 'antd'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import yaml from 'js-yaml'
import { getClusterStorageList } from '../../../actions/cluster'
import { createStorage, loadStorageList, deleteStorage, searchStorage } from '../../../actions/storage'
import PersistentVolumeClaim from '../../../../kubernetes/objects/persistentVolumeClaim'
import { serviceNameCheck } from '../../../common/naming_validation'
import { formatDate } from '../../../common/tools'
import { DEFAULT_IMAGE_POOL } from '../../../constants'
import NotificationHandler from '../../Notification'
import './style/index.less'
import cloneDeep from 'lodash/cloneDeep'

const FormItem = Form.Item
const Option = Select.Option

class ShareMemory extends Component {
  constructor(props) {
    super(props)
    this.onSelectChange = this.onSelectChange.bind(this)
    this.tableRowClick = this.tableRowClick.bind(this)
    this.loadData = this.loadData.bind(this)
    this.searchStorage = this.searchStorage.bind(this)
    this.state = {
      selectedRowKeys: [],
      createShareMemoryVisible: false,
      confirmLoading: false,
      deleteModalVisible: false,
      searchInput: '',
    }
  }

  loadData(query) {
    const { loadStorageList, clusterID } = this.props
    const defaultQuery = {
      storagetype: 'nfs',
      srtype: 'share',
    }
    query = Object.assign({}, defaultQuery, query)
    loadStorageList(DEFAULT_IMAGE_POOL, clusterID, query)
    this.setState({
      selectedRowKeys: [],
    })
  }

  componentDidMount() {
    this.loadData()
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
    const { deleteStorage, clusterID } = this.props
    const { selectedRowKeys } = this.state
    const notification = new NotificationHandler
    this.setState({
      confirmLoading: true,
    })
    deleteStorage(DEFAULT_IMAGE_POOL, clusterID, { volumes: selectedRowKeys }, {
      success: {
        func: () => {
          notification.success(`删除存储卷 ${selectedRowKeys.join(', ')} 成功`)
          this.loadData()
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
      'name'
    ]
    form.validateFields(viladateArray, (errors, values) => {
      if(!!errors){
        this.setState({
          confirmLoading: false,
        })
        return
      }
      this.setState({
        confirmLoading: true,
      })
      const { name, storageType, storageClassName } = values
      const persistentVolumeClaim = new PersistentVolumeClaim({
        name,
        storageType,
        storageClassName,
      })
      const body = {
        cluster: clusterID,
        template: yaml.dump(persistentVolumeClaim),
      }
      createStorage(body, {
        success: {
          func: res => {
            console.log('res, res', res)
            notification.success(`创建共享存储 ${name} 成功`)
            this.setState({
              createShareMemoryVisible: false,
            })
            this.loadData()
          },
          isAsync: true,
        },
         error: {
          func: err => {
            console.log('err, err', err)
            notification.error(`创建共享存储 ${name} 失败`)
          }
        },
        finally: {
          func: () => {
            this.setState({
              confirmLoading: false,
            })
          }
        }
      })
    })
  }

  searchStorage() {
    const { searchInput } = this.state
    const { searchStorage } = this.props
    searchStorage(searchInput)
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

  render() {
    const { form, nfsList, storageList, storageListIsFetching, clusterID } = this.props
    const {
      selectedRowKeys,
      createShareMemoryVisible,
      confirmLoading,
      deleteModalVisible,
      searchInput,
    } = this.state
    const { getFieldProps } = form
    const columns = [
      {
        key: 'name',
        title: '存储名称',
        dataIndex: 'name',
        width: '15%',
        render: (text, record, index) => (
          <Link to={`/app_manage/shareMemory/${clusterID}/${text}`}>
            {text}
          </Link>
        )
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
        dataIndex: 'format',
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
      selectedRowKeys,
      onChange: this.onSelectChange,
    }
    const formItemLayout = {
    	labelCol: {span: 5},
    	wrapperCol: {span: 16}
    }
    return(
      <QueueAnim className='share_memory'>
        <div id='share_memory' key="share_memory">
          <div className='alertRow'>
            共享型存储支持多个容器实例同时对同一个共享目录进行读写操作
          </div>
          <div className='data_container'>
            <div className='handle_box'>
              <Button
                type="primary"
                size='large'
                className='button_margin'
                onClick={() => this.openCreateModal()}
              >
                <i className="fa fa-plus button_icon" aria-hidden="true"></i>
                创建共享存储
              </Button>
              <Button
                size="large"
                className='button_margin'
                onClick={this.loadData}
              >
                <i className="fa fa-refresh button_icon" aria-hidden="true"></i>
                刷新
              </Button>
              <Button
                size="large"
                icon="delete"
                className='button_margin'
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
                  onPressEnter={this.searchStorage}
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
              	pagination={{ simple: true }}
              	loading={storageListIsFetching}
                onRowClick={this.tableRowClick}
                rowKey={row => row.name}
              />
            </div>
          </div>
          <Modal
            title="删除操作"
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
              确定要删除存储 {selectedRowKeys.join(', ')} 吗？
            </div>
          </Modal>
          <Modal
            title="创建共享存储目录"
            visible={createShareMemoryVisible}
            closable={true}
            onOk={() => this.confirmCreateShareMemory()}
            onCancel={() => this.setState({createShareMemoryVisible:false})}
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
                  disabled={true}
                  {...getFieldProps('storageType', {
                    initialValue:'nfs',
                  })}
                  style={{width:160, marginRight:20}}
                >
                  <Option key="nfs" value="nfs">nfs</Option>
                </Select>
                <FormItem
                  style={{width:160, float:'right'}}
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
                    nfsList.map(nfs =>
                      <Option key={nfs.metadata.name}>
                        {nfs.parameters.ip || 'nfs'}
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
                      validator:(rule, value, callback) => {
                        const msg = serviceNameCheck(value, '存储名称')
                        if (msg !== 'success') {
                          return callback(msg)
                        }
                        return callback()
                      },
                    }],
                  })}
                />
              </FormItem>
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
  const nfsList = cluster.clusterStorage && cluster.clusterStorage[clusterID] && cluster.clusterStorage[clusterID].nfsList || []
  let storageList = storage.storageList[DEFAULT_IMAGE_POOL] || {}
  return {
    clusterID,
    nfsList,
    storageList: storageList && storageList.storageList || [],
    storageListIsFetching: storageList.isFetching,
  }
}

export default connect(mapStateToProp, {
  getClusterStorageList,
  createStorage,
  loadStorageList,
  deleteStorage,
  searchStorage,
})(ShareMemory)