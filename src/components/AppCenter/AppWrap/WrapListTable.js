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
import {formatDate} from '../../../common/tools'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../../constants'
import { API_URL_PREFIX } from '../../../constants'
import cloneDeep from 'lodash/cloneDeep'
import ReleaseAppModal from './ReleaseAppModal'
import WrapDetailModal from './WrapDetailModal'
import WrapDocsModal from './WrapDocsModal'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../containers/Application/intl'
import TimeHover from '@tenx-ui/time-hover/lib'
import UploadForm from './UploadForm'

import { wrapManageList, deleteWrapManage, auditWrap, getWrapStoreList, publishWrap } from '../../../actions/app_center'
const RadioGroup = Radio.Group
const TabPane = Tabs.TabPane
const notificat = new NotificationHandler()
import TenxStatus from '../../TenxStatus/index'

// file type
const wrapType = ['.jar', '.war', '.tar', '.tar.gz', '.zip']
const wrapTypelist = ['jar', 'war', 'tar', 'tar.gz', 'zip']


class WrapListTable extends Component {
  constructor(props) {
    super()
    this.rowClick = this.rowClick.bind(this)
    this.closeRleaseModal = this.closeRleaseModal.bind(this)
    this.closeDetailModal = this.closeDetailModal.bind(this)
    this.loadData = this.loadData.bind(this)
    this.renderDeployBtn = this.renderDeployBtn.bind(this)
    this.closeDocsModal = this.closeDocsModal.bind(this)
    this.state = {
      page: 1,
      detailModal: false,
      isShowUpdate: false,
      currentRow: {},
    }
  }
  componentWillMount() {
    window.WrapListTable = null
  }
  getList = (e) => {
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
    const { callback } = this.props
    current = current || this.state.page
    this.setState({ page: current }, callback)
    let from = {
      from: (current - 1) * DEFAULT_PAGE_SIZE,
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

  deleteAction(status, row) {
    if (status) {
      this.setState({ delAll: true, currentApp: row })
      return
    }
    this.setState({ delAll: false })
  }
  deleteVersion = () => {
    // const notificat = new NotificationHandler()
    const { currentApp, page } = this.state
    const { wrapList, callbackRowKeys, intl } = this.props
    callbackRowKeys()
    let id = [currentApp.id]
    let body = {
      ids: id,
      filePkgNames: [currentApp.fileName]
    }
    this.props.deleteWrapManage(body, {
      success: {
        func: () => {
          notificat.success(intl.formatMessage(IntlMessage.deleteSuccess))
          let newPage = Math.floor((wrapList.total - id.length) / DEFAULT_PAGE_SIZE)
          if (newPage < page) {
            this.loadData(page - 1)
            return
          }
          this.loadData(page)
        }, isAsync: true
      },
      failed: {
        func: (err) => {
          notificat.error(intl.formatMessage(IntlMessage.deleteFailure), err.message.message || err.message)
        }
      },
      finally: {
        func: () => {
          this.deleteAction(false)
        }
      }
    })
  }
  deleteHint() {
    const { intl } = this.props
    Modal.info({
      title: intl.formatMessage(IntlMessage.wrapDeleteTip)
    })
  }
  publishAction(id) {
    const { publishWrap, intl } = this.props
    const { currentApp } = this.state
    let notify = new NotificationHandler()
    notify.spin(intl.formatMessage(IntlMessage.publishing))
    const body = {
      filePkgName: currentApp.fileName
    }
    publishWrap(id, body, {
      success: {
        func: () => {
          notify.close()
          notify.success(intl.formatMessage(IntlMessage.publishSuccess))
          this.loadData()
        },
        isAsync: true
      },
      failed: {
        func: res => {
          notify.close()
          if (res.statusCode < 500) {
            notify.warn(intl.formatMessage(IntlMessage.publishFailure), res.message.message)
          } else {
            notify.error(intl.formatMessage(IntlMessage.publishFailure), res.message.message)
          }
        }
      },
      finally: {
        func: () => {
          notify.close()
          this.setState({
            publishModal: false,
            currentApp: null
          })
        }
      }
    })
  }
  handleMenuClick(e, row) {
    switch (e.key) {
      case 'delete':
        if (![0, 3, 4].includes(row.publishStatus)) {
          this.deleteHint()
          return
        }
        this.deleteAction(true, row)
        break
      case 'audit':
        this.setState({
          releaseVisible: true,
          currentApp: row
        })
        break
      case 'docs':
        this.setState({
          docsModal: true,
          currentApp: row
        })
        break
      case 'publish':
        this.setState({
          publishModal: true,
          currentApp: row
        })
        break
      case 'download':
        break
      case 'vm':
        browserHistory.push(`/app_manage/vm_wrap/create?fileName=${row.fileName}`)
        break
      case 'uploadPkg':
        this.setState({
          currentRow: row,
          isShowUpdate: true,
        })
        break
      default:
        break
    }
  }
  cancelPublishModal() {
    this.setState({
      publishModal: false,
      currentApp: null
    })
  }
  confirmPublishModal() {
    const { currentApp } = this.state
    this.publishAction(currentApp.id)
  }
  closeRleaseModal() {
    this.setState({
      releaseVisible: false,
      currentApp: null
    })
  }
  closeDocsModal() {
    this.setState({
      docsModal: false,
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
          <FormattedMessage {...IntlMessage.select}/>
        </Button>
      )
    }
    const { vmWrapConfig } = this.props
    const { enabled } = vmWrapConfig
    const menu = (
      <Menu onClick={e => this.handleMenuClick(e, row)} style={{ width: 110 }}>
        {enabled ? <Menu.Item key="vm">
          <FormattedMessage {...IntlMessage.traditionalDeploy}/>
        </Menu.Item> : <Menu.Item key="node" style={{ display: 'none' }} />}
        <Menu.Item key="audit" disabled={[1, 2, 8].includes(row.publishStatus)}>
          <FormattedMessage {...IntlMessage.submitReview}/>
        </Menu.Item>
        <Menu.Item key="docs">
          <FormattedMessage {...IntlMessage.uploadAttachment}/>
        </Menu.Item>
        <Menu.Item key="uploadPkg">
          <FormattedMessage {...IntlMessage.updatePkg}/>
        </Menu.Item>
        <Menu.Item key="publish" disabled={![2].includes(row.publishStatus)}>
          <FormattedMessage {...IntlMessage.publish}/>
        </Menu.Item>
        <Menu.Item key="download">
          <a target="_blank" href={`${API_URL_PREFIX}/pkg/${row.id}`}>
            <FormattedMessage {...IntlMessage.download}/>
          </a>
        </Menu.Item>
        <Menu.Item key="delete">
          <FormattedMessage {...IntlMessage.delete}/>
        </Menu.Item>
      </Menu>
    )
    return (
      <Dropdown.Button onClick={() => this.handleButtonClick(row, func)} overlay={menu} type="ghost" className="dropDownBox">
        <span><Icon type="appstore-o" /> <FormattedMessage {...IntlMessage.containerDeploy}/></span>
      </Dropdown.Button>
    )
  }

  rowClick(record, index) {
    const { func, selectedRowKeys, rowCheckbox, callbackRow, callbackRows } = this.props
    const { id } = func.scope.state
    const newId = cloneDeep(id)
    const newSelectedRowKeys = cloneDeep(selectedRowKeys)
    let idIsExist = false
    let keysIsExist = false
    for (let i = 0; i < newId.length; i++) {
      if (newId[i] == record.id) {
        newId.splice(i, 1)
        idIsExist = true
        break
      }
    }
    for (let i = 0; i < newSelectedRowKeys.length; i++) {
      if (newSelectedRowKeys[i] == index) {
        newSelectedRowKeys.splice(i, 1)
        keysIsExist = true
        break
      }
    }
    if (!keysIsExist) {
      newSelectedRowKeys.push(index)
    }
    if (!idIsExist) {
      newId.push(record.id)
    }
    if (!rowCheckbox) {
      callbackRow && callbackRow([index], [record.id], record.fileType == 'jar' ? 0 : 1, record.fileType)
      window.WrapListTable = record
      return
    }
    callbackRows(newSelectedRowKeys, newId, record.fileType)
    func.scope.setState({
      selectedRowKeys: newSelectedRowKeys,
      id: newId,
      fileType: record.fileType,
    })
  }

  getAppStatus(status, record) {
    let phase
    let progress = { status: false }
    switch (status) {
      case 0:
        phase = 'Unpublished'
        break
      case 1:
        phase = 'Published'
        break
      case 2:
        phase = 'CheckWrapPass'
        break
      case 3:
        phase = 'CheckReject'
        break
      case 4:
        phase = 'OffShelf'
        break
      case 8:
        phase = 'Checking'
        progress = { status: true }
        break
      default:
        break
    }
    return <TenxStatus phase={phase} progress={progress} showDesc={status === 3} description={status === 3 && record.approveMessage} />
  }

  openDetailModal(e, row) {
    e.stopPropagation()
    this.setState({
      currentWrap: row,
      detailModal: true
    })
  }

  closeDetailModal() {
    this.setState({
      detailModal: false
    })
  }

  render() {
    // jar war ,tar.gz zip
    const { func, rowCheckbox, wrapList, wrapStoreList, currentType, isWrapManage, isRefresh,
      callbackRow, callbackRowSelection, intl } = this.props
    const { releaseVisible, currentApp, detailModal, currentWrap, publishModal, docsModal, currentRow } = this.state
    const dataSource = currentType === 'trad' ? wrapList : wrapStoreList
    const originalFile = {
      title: <FormattedMessage {...IntlMessage.originalFile}/>,
      dataIndex: 'originalFile',
      key: 'originalFile',
      width: '10%',
      render: text => text ? text : '-'
    }
    const classifyName = {
      title: <FormattedMessage {...IntlMessage.classifyName}/>,
      dataIndex: 'classifyName',
      key: 'classifyName',
      width: '10%',
      render: text => text ? text : '-'
    }
    const fileNickName = {
      title: <FormattedMessage {...IntlMessage.publishName}/>,
      dataIndex: 'fileNickName',
      key: 'fileNickName',
      width: currentType === 'store' ? '20%' : '10%',
      render: text => text ? text : '-'
    }
    const publishStatus = {
      title: <FormattedMessage {...IntlMessage.status}/>,
      dataIndex: 'publishStatus',
      key: 'publishStatus',
      width: '10%',
      render: (text, record) => this.getAppStatus(text, record)
    }
    const columns = [
      {
        title: <FormattedMessage {...IntlMessage.wrapName}/>,
        dataIndex: 'fileName',
        key: 'name',
        width: isWrapManage ? '10%' : '20%',
        render: (text, row) => <span className="pointer themeColor" onClick={(e) => this.openDetailModal(e, row)}>{text}</span>
      }, {
        title: <FormattedMessage {...IntlMessage.tag}/>,
        dataIndex: 'fileTag',
        key: 'tag',
        width: isWrapManage ? '10%' : '20%',
      }, {
        title: <FormattedMessage {...IntlMessage.description}/>,
        dataIndex: 'description',
        key: 'description',
        width: isWrapManage ? '10%' : '20%',
      }, {
        title: <FormattedMessage {...IntlMessage.wrapType}/>,
        dataIndex: 'fileType',
        key: 'fileType',
        width: isWrapManage ? '10%' : '20%',
      }, {
        title: <FormattedMessage {...IntlMessage.uploadTime}/>,
        dataIndex: 'creationTime',
        key: 'creationTime',
        width: '10%',
        render: text => <TimeHover time={text} />
      }, {
        title: <FormattedMessage {...IntlMessage.operation}/>,
        dataIndex: 'actions',
        key: 'actions',
        width: '15%',
        render: (e, row) => {
          if (rowCheckbox) {
            return this.renderDeployBtn(row, func, rowCheckbox)
          }
          return this.renderDeployBtn(row, func)
        }

      }
    ]
    if (isWrapManage) {
      columns.splice(3, 0, originalFile, classifyName, fileNickName, publishStatus)
    }
    if (currentType === 'store') {
      columns.splice(1, 0, fileNickName)
    }
    const paginationOpts = {
      simple: true,
      pageSize: DEFAULT_PAGE_SIZE,
      current: isRefresh ? 1 : this.state.page,
      total: dataSource && dataSource.total,
      onChange: current => currentType === 'trad' ? this.loadData(current) : this.getStoreList(null, current),
    }
    let rowSelection = {
      selectedRowKeys: this.props.selectedRowKeys, // 控制checkbox是否选中
      onChange(selectedRowKeys, selectedRows) {
        const ids = selectedRows.map(row => {
          return row.id
        })
        if (!rowCheckbox) {
          callbackRow && callbackRow(selectedRowKeys, ids, selectedRows[0].fileType == 'jar' ? 0 : 1, selectedRows[0].fileType)
          window.WrapListTable = selectedRows[0]
          return
        }
        func && callbackRowSelection(ids, selectedRowKeys)
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
        {
          docsModal &&
          <WrapDocsModal
            visible={docsModal}
            closeModal={this.closeDocsModal}
            currentWrap={currentApp}
          />
        }
        <Table className="strategyTable" loading={this.props.isFetching} rowSelection={rowSelection} dataSource={dataSource && dataSource.pkgs} columns={columns} pagination={paginationOpts} onRowClick={this.rowClick} />
        {dataSource && dataSource.total && dataSource.total > 0 ?
          <span className="pageCount" style={{ position: 'absolute', right: '160px', top: '-55px' }}>
            <FormattedMessage {...IntlMessage.total} values={{ total: dataSource.total }}/></span>
          : null
        }
        <Modal title={intl.formatMessage(IntlMessage.delete)} visible={this.state.delAll}
          onCancel={() => this.deleteAction(false)}
          onOk={this.deleteVersion}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle"/>
            <FormattedMessage {...IntlMessage.deleteTagTip}/>
          </div>
        </Modal>
        <Modal
          title={<FormattedMessage {...IntlMessage.publish}/>}
          visible={publishModal}
          onCancel={() => this.cancelPublishModal()}
          onOk={() => this.confirmPublishModal()}
        >
          <div className="confirmText">
            <Icon type="question-circle-o" /> <FormattedMessage {...IntlMessage.publishTip}/>
          </div>
        </Modal>
        {
          this.state.isShowUpdate ?
            <UploadForm
              visible={this.state.isShowUpdate}
              func={this.props.funcCallback}
              onCancel={() => {
                this.setState({ isShowUpdate: false })
              }}
              isEdit={true}
              currentRow={currentRow}
            />
            :
            null
        }
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { currentType, func } = props
  const { wrapList, wrapStoreList } = state.images
  const { current, loginUser } = state.entities
  const { space } = current
  const { info } = loginUser
  const { vmWrapConfig } = info
  const list = wrapList || {}
  const { result: storeList, isFetching: storeFetching } = wrapStoreList || { result: {} }
  const { data: storeData } = storeList || { data: [] }
  const { location } = func
  const { pathname } = location
  // 判断是否是应用包管理页面，table columns展示不同
  let isWrapManage = false
  if (pathname.indexOf('/app_center/wrap_manage') > -1) {
    isWrapManage = true
  }
  let datalist = { pkgs: [], total: 0 }
  if (list.result) {
    datalist = list.result.data
  }
  return {
    space,
    wrapList: datalist,
    isFetching: currentType === 'trad' ? list.isFetching : storeFetching,
    wrapStoreList: storeData,
    isWrapManage,
    vmWrapConfig,
  }
}

export default connect(mapStateToProps, {
  wrapManageList,
  deleteWrapManage,
  auditWrap,
  getWrapStoreList,
  publishWrap
})(injectIntl(WrapListTable, {
  withRef: true
}))
