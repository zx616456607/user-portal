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
import { formatDate, adjustBrowserUrl, mergeQueryFunc } from '../../../common/tools'
import { injectIntl, FormattedMessage } from 'react-intl'
import StorageIntl from '../StorageIntl'
import Title from '../../Title'

const DEFAULT_QUERY = {
  storagetype: 'host',
  srtype: 'host'
}

class HostMemory extends Component {
  constructor(props) {
    super(props)
    this.onSelectChange = this.onSelectChange.bind(this)
    this.tableRowClick = this.tableRowClick.bind(this)
    this.searchHostVolume = this.searchHostVolume.bind(this)
    this.state = {
      selectedRowKeys: [],
      confirmLoading: false,
      deleteModalVisible: false,
      searchInput: '',
    }
  }

  loadData(query, isFirstLoad){
    const { loadStorageList, cluster, location } = this.props
    const clusterID = cluster.clusterID
    const { searchInput } = this.state
    query = Object.assign({}, mergeQueryFunc(DEFAULT_QUERY, query))
    loadStorageList(DEFAULT_IMAGE_POOL, clusterID, mergeQueryFunc(DEFAULT_QUERY, query), {
      success: {
        func: () => {
          this.setState({ selectedRowKeys: [] })
          if (searchInput) {
            return this.searchHostVolume(query)
          }
          adjustBrowserUrl(location, query, isFirstLoad)
        },
        isAsync: true,
      }
    })
  }

  componentWillMount() {
    this.loadData({}, true)
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

  searchHostVolume(query = { page: 1 }){
    const { location } = this.props
    const { searchInput } = this.state
    const searchValue = searchInput.trim()
    const { searchStorage } = this.props
    searchStorage(searchValue, 'host')
    const mergedQuery = mergeQueryFunc(DEFAULT_QUERY, { page: query.page, search: searchInput })
    adjustBrowserUrl(location, mergedQuery)
  }

  render() {
    const {
      selectedRowKeys, deleteModalVisible,
      confirmLoading, searchInput,
    } = this.state
    const { storageList, location, intl } = this.props
    const { formatMessage } = intl
    const { query = {} } = location
    const columns = [
      {
        key: 'id',
        title: 'ID',
        dataIndex: 'name',
        width: '20%',
        render: (text, record, index) => <div
          className='storage_name'
          onClick={() => browserHistory.push(`/app_manage/storage/host/${text}?path=${record.mountPath}&ip=${record.storageIP}`)}
        >{text}</div>
      }, {
        key: 'mountPath',
        title: <FormattedMessage {...StorageIntl.hostDir} />,
        dataIndex: 'mountPath',
        width: '20%',
      }, {
        key:'serviceName',
        title: <FormattedMessage {...StorageIntl.service} />,
        dataIndex:'serviceName',
        width:'20%',
      }, {
        key: 'type',
        title: <FormattedMessage {...StorageIntl.type} />,
        dataIndex: 'storageType',
        width: '20%',
      }, {
        key: 'node',
        title: <FormattedMessage {...StorageIntl.nodeVolume} />,
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
    const paginationProps = {
      simple: true,
      current: parseInt(query.page) || 1,
      onChange: page => adjustBrowserUrl(location, mergeQueryFunc(DEFAULT_QUERY, { page, search: query.search })),
    }
    return(
      <QueueAnim className='host_memory'>
        <div id='host_memory' key="host_memory">
          <Title title="本地存储" />
          <div className='alertRow'>
            <FormattedMessage {...StorageIntl.localVolumeTips} />
          </div>
          <div className='data_container'>
            <div className='handle_box'>
              <Button
                size="large"
                className='button_refresh'
                onClick={() => this.loadData({ page: parseInt(query.page) || 1, search: searchInput })}
              >
                <i className="fa fa-refresh button_icon" aria-hidden="true"
                  onClick={() => this.loadData({ page: parseInt(query.page) || 1, search: searchInput })}
                />
                <FormattedMessage {...StorageIntl.refresh} />
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
                  placeholder= {formatMessage(StorageIntl.pleaseServiceName)}
                  id='search_host_volume'
                  onChange={e => this.setState({ searchInput: e.target.value })}
                  onPressEnter={() => this.searchHostVolume({ page: 1 })}
                />
                <i className="fa fa-search search_icon" aria-hidden="true"
                  onClick={() => this.searchHostVolume({ page: 1 })} />
              </div>
              {
                dataSource.length
                  ? <div className='totle_num'><FormattedMessage{...StorageIntl.totalItems} /> {dataSource.length} <FormattedMessage{...StorageIntl.item} /></div>
                  : null
              }
            </div>
            <div className='table_container'>
              <Table
                columns={columns}
                dataSource={dataSource}
                //rowSelection={rowSelection}
                pagination={paginationProps}
                loading={isFetching}
                //onRowClick={this.tableRowClick}
              />
            </div>
          </div>

          <Modal
            title= {<FormattedMessage {...StorageIntl.deleteAct} />}
            visible={deleteModalVisible}
            closable={true}
            onOk={() => this.confirmDeleteItem()}
            onCancel={() =>  this.setState({deleteModalVisible: false})}
            width="570px"
            maskClosable={false}
            confirmLoading={confirmLoading}
            wrapClassName="delete_host_memory_modal"
          >
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
              <FormattedMessage {...StorageIntl.sureDelete} />
              <span style={{ padding: '0 3px' }}> {selectedRowKeys.length} </span>
              <FormattedMessage{...StorageIntl.aStorage} />？
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

HostMemory = injectIntl(HostMemory, {withRef: true})

export default connect(mapStateToProp, {
  loadStorageList,
  searchStorage,
})(HostMemory)