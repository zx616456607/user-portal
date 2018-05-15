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
import { Table, Button, Icon, Tabs } from 'antd'
import { getImagesList } from '../../../../actions/app_store'
import CommonSearchInput from '../../../CommonSearchInput'
import '../style/PublishImage.less'
import TenxStatus from '../../../TenxStatus/index'
import { formatDate } from "../../../../common/tools"
import QueueAnim from 'rc-queue-anim'

const TabPane = Tabs.TabPane

class PublishImage extends React.Component {
  constructor(props) {
    super(props)
    this.getAppStatus = this.getAppStatus.bind(this)
    this.onTableChange = this.onTableChange.bind(this)
    this.searchData = this.searchData.bind(this)
    this.refreshData = this.refreshData.bind(this)

    this.onStorageTableChange = this.onStorageTableChange.bind(this)
    this.refreshStorageData = this.refreshStorageData.bind(this)
    this.state = {
      filterName: '',
      current: 1,

      storageCurrent: 1
    }
  }
  componentWillMount() {
    this.loadData()
  }
  componentDidUpdate() {
    let input = document.getElementById('publishRecordInput')
    input && input.focus()
  }
  loadData() {
    const { getImagesList } = this.props     //
    const { filterName, current } = this.state
    const query = {
      from: (current - 1) * 10,
      size: 10,
      sort: 'd,publish_time'
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
  onStorageTableChange(pagination) {
    this.setState({
      current: pagination.current,
      tableLoading: true
    }, this.loadData)
    // console.log( 'table_onChange' )
  }
  searchData(value) {
    this.setState({
      filterName: value,
      tableLoading: true
    }, this.loadData)
  }
  searchStorageData(value) {
    searchData(value)
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
  refreshStorageData() {
    this.refreshData()
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
    const { apps, listData, total, storeList, marketList, marketTotal, storageTotal } = this.props
    const { current, filterName, tableLoading, btnLoading } = this.state
    const pagination = {
      simple: true,
      current,
      defaultPageSize: 10,
      total: marketTotal
    }
    const columns = [{
      title: '镜像名称',
      dataIndex: 'image',
      key: 'image',
      width: '20%',
      render: text => text && text.split('/')[1]
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
    const storageColumns = [{       //================ 更换 dataindex、key、...
      title: '镜像名称',
      dataIndex: 'image',
      key: 'image',
      width: '20%',
      render: text => text && text.split('/')[1]
    }, {
      title: '发布版本',
      dataIndex: 'tag',
      key: 'tag',
      width: '20%'
    }, {
      title: '目标仓库组',
      dataIndex: 'fileNickName',
      key: 'fileNickName',
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
      <QueueAnim className="publishImage">
        <Tabs defaultActiveKey="market">
          <TabPane tab="发布到商店" key="market">
            <div className="headerBox" key="headerBox">
              <Button
                type="primary"
                size="large"
                className="refreshBtn"
                onClick={this.searchData}
              >
                <i className="fa fa-refresh"/> 刷新
              </Button>
              <CommonSearchInput
                size="large"
                id="publishRecordInput"
                placeholder="请输入发布名称搜索"
                value={filterName}
                style={{ width: 200 }}
                onSearch={this.refreshData}
              />
              {
                marketTotal ? <div className="total">共计 {marketTotal} 条</div> : null
              }
            </div>
            <Table
              className="reset_antd_table_header publishImageTable"
              dataSource={marketList}
              columns={columns}
              pagination={marketTotal ? pagination : false}
              onChange={this.onTableChange}
              loading={tableLoading}
              key="body"
            />
          </TabPane>
          <TabPane tab="发布到仓库" key="store">
            <div className="headerBox" key="headerBox">
              <Button
                type="primary"
                size="large"
                className="refreshBtn"
                onClick={this.refreshStorageData}
              >
                <i className="fa fa-refresh"/> 刷新
              </Button>
              <CommonSearchInput
                size="large"
                id="publishRecordInput"
                placeholder="请输入发布名称搜索"
                value={filterName}
                style={{ width: 200 }}
                onSearch={this.searchStorageData}
              />
              {/*
              Imput 修改   search something
              */}
              {
                storageTotal ? <div className="total">共计 {storageTotal} 条</div> : null
              }
            </div>
            <Table
              className="reset_antd_table_header publishImageTable"
              dataSource={storeList}               //获取listData
              columns={storageColumns}
              pagination={storageTotal ? pagination : false}
              onChange={this.onStorageTableChange}
              //loading={tableLoading}
              key="storageBody"
            />
          </TabPane>
        </Tabs>

      </QueueAnim>
    )
  }
}

function mapStateToProps(state) {
  const { appStore } = state
  const { imageCheckList } = appStore
  const { data: publishRecord } = imageCheckList || { data: {} }
  const { apps, total } = publishRecord || { apps: [], total: 0 }
  // const { listData, storageTotal } = state

  let marketList = []
  let storeList = []
  if (apps && apps.length && apps.length>0) {
    storeList = apps.filter((item) => {
        return item.warehouseGroup.length > 0
    })
    marketList = apps.filter((item) => {
        return item.warehouseGroup.length == 0
    })
  }
  let marketTotal = total - storeList.length
  let storageTotal = storeList.length

  return {
    apps,
    total,

    storeList,
    marketList,

    // listData,
    marketTotal,
    storageTotal,
  }
}

export default connect(mapStateToProps, {
  getImagesList
})(PublishImage)
