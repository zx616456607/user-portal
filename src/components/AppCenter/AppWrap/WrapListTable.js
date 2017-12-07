/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Wrap Manage list component
 *
 * v0.1 - 2017-6-30
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Modal, Table, Icon, Radio, Button, Tabs, Tooltip, Menu, Popover, Dropdown } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import '../style/AppWrapManage.less'
import NotificationHandler from '../../../components/Notification'
import { formatDate } from '../../../common/tools'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../../constants'
import { API_URL_PREFIX } from '../../../constants'
import cloneDeep from 'lodash/cloneDeep'
import ReleaseAppModal from './ReleaseAppModal'
import WrapDetailModal from './WrapDetailModal'

import { wrapManageList, deleteWrapManage, auditWrap, getWrapStoreList, publishWrap } from '../../../actions/app_center'
const RadioGroup = Radio.Group
const TabPane = Tabs.TabPane
const notificat = new NotificationHandler()
import TenxStatus from '../../TenxStatus/index'

// file type
const wrapType = ['.jar','.war','.tar','.tar.gz','.zip']
const wrapTypelist = ['jar','war','tar','tar.gz','zip']


class WrapListTable extends Component {
  constructor(props) {
    super()
    this.rowClick = this.rowClick.bind(this)
    this.closeRleaseModal = this.closeRleaseModal.bind(this)
    this.closeDetailModal = this.closeDetailModal.bind(this)
    this.loadData = this.loadData.bind(this)
    this.state = {
      page: 1,
    }
  }
  componentWillMount() {
    window.WrapListTable = null
  }
  getList = (e)=> {
    const inputValue = this.refs.wrapSearch.refs.input.value
    if (!e || inputValue == '') {
      this.loadData()
      return
    }
    const query = {
      filter: `fileName contains ${inputValue}`,
    }
    this.props.wrapManageList(query)
  }
  loadData(current) {
    current = current || this.state.page
    this.setState({page: current})
    let from = {
      from: (current-1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE
    }
    this.props.wrapManageList(from)
  }
  getStoreList(value, current) {
    const { getWrapStoreList } = this.props
    current = current || this.state.page
    const query = {
      from: (current - 1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE
    }
    if (value) {
      Object.assign(query, { file_name: value })
    }
    getWrapStoreList(query)
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.space.namespace !== this.props.space.namespace) {
      this.loadData()
    }
  }

  deleteAction(status,id) {
    if (status) {
      id = [id]
      this.setState({delAll: true,id})
      return
    }
    this.setState({delAll: false})
  }
  deleteVersion = ()=> {
    // const notificat = new NotificationHandler()
    const { id,page } = this.state
    const { wrapList,func } = this.props
    func.scope.setState({selectedRowKeys:[]}) // set parent state
    this.props.deleteWrapManage({ids: id},{
      success: {
        func:()=> {
          notificat.success('删除成功')
          let newPage = Math.floor((wrapList.total - id.length) / DEFAULT_PAGE_SIZE)
          if (newPage < page) {
            this.loadData(page -1)
            return
          }
          this.loadData(page)
        },isAsync: true
      },
      failed: {
        func: (err)=> {
          notificat.error('删除失败',err.message.message || err.message)
        }
      },
      finally: {
        func:()=> {
          this.deleteAction(false)
        }
      }
    })
  }
  deleteHint() {
    Modal.info({
      title: '只有未发布和已下架的应用包可以被删除'
    })
  }
  publishAction(id) {
    const { publishWrap } = this.props
    let notify = new NotificationHandler()
    notify.spin('发布中')
    publishWrap(id, {
      success: {
        func: () => {
          notify.close()
          notify.success('发布成功')
          this.loadData()
        },
        isAsync: true
      },
      failed: {
        func: res => {
          notify.close()
          if (res.statusCode < 500) {
            notify.warn('发布失败', res.message || res.message.message)
          } else {
            notify.error('发布失败', res.message || res.message.message)
          }
        }
      },
      finally: {
        func: () => {
          notify.close()
        }
      }
    })
  }
  handleMenuClick(e, row) {
    switch (e.key) {
      case 'delete':
        if (![0, 4].includes(row.publishStatus)) {
          this.deleteHint()
          return
        }
        this.deleteAction(true,row.id)
        break
      case 'audit':
        this.setState({
          releaseVisible: true,
          currentApp: row
        })
        break
      case 'publish':
        this.publishAction(row.id)
        break
      case 'download':
        break
      case 'vm':
        browserHistory.push(`/app_manage/vm_wrap/create?fileName=${row.fileName}`)
        break
    }
  }
  closeRleaseModal() {
    this.setState({
      releaseVisible: false,
      currentApp: null
    })
  }
  handleButtonClick(row, func) {
    const { goDeploy } = func
    goDeploy(row.fileName)
  }
  renderDeployBtn(row, func, rowCheckbox) {
    if (!rowCheckbox) {
      return (
        <Button
          type="primary"
          key="1"
        >
          选择
        </Button>
      )
    }
    const menu = (
      <Menu onClick={e => this.handleMenuClick(e, row)} style={{ width: 110 }}>
        <Menu.Item key="vm">
          传统部署
        </Menu.Item>
        <Menu.Item key="audit" disabled={[1, 2, 8].includes(row.publishStatus)}>
          提交审核
        </Menu.Item>
        <Menu.Item key="publish" disabled={![2].includes(row.publishStatus)}>
          发布
        </Menu.Item>
        <Menu.Item key="download">
          <a target="_blank" href={`${API_URL_PREFIX}/pkg/${row.id}`}>下载</a>
        </Menu.Item>
        <Menu.Item key="delete">
          删除
        </Menu.Item>
      </Menu>
    )
    return (
      <Dropdown.Button onClick={() => this.handleButtonClick(row, func)} overlay={menu} type="ghost" className="dropDownBox">
        <span><Icon type="appstore-o" /> 容器部署</span>
      </Dropdown.Button>
    )
  }

  rowClick(record, index){
    const { func, selectedRowKeys, rowCheckbox } = this.props
    const { id } = func.scope.state
    const newId = cloneDeep(id)
    const newSelectedRowKeys = cloneDeep(selectedRowKeys)
    let idIsExist = false
    let keysIsExist = false
    for(let i = 0; i < newId.length; i++){
    	if(newId[i] == record.id){
        newId.splice(i, 1)
        idIsExist = true
        break
      }
    }
    for(let i = 0; i < newSelectedRowKeys.length; i++){
    	if(newSelectedRowKeys[i] == index){
        newSelectedRowKeys.splice(i, 1)
        keysIsExist = true
        break
      }
    }
    if(!keysIsExist){
      newSelectedRowKeys.push(index)
    }
    if(!idIsExist){
      newId.push(record.id)
    }
    if (!rowCheckbox) {
      func.scope.setState({
        selectedRowKeys: [index],
        id: [record.id],
        defaultTemplate: record.fileType =='jar' ? 0 : 1,
        version: null,
      })
      window.WrapListTable = record
      return
    }
    func.scope.setState({
      selectedRowKeys: newSelectedRowKeys,
      id: newId,
    })
  }

  getAppStatus(status, record){
    let phase
    let progress = {status: false};
    switch(status) {
      case 0:
        phase = 'Unpublished'
        break
      case 1:
        phase = 'Published'
        break
      case 2:
        phase = 'CheckPass'
        break
      case 3:
        phase = 'CheckReject'
        break
      case 4:
        phase = 'OffShelf'
        break
      case 8:
        phase = 'Checking'
        progress = {status: true}
        break
    }
    return <TenxStatus phase={phase} progress={progress} showDesc={status === 3} description={status === 3 && record.approveMessage}/>
  }
  
  openDetailModal(row) {
    this.setState({
      detailModal: true,
      currentWrap: row
    })
  }
  
  closeDetailModal() {
    this.setState({
      detailModal: false
    })  
  }
  
  render() {
    // jar war ,tar.gz zip
    const { func, rowCheckbox, auditWrap, wrapManageList, wrapList, wrapStoreList, currentType } = this.props
    const { releaseVisible, currentApp, detailModal, currentWrap } = this.state
    const dataSource = currentType === 'trad' ? wrapList : wrapStoreList
    const columns = [
      {
        title: '包名称',
        dataIndex: 'fileName',
        key: 'name',
        width: '10%',
        render: (text, row) => <span className="pointer themeColor" onClick={() => this.openDetailModal(row)}>{text}</span>
      }, {
        title: '版本标签',
        dataIndex: 'fileTag',
        key: 'tag',
        width: '10%',
      }, {
        title: '分类名称',
        dataIndex: 'classifyName',
        key: 'classifyName',
        width: '10%',
        render: text => text ? text : '-'
      }, {
        title: '发布名称',
        dataIndex: 'fileNickName',
        key: 'fileNickName',
        width: '10%',
        render: text => text ? text : '-'
      }, {
        title: '应用商店',
        dataIndex: 'publishStatus',
        key: 'publishStatus',
        width: '10%',
        render: (text, record) => this.getAppStatus(text, record)
      }, {
        title: '包类型',
        dataIndex: 'fileType',
        key: 'fileType',
        width:'10%',
      }, {
        title: '上传时间',
        dataIndex: 'creationTime',
        key: 'creationTime',
        width:'20%',
        render: text => formatDate(text)
      }, {
        title: '操作',
        dataIndex: 'actions',
        key: 'actions',
        width:'20%',
        render: (e, row) => {
          if (rowCheckbox) {
            return this.renderDeployBtn(row, func, rowCheckbox)
          }
          return this.renderDeployBtn(row, func)
        }

      }
    ]
    const paginationOpts = {
      simple: true,
      pageSize: DEFAULT_PAGE_SIZE,
      current: this.state.page,
      total: dataSource && dataSource.total,
      onChange: current =>  currentType === 'trad' ? this.loadData(current) : this.getStoreList(null, current),
    }
    const _this = this
    let rowSelection = {
      selectedRowKeys: this.props.selectedRowKeys, // 控制checkbox是否选中
      onChange(selectedRowKeys, selectedRows) {
        const ids = selectedRows.map(row => {
          return row.id
        })
        _this.setState({id:ids })
        if (!rowCheckbox) {
          func.scope.setState({
            selectedRowKeys,
            id: ids,
            defaultTemplate: selectedRows[0].fileType =='jar' ? 0 : 1,
            version: null,
          })
          window.WrapListTable = selectedRows[0]
          return
        }
        func && func.scope.setState({selectedRowKeys,id:ids})
      }
    }
    if (!rowCheckbox) {
      // rowSelection = null
      rowSelection.type = 'radio'
    }

    return (
      <div className="wrapListTable" id="wrapListTable">
        <WrapDetailModal
          visible={detailModal}
          currentWrap={currentWrap}
          callback={this.loadData}
          deploy={func.goDeploy}
          closeDetailModal={this.closeDetailModal}
        />
        <ReleaseAppModal
          currentApp={currentApp}
          visible={releaseVisible}
          closeRleaseModal={this.closeRleaseModal}
          callback={this.loadData}
        />
        <Table className="strategyTable" loading={this.props.isFetching} rowSelection={rowSelection} dataSource={dataSource && dataSource.pkgs} columns={columns} pagination={paginationOpts} onRowClick={this.rowClick}/>
        { dataSource && dataSource.total && dataSource.total >0 ?
          <span className="pageCount" style={{position:'absolute',right:'160px',top:'-55px'}}>共计 {dataSource.total} 条</span>
          :null
        }
        <Modal title="删除操作" visible={this.state.delAll}
          onCancel={()=> this.deleteAction(false)}
          onOk={this.deleteVersion}
          >
          <div className="confirmText">确定要删除所选版本？</div>
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state,props) {
  const { currentType } = props
  const { wrapList, wrapStoreList } = state.images
  const { current } = state.entities
  const { space } = current
  const list = wrapList || {}
  const { result: storeList, isFetching: storeFetching } = wrapStoreList || { result: {}}
  const { data: storeData } = storeList || { data: [] }
  let datalist = {pkgs:[],total:0}
  if (list.result) {
    datalist = list.result.data
  }
  return {
    space,
    wrapList: datalist,
    isFetching: currentType === 'trad' ? list.isFetching : storeFetching,
    wrapStoreList: storeData,
  }
}

export default connect(mapStateToProps,{
  wrapManageList,
  deleteWrapManage,
  auditWrap,
  getWrapStoreList,
  publishWrap
})(WrapListTable)