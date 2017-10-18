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
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import cloneDeep from 'lodash/cloneDeep'
import { loadStorageList, searchStorage} from '../../../actions/storage'
import { DEFAULT_IMAGE_POOL } from '../../../constants'
import { formatDate } from '../../../common/tools'

class HostMemory extends Component {
  constructor(props) {
    super(props)
    this.onSelectChange = this.onSelectChange.bind(this)
    this.tableRowClick = this.tableRowClick.bind(this)
    this.state = {
      selectedRowKeys: [],
      confirmLoading: false,
      deleteModalVisible: false,
    }
  }

  reloadData(){
    const { loadStorageList, cluster } = this.props
    const clusterID = cluster.clusterID
    const query = {
      storagetype: 'host',
      srtype: 'host'
    }
    loadStorageList(DEFAULT_IMAGE_POOL, clusterID, query)
  }

  componentWillMount() {
    this.reloadData()
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

  confirmDeleteItem(){
    this.setState({
      confirmLoading: false,
      deleteModalVisible: false,
    })
  }

  tableRowClick(record, index) {
    const { selectedRowKeys } = this.state
    const newSelectedRowKeys = cloneDeep(selectedRowKeys)
    if(newSelectedRowKeys.indexOf(index) > -1){
      newSelectedRowKeys.splice(newSelectedRowKeys.indexOf(index), 1)
    } else {
      newSelectedRowKeys.push(index)
    }
    this.setState({
      selectedRowKeys: newSelectedRowKeys
    })
  }

  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  searchHostVolume(){
    const searchValue = document.getElementById('search_host_volume').value
    const { searchStorage } = this.props
    searchStorage(searchValue, 'host')
  }

  render() {
    const {
      selectedRowKeys, deleteModalVisible,
      confirmLoading,
    } = this.state
    const { storageList } = this.props
    const columns = [
      {
        key: 'id',
        title: 'ID',
        dataIndex: 'name',
        width: '20%',
        render: (text, record, index) => <div
          className='storage_name'
          onClick={() => browserHistory.push(`/app_manage/storage/hostMemory/${text}?path=${record.mountPath}&ip=${record.storageIP}`)}
        >{text}</div>
      }, {
        key: 'mountPath',
        title: '宿主机目录',
        dataIndex: 'mountPath',
        width: '20%',
      }, {
        key:'serviceName',
        title:'服务',
        dataIndex:'serviceName',
        width:'20%',
      }, {
        key: 'type',
        title: '类型',
        dataIndex: 'storageType',
        width: '20%',
      }, {
        key: 'node',
        title: '存储节点',
        dataIndex: 'storageIP',
        width: '20%',
      //}, {
      //  key: 'createTime',
      //  title: '创建时间',
      //  dataIndex: 'createTime',
      //  width: '15%',
      //  render: (text) => <div>{ formatDate(text) }</div>,
      //  sorter: (a, b) => a - b,
      }
    ]
    const rowSelection = {
      getCheckboxProps: record => ({
        disabled: record.service !== '-',
      }),
      selectedRowKeys,
      onChange: this.onSelectChange,
    }
    const dataSource = storageList.storageList || []
    const isFetching = storageList.isFetching
    return(
      <QueueAnim className='host_memory'>
        <div id='host_memory' key="host_memory">
          <div className='alertRow'>
            host类型存储仅支持一个容器实例对一个宿主机目录读写操作
          </div>
          <div className='data_container'>
            <div className='handle_box'>
              <Button
                size="large"
                className='button_margin'
                onClick={() => this.reloadData()}
              >
                <i className="fa fa-refresh button_icon" aria-hidden="true"></i>
                刷新
              </Button>
              {/*<Button
                size="large"
                icon="delete"
                className='button_margin'
                onClick={() => this.deleteItem()}
                disabled={!selectedRowKeys.length}
              >
                删除
              </Button>*/}
              <div className='search_box'>
                <Input
                  size="large"
                  placeholder="按服务名称搜索"
                  id='search_host_volume'
                  onPressEnter={() => this.searchHostVolume()}
                />
                <i className="fa fa-search search_icon" aria-hidden="true" onClick={() => this.searchHostVolume()}></i>
              </div>
              {
                dataSource.length
                  ? <div className='totle_num'>共计 {dataSource.length} 条</div>
                  : null
              }
            </div>
            <div className='table_container'>
              <Table
                columns={columns}
                dataSource={dataSource}
                //rowSelection={rowSelection}
                pagination={{ simple: true }}
                loading={isFetching}
                //onRowClick={this.tableRowClick}
              />
            </div>
          </div>

          <Modal
            title="删除操作"
            visible={deleteModalVisible}
            closable={true}
            onOk={() => this.confirmDeleteItem()}
            onCancel={() =>  this.setState({deleteModalVisible: false})}
            width="570px"
            maskClosable={false}
            confirmLoading={confirmLoading}
            wrapClassName="delete_host_memory_modal"
          >
            <div className='warning_tips'>
              <Icon type="question-circle-o" className='question_icon'/>
              确定要删出这 {selectedRowKeys.length} 个存储目录吗？
            </div>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProp(state, props) {
  const { entities, storage } = state
  const { current } = entities
  const defaultStorageList = {
    isFetching: false,
    storageList: []
  }
  return {
    cluster: current.cluster,
    storageList: storage.storageList[DEFAULT_IMAGE_POOL] || defaultStorageList
  }
}

export default connect(mapStateToProp, {
  loadStorageList,
  searchStorage,
})(HostMemory)