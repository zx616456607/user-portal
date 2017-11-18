/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Image Check
 *
 * v0.1 - 2017-11-18
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Button, Table, Dropdown, Menu, Modal, Form, Input } from 'antd'
import classNames from 'classnames'
import './style/ImageCheck.less'
import CommonSearchInput from '../../CommonSearchInput'
import TenxStatus from '../../TenxStatus/index'
import { getImagesList, imageManage } from '../../../actions/app_store'
import { formatDate } from '../../../common/tools'
import { API_URL_PREFIX } from '../../../constants'
import NotificationHandler from '../../../components/Notification'

const FormItem = Form.Item

class ImageCheckTable extends React.Component {
  constructor(props) {
    super(props)
    this.getImageStatus = this.getImageStatus.bind(this)
  }
  getImageStatus(status){
    let phase
    let progress = {status: false};
    switch(status) {
      case 1:
        phase = 'AppWaitForCheck'
        break
      case 2:
        phase = 'AppPass'
        break
      case 3:
        phase = 'AppReject'
        break
      case 4:
        phase = 'AppOffShelf'
        break
    }
    return <TenxStatus phase={phase} progress={progress}/>
  }
  render() {
    const { imageCheckList, total } = this.props
    const pagination = {
      simple: true,
      defaultCurrent: 1,
      defaultPageSize: 10,
      total,
    }
    const columns = [{
      title: '状态',
      dataIndex: 'publishStatus',
      key: 'publishStatus',
      width: '10%',
      render: this.getImageStatus
    }, {
      title: '提交信息',
      dataIndex: 'requestMessage',
      key: 'requestMessage',
      width: '10%',
    }, {
      title: '分类名称',
      dataIndex: 'classifyName',
      key: 'classifyName',
      width: '10%',
    }, {
      title: '发布名称',
      dataIndex: 'fileNickName',
      key: 'fileNickName',
      width: '10%',
    }, {
      title: '发布镜像',
      dataIndex: 'tag',
      key: 'tag',
      width: '10%',
    }, {
      title: '镜像地址',
      dataIndex: 'originID',
      key: 'originID',
      width: '10%',
    }, {
      title: '发布者',
      dataIndex: 'userName',
      key: 'userName',
      width: '10%',
    }, {
      title: '提交时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: '20%',
      render: text => formatDate(text)
    }, {
      title: '操作',
      key: 'operation',
      width: '20%',
      render: (text, record) => {
        return(
          <div>
            <Button type="primary">通过</Button>
            <Button>拒绝</Button>
          </div>
        )
      }
    }]
    return(
      <div className="imageCheckTableBox">
        <Table
          className="wrapCheckTable"
          dataSource={imageCheckList}
          columns={columns}
          onChange={this.onTableChange}
          pagination={pagination}
        />
      </div>
    )
  }
}
class ImageCheck extends React.Component {
  constructor(props) {
    super(props)
    this.getImagePublishList = this.getImagePublishList.bind(this)
    this.updateParentPage = this.updateParentPage.bind(this)
    this.updateParentFilter = this.updateParentFilter.bind(this)
    this.updateParentSort = this.updateParentSort.bind(this)
    this.updateParentPublishTime = this.updateParentPublishTime.bind(this)
    this.state = {
      current: 1,
      filterName: undefined,
      sort_by: undefined,
      sort_order: undefined,
      publish_time: undefined
    }
  }
  componentWillMount() {
    const { activeKey } = this.props
    if (activeKey === 'image') {
      this.getImagePublishList()
    }
  }
  getImagePublishList() {
    const { current, filterName, sort_by, sort_order } = this.state
    const { getImagesList } = this.props
    let query = {
      from: (current - 1) * 10,
      size: 10
    }
    if (filterName) {
      Object.assign(query, { filter: `file_nick_name,${filterName}` })
    }
    if (sort_by) {
      Object.assign(query, { sort_by })
    }
    if (sort_order) {
      Object.assign(query, { sort_order })
    }
    getImagesList(query)
  }
  refreshData() {
    this.setState({
      filterName: '',
      sort_by: '',
      sort_order: '',
      publish_time: '',
    }, this.getImagePublishList)
  }
  updateParentPage(page) {
    this.setState({
      current: page
    }, this.getImagePublishList)
  }
  updateParentFilter(name) {
    this.setState({
      filterName:name
    }, this.getImagePublishList)
  }
  updateParentSort(sort_by, sort_order) {
    this.setState({
      sort_by: sort_by,
      sort_order: sort_order
    }, this.getImagePublishList)
  }
  updateParentPublishTime(time, callback) {
    this.setState({
      publish_time: time
    }, callback)
  }
  render() {
    const { imageCheckList, total } = this.props
    const { filterName, publish_time } = this.state
    return(
      <div className="imageCheck">
        <div className="wrapCheckHead">
          <Button className="refreshBtn" type="primary" size="large" onClick={() => this.refreshData()}>
            <i className='fa fa-refresh'/> 刷新
          </Button>
          <CommonSearchInput
            ref="tableChild"
            size="large"
            placeholder="按镜像名称或发布名称搜索"
            style={{ width: 200 }}
            value={filterName}
            onSearch={value => this.updateParentFilter(value)}
          />
          <span className="total verticalCenter">共 {total && total} 条</span>
        </div>
        <ImageCheckTable
          imageCheckList={imageCheckList}
          total={total}
          publish_time={publish_time}
          updateParentPublishTime={this.updateParentPublishTime}
          updateParentPage={this.updateParentPage}
          updateParentSort={this.updateParentSort}
        />
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { appStore } = state
  const { imageCheckList } = appStore || { imageCheckList: {} }
  const { data } = imageCheckList || { data: {} }
  const { apps, total } = data || { apps: [], total: 0 }
  return {
    imageCheckList: apps,
    total
  }
}

export default connect(mapStateToProps, {
  getImagesList,
  imageManage
})(ImageCheck)