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
import { Button, Input, Table, Modal, Form, Select, Radio, Tooltip, Col, InputNumber, Slider } from 'antd'
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
import { injectIntl, FormattedMessage } from 'react-intl'
import StorageIntl from '../StorageIntl'
import Title from '../../../components/Title'
import ResourceBanner from '../../TenantManage/ResourceBanner'
import TimeHover from '@tenx-ui/time-hover/lib'


const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const PATH_REG = /^\//

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
      serverType: 'random',// server共享目录
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
    const { deleteStorage, clusterID, location, intl } = this.props
    const { query = {} } = location
    const { formatMessage } = intl
    const { selectedRowKeys, searchInput } = this.state
    const notification = new NotificationHandler
    this.setState({
      confirmLoading: true,
    })
    deleteStorage(DEFAULT_IMAGE_POOL, clusterID, { volumes: selectedRowKeys }, {
      success: {
        func: () => {
          // notification.success(`删除存储卷 ${selectedRowKeys.join(', ')} 成功`)
          notification.success(formatMessage(StorageIntl.deleteSuccess), selectedRowKeys.join(', '))
          this.loadData({ page: query.page || 1, search: searchInput })
          this.setState({
            deleteModalVisible: false,
          })
        },
        isAsync: true,
      },
      error: {
        func: () => {
          notification.error(formatMessage(StorageIntl.deleteFailed))
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
    const { getFieldValue, resetFields, setFieldsValue } = form
    resetFields()
    this.setState({
      createShareMemoryVisible: true,
      confirmLoading: false,
    })
    getClusterStorageList(clusterID)
  }

  confirmCreateShareMemory() {
    const { form, createStorage, clusterID, intl } = this.props
    const { formatMessage } = intl
    const notification = new NotificationHandler()
    const viladateArray = this.state.serverType === 'custom' ? [
      'storageType',
      'storageClassName',
      'name',
      'serverDir'
    ] : [
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
      const { name, storageType, storageClassName, serverDir } = values
      const config = {
        name,
        storageType,
        storageClassName,
        reclaimPolicy: 'retain',
        serverDir
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
            notification.success(
              formatMessage(StorageIntl.create)+
              formatMessage(StorageIntl.commonStorage)+
              name +
              formatMessage(StorageIntl.actionSuccess)
            )
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
            notification.error(
              formatMessage(StorageIntl.create)+
              formatMessage(StorageIntl.commonStorage)+
              name +
              formatMessage(StorageIntl.actionFailed)
            )
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
        <FormattedMessage {...StorageIntl.createing} />
      </span>
      case 'used':
        return <span>
        <i className="fa fa-circle icon-marginRight used"></i>
        <FormattedMessage {...StorageIntl.useing} />
      </span>
      case 'unused':
        return <span>
        <i className="fa fa-circle icon-marginRight no_used"></i>
        <FormattedMessage {...StorageIntl.nouse} />
      </span>
      default:
        return <span>
        <i className="fa fa-circle icon-marginRight unknown"></i>
        <FormattedMessage {...StorageIntl.unknown} />
      </span>
    }
  }

  checkVolumeNameExist(rule, value, callback) {
    const { getCheckVolumeNameExist, clusterID, intl } = this.props
    const { formatMessage } = intl
    let msg = serviceNameCheck(value, formatMessage(StorageIntl.storageName))
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
              msg = serviceNameCheck(value, formatMessage(StorageIntl.storageName), true)
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
    }, () => {
      const { nfsList, gfsList, form } = this.props
      const { setFieldsValue } = form
      let storageClassName
      let tempList
      if(value === 'nfs'){
        tempList = nfsList
        if(!nfsList || !nfsList.length){
          setFieldsValue({
            storageClassName,
          })
        }
      } else {
        tempList = gfsList
        if(!gfsList || !gfsList.length){
          setFieldsValue({
            storageClassName,
          })
        }
      }
      tempList.map(item => {
        if(item.metadata.labels["system/storageDefault"] === "true"){
          storageClassName = item.metadata.name
        }
      })
      setFieldsValue({
        storageClassName,
      })
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
  refresh(query, searchInput) {
    this.setState({
      filteredValue: []
    }, () => {
      this.loadData({ page: parseInt(query.page) || 1, search: searchInput })
    })
  }

  // 选择server 共享目录
  serverTypeChange = e => {
    this.setState({
      serverType: e.target.value
    })
  }

  testServerPath = (rule, value, callback) => {
    const { formatMessage } = this.props.intl
    if (!value) {
        return callback(formatMessage(StorageIntl.pleaseServiceDir))
      }
    if (!PATH_REG.test(value)) {
      return callback(formatMessage(StorageIntl.pleaseSendPath))
    }
    callback()
  }
  defaultValue = () => {
    const { nfsList, gfsList } = this.props
    const { modalStorageType } = this.state
    const storageList = modalStorageType === 'nfs'? nfsList : gfsList
    if (storageList && storageList.length > 0) {
      const defaultStorage = storageList.filter(v => v.metadata.labels["system/storageDefault"] === "true")[0]
      return defaultStorage ? defaultStorage.metadata.name : storageList[0].metadata.name
    }
    return undefined
  }

  render() {
    const {
      form, nfsList, storageList, storageListIsFetching, clusterID,
      storageClassType, location, gfsList, intl
    } = this.props
    const {
      selectedRowKeys,
      createShareMemoryVisible,
      confirmLoading,
      deleteModalVisible,
      searchInput,
      modalStorageType,
    } = this.state
    const { formatMessage } = intl
    const { query = {} } = location
    const { getFieldProps } = form
    const columns = [
      {
        key: 'name',
        title: <FormattedMessage {...StorageIntl.storageName} />,
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
        title: <FormattedMessage {...StorageIntl.status} />,
        dataIndex: 'status',
        width: '10%',
        render: (status, record) => <div>{ this.formatStatus(status, record)}</div>
      },
      {
        key: 'format',
        title: <FormattedMessage {...StorageIntl.type} />,
        dataIndex: 'diskType',
        filteredValue: this.state.filteredValue,
        filters:[
          { text: 'GlusterFS', value: 'glusterfs' },
          { text: 'NFS', value: 'nfs' }
        ],
        width: '15%',
        render: text => { return text === 'nfs' ? 'NFS' : 'GlusterFS' },
      },
      {
        key: 'storageServer',
        title: <span><FormattedMessage {...StorageIntl.storage} /><FormattedMessage {...StorageIntl.service} /></span>,
        dataIndex: 'storageServer',
        width: '20%',
      },
      {
        key: 'deployServiceList',
        title: <FormattedMessage {...StorageIntl.commonService} />,
        dataIndex: 'deployServiceList',
        width: '20%',
        render: deployServiceList => deployServiceList && deployServiceList.length || '-'
      },
      {
        key: 'createTime',
        title: <FormattedMessage {...StorageIntl.createTime} />,
        dataIndex: 'createTime',
        width: '20%',
        sorter: (a, b) => new Date(formatDate(a.createTime)) - new Date(formatDate(b.createTime)),
        render: text => <TimeHover time={text} />
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
      title = <FormattedMessage {...StorageIntl.commonStorageConfig} />
    }
    const mergedQuery = mergeQueryFunc(DEFAULT_QUERY, { page: query.page || 1, search: query.search })
    const paginationProps = {
      simple: true,
      current: parseInt(query.page) || 1,
      onChange: (page) => {
        adjustBrowserUrl(location, Object.assign({}, mergedQuery, {page}));
      },
    }

    return(
      <QueueAnim className='share_memory'>
        <div id='share_memory' key="share_memory">
        <Title title="共享型存储"/>
        <ResourceBanner resourceType="volume" />
          <div className='alertRow'>
            <FormattedMessage {...StorageIntl.commonStorageAlert} />
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
                  <FormattedMessage {...StorageIntl.create} /><FormattedMessage {...StorageIntl.commonStorage} />
                </Button>
              </Tooltip>
              <Button
                size="large"
                className='button_refresh'
                onClick={this.refresh.bind(this, query, searchInput)}
              >
                <i className="fa fa-refresh button_icon" aria-hidden="true"
                  onClick={this.refresh.bind(this, query, searchInput)}
                />
                <FormattedMessage {...StorageIntl.refresh} />
              </Button>
              <Button
                size="large"
                icon="delete"
                className='button_refresh'
                onClick={() => this.deleteItem()}
                disabled={!selectedRowKeys.length}
              >
                <FormattedMessage {...StorageIntl.delete} />
              </Button>
              <div className='search_box'>
                <Input
                  size="large"
                  placeholder={formatMessage(StorageIntl.searchName)}
                  value={searchInput}
                  onChange={e => this.setState({ searchInput: e.target.value })}
                  onPressEnter={() => this.searchStorage({ page: 1 })}
                />
                <i className="fa fa-search search_icon" onClick={this.searchStorage}></i>
              </div>
              {
                storageList.length
                ? <div className='totle_num'><FormattedMessage{...StorageIntl.totalItems} />  {storageList.length}  <FormattedMessage{...StorageIntl.item} /></div>
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
            title={<FormattedMessage{...StorageIntl.deleteAct} />}
            visible={deleteModalVisible}
            closable={true}
            onOk={() => this.confirmDeleteItem()}
            onCancel={() => this.setState({deleteModalVisible:false})}
            width="570px"
            maskClosable={false}
            confirmLoading={confirmLoading}
            wrapClassName="delete_share_memory_modal"
          >
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
              <FormattedMessage{...StorageIntl.sureDelete} />
              <span style={{ padding: '0 3px' }}> {selectedRowKeys.length} </span>
              <FormattedMessage{...StorageIntl.aStorage} />？
            </div>
          </Modal>
          {
            createShareMemoryVisible && <Modal
              className="createShareMemoryModal"
              title={<span><FormattedMessage{...StorageIntl.create} /><FormattedMessage{...StorageIntl.commonStorageDir} /></span>}
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
                  label={<FormattedMessage{...StorageIntl.type} />}
                  {...formItemLayout}
                >
                  <Select
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
                      placeholder={<FormattedMessage{...StorageIntl.pleaseService} />}
                      {...getFieldProps('storageClassName', {
                        initialValue: this.defaultValue(),
                        rules:[{
                          required:true,
                          message: formatMessage(StorageIntl.pleaseService),
                        }],
                      })}
                    >
                    {
                      modalStorageType === 'nfs' ?
                      nfsList.map(nfs =>{
                        return <Option key={nfs.metadata.name}>
                          {nfs.metadata.annotations['system/scName'] || nfs.metadata.name}
                        </Option>

                        }
                      )
                      :
                      gfsList.map(gfs =>
                        <Option key={gfs.metadata.name}>
                          {(!!gfs.metadata.annotations && gfs.metadata.annotations['system/scName']) || gfs.metadata.name}
                        </Option>
                      )
                    }
                    </Select>
                  </FormItem>
                </FormItem>
                <FormItem
                  label={<FormattedMessage{...StorageIntl.storageName} />}
                  {...formItemLayout}
                >
                  <Input
                    placeholder={formatMessage(StorageIntl.pleaseStorageName)}
                    {...getFieldProps('name', {
                      rules:[{
                        validator: this.checkVolumeNameExist
                      }],
                    })}
                  />
                </FormItem>
                {
                  this.state.modalStorageType === 'nfs' ?
                    <FormItem
                      label={<span><FormattedMessage {...StorageIntl.service} /><FormattedMessage {...StorageIntl.commonDir} /></span>}
                      {...formItemLayout}
                    >
                      <RadioGroup value={this.state.serverType} onChange={this.serverTypeChange}>
                        <Radio value='random' key='random'>{<FormattedMessage {...StorageIntl.systemRandom} />}</Radio>
                        <Radio value='custom' key='custom'>{<FormattedMessage {...StorageIntl.NFSServerPath} />}</Radio>
                      </RadioGroup>
                      {
                        this.state.serverType === 'custom' &&
                          <Input
                            {...getFieldProps('serverDir',{
                              validate: [
                                {
                                  rules: [
                                    {validator: this.testServerPath},
                                  ],
                                  trigger: ['onBlur', 'onChange'],
                                }
                              ]
                            })}
                            placeholder={formatMessage(StorageIntl.pleaseNFSServerPath)}/>
                      }
                    </FormItem>
                  :
                  <FormItem
                    label={<span><FormattedMessage{...StorageIntl.storage} /><FormattedMessage{...StorageIntl.size} /></span>}
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
                        placeholder={formatMessage(StorageIntl.pleaseStorageSize)} min={1} max={20}
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
          }
        </div>
      </QueueAnim>
    )
  }
}

ShareMemory = Form.create()(injectIntl(ShareMemory, {withRef: true}))

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
