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
import { Alert, Modal, Table, Icon, Form, Radio, Button, Tabs, Card, Input, Upload, Select, Tooltip } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import Title from '../Title'
import './style/AppWrapManage.less'
import NotificationHandler from '../../components/Notification'
// import { formatDate } from '../../common/tools'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
// import { API_URL_PREFIX, UPGRADE_EDITION_REQUIRED_CODE } from '../../constants'
import { isResourcePermissionError, toQuerystring } from '../../common/tools'
import WrapListTable from './AppWrap/WrapListTable'
import { throwError } from '../../actions'
import { wrapManageList, deleteWrapManage, uploadWrap, checkWrapName } from '../../actions/app_center'
import ResourceBanner from '../../components/TenantManage/ResourceBanner/index'
import UploadForm from './AppWrap/UploadForm'

const notificat = new NotificationHandler()
// file type
const wrapType = ['.jar', '.war', '.tar', '.tar.gz', '.zip']
const wrapTypelist = ['jar', 'war']

class WrapManage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedRowKeys: [],
      page: 1,
      id: [],
      isRefresh: false,
      uploadModal: this.props.location.query['is_show'] === "1" ? true : false,
    }
  }
  getList = (e) => {
    const value = this.refs.wrapSearch.refs.input.value
    const inputValue = value.trim()
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
    this.setState({ page: current })
    let from = {
      from: (current - 1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE
    }
    this.props.wrapManageList(from)
  }
  componentWillMount() {
    this.loadData()
  }
  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.space.namespace !== this.props.space.namespace) {
  //     this.loadData()
  //   }
  // }

  callbackRowSelection = (id, RowKeys) => {
    this.setState({
      id,
      selectedRowKeys: RowKeys,
    })
  }

  callbackRefresh = () => {
    this.setState({
      isRefresh: false
    })
  }
  callbackRowKeys = () => {
    this.setState({
      selectedRowKeys: []
    })
  }
  callbackRow = (RowKeys, id, Template, fileType) => {
    this.setState({
      selectedRowKeys: RowKeys,
      id,
      defaultTemplate: Template,
      version: null,
      fileType,
    })
  }
  callbackRows = (RowKeys, id, fileType) => {
    this.setState({
      selectedRowKeys: RowKeys,
      id,
      fileType,
    })
  }

  uploadModal = (modal) => {
    this.setState({ uploadModal: modal })
    if (!!modal) {
      setTimeout(() => {
        document.getElementById('wrapName').focus()
      }, 200)

    }
  }
  deleteAction(status, id) {
    if (status) {
      id = [id]
      this.setState({ delAll: true, id })
      return
    }
    this.setState({ delAll: false })
  }
  deleteVersion = () => {
    // const notificat = new NotificationHandler()
    const { id, page } = this.state
    const { wrapList } = this.props
    const filePkgNames = []
    wrapList.pkgs.forEach(item => {
      if (id.includes(item.id)) {
        filePkgNames.push(item.fileName)
      }
    })
    this.setState({ selectedRowKeys: [] })
    this.props.deleteWrapManage({ ids: id, filePkgNames }, {
      success: {
        func: () => {
          notificat.success('删除成功')
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
          notificat.error('删除失败', err.message.message || err.message)
        }
      },
      finally: {
        func: () => {
          this.deleteAction(false)
        }
      }
    })
  }
  goDeploy(fileName) {
    // /app_manage/app_create/quick_create#configure-service
    browserHistory.push('/app_manage/deploy_wrap?fileName=' + fileName)
  }
  deleteHint() {
    Modal.info({
      title: '只有未发布、已拒绝、已下架的应用包可被删除'
    })
  }
  showDeleteModal() {
    const { wrapList } = this.props
    const { id } = this.state
    const hasPublishWrap = wrapList.pkgs.some(item => id.includes(item.id) && (![0, 3, 4].includes(item.publishStatus)))
    if (hasPublishWrap) {
      return this.deleteHint()
    }
    this.setState({ delAll: true })
  }
  handleRefresh() {
    this.setState({ isRefresh: true })
    this.getList(true)
  }
  render() {
    const { location } = this.props
    const funcCallback = {
      uploadModal: this.uploadModal,
      getList: this.getList,
    }
    const func = {
      // id: this.state.id,
      scope: this,
      goDeploy: this.goDeploy,
      location
    }
    return (
      <QueueAnim>
        <Title title="应用包管理" />
        <div key="wrap_list" id="app_wrap_manage">
          <ResourceBanner resourceType='applicationPackage'/>
          <div className="btnRow">
            <Button size="large" type="primary" icon="upload" onClick={() => this.uploadModal(true)}>上传包文件</Button>
            <Button className="refreshBtn" size="large" style={{ margin: '0 10px' }} onClick={() => this.handleRefresh()}><i className='fa fa-refresh' />&nbsp;刷 新</Button>
            <Button className="refreshBtn" size="large" onClick={() => this.showDeleteModal()} icon="delete" style={{ marginRight: '10px' }} disabled={this.state.selectedRowKeys.length == 0}>删 除</Button>
            <Input size="large" onPressEnter={() => this.getList(true)} style={{ width: 180 }} placeholder="请输入包名称搜索" ref="wrapSearch" />
            <i className="fa fa-search btn-search" onClick={() => this.getList(true)} />
          </div>
          <Card className="wrap_content">
            <WrapListTable currentType="trad" isRefresh={this.state.isRefresh} callback={this.callbackRefresh}
              callbackRowKeys={this.callbackRowKeys} callbackRowSelection={this.callbackRowSelection} func={func}
              funcCallback={funcCallback}
              callbackRow={this.callbackRow} callbackRows={this.callbackRows} rowCheckbox={true} selectedRowKeys={this.state.selectedRowKeys} />
          </Card>
        </div>

        <UploadForm
          func={funcCallback}
          visible={this.state.uploadModal}
          onCancel={() => {
            this.setState({ uploadModal: false })
          }}
        />
        <Modal title="删除操作" visible={this.state.delAll}
          onCancel={() => this.deleteAction(false)}
          onOk={this.deleteVersion}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            确定要删除所选版本？
          </div>
        </Modal>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { loginUser, current } = state.entities
  const { wrapList } = state.images
  const list = wrapList || {}
  let datalist = { pkgs: [], total: 0 }
  if (list.result) {
    datalist = list.result.data
  }
  return {
    wrapList: datalist,
    loginUser: loginUser.info,
    space: current.space
  }
}

export default connect(mapStateToProps, {
  wrapManageList,
  deleteWrapManage,
  uploadWrap,
  checkWrapName,
  throwError,
})(WrapManage)
