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
import TimeHover from '@tenx-ui/time-hover/lib'

const TabPane = Tabs.TabPane

class PublishImage extends React.Component {
  constructor(props) {
    super(props)
    this.getAppStatus = this.getAppStatus.bind(this)
    this.onTableChange = this.onTableChange.bind(this)
    this.searchData = this.searchData.bind(this)
    this.refreshData = this.refreshData.bind(this)

    this.handleChangeTabs = this.handleChangeTabs.bind(this)
    this.searchStorageData = this.searchStorageData.bind(this)
    this.onStorageTableChange = this.onStorageTableChange.bind(this)
    this.refreshStorageData = this.refreshStorageData.bind(this)
    this.state = {
      filterName: '',
      targetProject: '',
      current: 1,
      filter: 'target_project__eq,,',
      storageCurrent: 1,
      radioVal: 'market',
    }
  }
  componentWillMount() {
    this.loadData()
  }
  componentDidMount() {
    const rad = this.props.location.query.radioVal || ''
    if (rad) {
      this.setState({
        radioVal: rad
      },() => this.handleChangeTabs(rad))
    }
  }
  componentDidUpdate() {
    let input = document.getElementById('publishRecordInput')
    input && input.focus()
  }
  handleChangeTabs(key) {
    switch (key) {
      case 'market':
        return this.setState({
          filter: 'target_project__eq,,',
          targetProject: '',
          ccurrent: 1,
          radioVal: 'market'
        },this.loadData)
      case 'store':
        return this.setState({
          filter: 'target_project__neq,,',
          filterName: '',
          current: 1,
          radioVal: 'store'
        },this.loadData)
    }
  }
  loadData() {
    const { getImagesList, cluster } = this.props
    const { filterName, targetProject, current, filter } = this.state
    const query = {
      from: (current - 1) * 10,
      size: 10,
      filter,
      sort: 'd,publish_time'
    }
    filterName && Object.assign(query, { filter: `file_nick_name,${filterName},${filter}` })
    targetProject && Object.assign(query, { filter: `target_project,${targetProject},${filter}` })
    const tempfilter = query.filter
    query.filter = tempfilter + 'current_cluster,' + cluster.clusterID
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
  }
  searchData(value) {
    this.setState({
      filterName: value,
      tableLoading: true
    }, this.loadData)
  }
  searchStorageData(value) {
    this.setState({
      targetProject: value,
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
  refreshStorageData() {
    this.setState({
      targetProject: '',
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
    const { apps, listData, total, } = this.props
    const { current, filterName, targetProject, tableLoading, btnLoading } = this.state
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
        width: '17%',
        render: text => text && text.split('/')[1]
      }, {
        title: '发布名称',
        dataIndex: 'fileNickName',
        key: 'fileNickName',
        width: '17%'
      }, {
        title: '目标集群',
        dataIndex: 'clusterName',
        key: 'clusterName',
        width: '17%'
      }, {
        title: '发布版本',
        dataIndex: 'tag',
        key: 'tag',
        width: '17%'
      }, {
        title: '发布状态',
        dataIndex: 'publishStatus',
        key: 'publishStatus',
        width: '17%',
        render: this.getAppStatus
      }, {
        title: '发布时间',
        dataIndex: 'publishTime',
        key: 'publishTime',
        width: '17%',
        render: text => <TimeHover time={text} />
      }]
    const storageColumns = [{
        title: '镜像名称',
        dataIndex: 'image',
        key: 'image',
        width: '17%',
        render: text => text && text.split('/')[1]
      }, {
        title: '目标集群',
        dataIndex: 'clusterName',
        key: 'clusterName',
        width: '17%'
      }, {
        title: '发布版本',
        dataIndex: 'tag',
        key: 'tag',
        width: '17%'
      }, {
        title: '目标仓库组',
        dataIndex: 'targetProject',
        key: 'targetProject',
        width: '17%'
      }, {
        title: '发布状态',
        dataIndex: 'publishStatus',
        key: 'publishStatus',
        width: '17%',
        render: this.getAppStatus
      }, {
        title: '发布时间',
        dataIndex: 'publishTime',
        key: 'publishTime',
        width: '17%',
        render: text => <TimeHover time={text} />
      }]
    return(
      <QueueAnim className="publishImage">
        <Tabs    defaultActiveKey='market' activeKey={this.state.radioVal} onChange={this.handleChangeTabs}>
          <TabPane tab="发布到商店" key="market">
            <div className="headerBox" key="headerBox">
              <Button
                type="primary"
                size="large"
                className="refreshBtn"
                onClick={this.refreshData}
              >
                <i className="fa fa-refresh"/> 刷新
              </Button>
              <CommonSearchInput
                size="large"
                id="publishRecordInput"
                placeholder="请输入发布名称搜索"
                value={filterName}
                style={{ width: 200 }}
                onSearch={this.searchData}
              />
              {
                total ? <div className="total">共计 {total} 条</div> : null
              }
            </div>
            <Table
              className="reset_antd_table_header publishImageTable"
              dataSource={apps}
              columns={columns}
              pagination={total ? pagination : false}
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
                placeholder="请输入目标仓库组搜索"
                value={targetProject}
                style={{ width: 200 }}
                onSearch={this.searchStorageData}
              />
              {
                total ? <div className="total">共计 {total} 条</div> : null
              }
            </div>
            <Table
              className="reset_antd_table_header publishImageTable"
              dataSource={apps}
              columns={storageColumns}
              pagination={total ? pagination : false}
              onChange={this.onStorageTableChange}
              loading={tableLoading}
              key="storageBody"
            />
          </TabPane>
        </Tabs>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state) {
  const { appStore, ent, entities } = state
  const { current } = entities
  const { imageCheckList } = appStore
  const { data: publishRecord } = imageCheckList || { data: {} }
  const { apps, total } = publishRecord || { apps: [], total: 0 }
  const { cluster } =  current
  return {
    apps,
    total,
    cluster,
  }
}

export default connect(mapStateToProps, {
  getImagesList
})(PublishImage)
