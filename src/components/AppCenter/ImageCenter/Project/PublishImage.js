/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * PublishImage component
 *
 * v0.1 - 2017-11-16
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Table, Button, Icon } from 'antd'
import { getImagesList } from '../../../../actions/app_store'
import CommonSearchInput from '../../../CommonSearchInput'
import '../style/PublishImage.less'
import TenxStatus from '../../../TenxStatus/index'
import { formatDate } from "../../../../common/tools";

class PublishImage extends React.Component {
  constructor(props) {
    super(props)
    this.getAppStatus = this.getAppStatus.bind(this)
    this.onTableChange = this.onTableChange.bind(this)
    this.searchData = this.searchData.bind(this)
    this.refreshData = this.refreshData.bind(this)
    this.state = {
      filterName: '',
      current: 1
    }
  }
  componentWillMount() {
    this.loadData()
  }
  loadData() {
    const { getImagesList } = this.props
    const { filterName, current } = this.state
    const query = {
      from: (current - 1) * 10,
      size: 10,
    }
    filterName && Object.assign(query, { filter: `file_nick_name,${filterName}` })
    this.setState({
      tableLoading: true
    })
    return getImagesList(query).then(() => {
      this.setState({
        tableLoading: false
      })
    }).catch(() => {
      this.setState({
        tableLoading: false
      })
    })
  }
  onTableChange(pagination) {
    this.setState({
      current: pagination.current,
      tableLoading: true
    }, this.loadData)
  }
  searchData(value) {
    this.setState({
      filterName: value,
      tableLoading: true
    }, this.loadData)
  }
  refreshData() {
    this.setState({
      filterName: '',
      current: 1,
      btnLoading: true
    }, () => {
      this.loadData().then(() => {
        this.setState({
          btnLoading: false
        })
      })
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
        phase = 'WaitForCheck'
        break
      case 2:
        phase = 'Published'
        break
      case 3:
        phase = 'CheckReject'
        break
      case 4:
        phase = 'OffShelf'
        break
      case 5:
        phase = 'ImageCopy'
        progress = {status: true}
        break
      case 6:
        phase = 'ImageCopyFailed'
        break
      case 7:
        phase = 'Deleted'
        break
    }
    return <TenxStatus phase={phase} progress={progress} showDesc={status === 3} description={status === 3 && record.approveMessage}/>
  }
  render() {
    const { apps, total } = this.props
    const { current, filterName, tableLoading, btnLoading } = this.state
    const pagination = {
      simple: true,
      current,
      defaultPageSize: 10,
      total: total
    }
    const columns = [{
      title: '镜像名称',
      dataIndex: 'image',
      key: 'image',
      width: '20%'
    }, {
      title: '发布名称',
      dataIndex: 'fileNickName',
      key: 'fileNickName',
      width: '20%'
    }, {
      title: '发布版本',
      dataIndex: 'tag',
      key: 'tag',
      width: '20%'
    }, {
      title: '发布状态',
      dataIndex: 'publishStatus',
      key: 'publishStatus',
      width: '20%',
      render: this.getAppStatus
    }, {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: '20%',
      render: text => formatDate(text)
    }]
    return(
      <div className="publishImage">
        <div className="headerBox">
          <Button 
            type="primary" 
            size="large" 
            className="refreshBtn"
            loading={btnLoading}
            onClick={this.refreshData}
          >
            <i className="fa fa-refresh" /> 刷新
          </Button>
          <CommonSearchInput
            size="large"
            placeholder="请输入发布名称搜索"
            value={filterName}
            style={{ width: 200 }}
            onSearch={this.searchData}
          />
          {
            total && <div className="total">共计 {total} 条</div>
          }
        </div>
        <Table
          className="reset_antd_table_header publishImageTable"
          dataSource={apps}
          columns={columns}
          pagination={total ? pagination : false}
          onChange={this.onTableChange}
          loading={tableLoading}
        />
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { appStore } = state
  const { imageCheckList } = appStore
  const { data: publishRecord } = imageCheckList || { data: {} }
  const { apps, total } = publishRecord || { apps: [], total: 0 }
  return {
    apps,
    total
  }
}

export default connect(mapStateToProps, {
  getImagesList
})(PublishImage)
