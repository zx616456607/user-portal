/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App Wrap Check
 *
 * v0.1 - 2017-11-08
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Button, Table, Icon, Card, Pagination } from 'antd'
import QueueAnim from 'rc-queue-anim'
import classNames from 'classnames'
import './style/index.less'
import CommonSearchInput from '../../CommonSearchInput'
import TenxStatus from '../../TenxStatus/index'
import { getWrapPublishList, passWrapPublish, refuseWrapPublish } from '../../../actions/app_center'
import { formatDate } from '../../../common/tools'
import NotificationHandler from '../../../components/Notification'

const TabPane = Tabs.TabPane;

class WrapCheckTable extends React.Component {
  constructor(props) {
    super(props)
    this.getWrapStatus = this.getWrapStatus.bind(this)
    this.onTableChange = this.onTableChange.bind(this)
    this.state = {
      creationTime: undefined
    }
  }
  getWrapStatus(status){
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
  onTableChange(pagination) {
    const { updateParentPage } = this.props
    const page = pagination.current
    updateParentPage(page)
  }
  handleSort(sortStr) {
    const { updateParentSort } = this.props
    let currentSort = this.state[sortStr]
    let sortOrder = this.getSortOrder(currentSort)
    this.setState({
      [sortStr]: !currentSort,
    }, () => {
      updateParentSort(sortStr, sortOrder)
    })
  }
  getSortOrder(flag) {
    let str = 'asc'
    if (flag) {
      str = 'desc'
    }
    return str
  }
  render() {
    const { wrapPublishList, passPublish, refusePublish } = this.props
    const pagination = {
      simple: true,
      defaultCurrent: 1,
      defaultPageSize: 10,
      total: wrapPublishList.total,
    }
    const columns = [{
      title: '状态',
      dataIndex: 'publishStatus',
      key: 'publishStatus',
      width: '10%',
      render: this.getWrapStatus
    }, {
      title: '应用包名称',
      dataIndex: 'fileName',
      key: 'fileName',
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
      title: '应用包描述',
      dataIndex: 'description',
      key: 'description',
      width: '10%',
    }, {
      title: '发布者',
      dataIndex: 'creatorName',
      key: 'creatorName',
      width: '10%',
    }, {
      title: (
        <div onClick={() => this.handleSort('creationTime')}>
          提交时间
          <div className="ant-table-column-sorter">
            <span
              className={this.state.creationTime === true ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'}
              title="↑">
              <i className="anticon anticon-caret-up"/>
            </span>
            <span
              className={this.state.creationTime === false ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'}
              title="↓">
              <i className="anticon anticon-caret-down"/>
            </span>
          </div>
        </div>
      ),
      dataIndex: 'creationTime',
      key: 'creationTime',
      width: '20%',
      render: text => formatDate(text)
    }, {
      title: '操作',
      key: 'operation',
      width: '20%',
      render: (text, record) => {
        return(
          <div>
            <Button 
              className="passBtn" type="primary"
              onClick={() => passPublish(record.id)}
              disabled={record.publishStatus !== 1}
            >
              通过
            </Button>
            <Button 
              type="ghost"
              onClick={() => refusePublish(record.id)}
              disabled={record.publishStatus !== 1}
            >
              拒绝
            </Button>
          </div>
        )
      }
    }]
    return (
      <div className="wrapCheckTableBox">
        <Table
          className="wrapCheckTable"
          dataSource={wrapPublishList.pkgs}
          columns={columns}
          onChange={this.onTableChange}
          pagination={pagination}
        />
      </div>
    )
  }
}

class WrapCheck extends React.Component {
  constructor(props) {
    super(props)
    this.getWrapPublishList = this.getWrapPublishList.bind(this)
    this.passPublish = this.passPublish.bind(this)
    this.refusePublish = this.refusePublish.bind(this)
    this.updateParentPage = this.updateParentPage.bind(this)
    this.updateParentFilter = this.updateParentFilter.bind(this)
    this.updateParentSort = this.updateParentSort.bind(this)
    this.state = {
      current: 1,
      filterName: undefined,
      sort_by: undefined,
      sort_order: undefined
    }
  }
  componentWillMount() {
    this.getWrapPublishList()
  }
  getWrapPublishList() {
    const { current, filterName, sort_by, sort_order } = this.state
    const { getWrapPublishList } = this.props
    let query = {
      from: (current - 1) * 10,
      size: 10
    }
    if (filterName) {
      Object.assign(query, { filter: `fileName contains ${filterName}` })
    }
    if (sort_by) {
      Object.assign(query, { sort_by })
    }
    if (sort_order) {
      Object.assign(query, { sort_order })
    }
    getWrapPublishList(query)
  }
  updateParentPage(page) {
    this.setState({
      current: page
    }, () => this.getWrapPublishList())
  }
  updateParentFilter(name) {
    this.setState({
      filterName:name
    }, () => this.getWrapPublishList())
  }
  updateParentSort(sort_by, sort_order) {
    this.setState({
      sort_by: sort_by,
      sort_order: sort_order
    }, () => this.getWrapPublishList())
  }
  passPublish(pkgID) {
    const { passWrapPublish } = this.props
    let notify = new NotificationHandler()
    notify.spin('通过中')
    passWrapPublish(pkgID, {
      success: {
        func: () => {
          notify.close()
          notify.success('通过审批成功')
          this.getWrapPublishList()
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.close()
          notify.error('通过审批失败')
        }
      }
    })
  }
  refusePublish(pkgID) {
    const { refuseWrapPublish } = this.props
    let notify = new NotificationHandler()
    notify.spin('拒绝中')
    refuseWrapPublish(pkgID, {
      success: {
        func: () => {
          notify.close()
          notify.success('拒绝审批成功')
          this.getWrapPublishList()
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.close()
          notify.error('拒绝审批失败')
        }
      }
    })
  }
  render() {
    const { wrapPublishList } = this.props
    return (
      <QueueAnim>
        <div key="wrapCheck" className="wrapCheck">
          <div className="wrapCheckHead">
            <Button className="refreshBtn" type="primary" size="large" onClick={() => this.getWrapPublishList()}>
              <i className='fa fa-refresh'/> 刷新
            </Button>
            <CommonSearchInput
              size="large"
              placeholder="请输入应用宝搜索"
              style={{ width: 200 }}
              onSearch={value => this.updateParentFilter(value)}
            />
            <span className="total verticalCenter">共 {wrapPublishList && wrapPublishList.total} 条</span>
          </div>
          <WrapCheckTable
            wrapPublishList={wrapPublishList}
            passPublish={this.passPublish}
            refusePublish={this.refusePublish}
            updateParentPage={this.updateParentPage}
            updateParentSort={this.updateParentSort}
          />
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { images } = state
  const { wrapPublishList } = images
  const { result } = wrapPublishList || { result: {}}
  const { data } = result || { data: [] }
  return {
    wrapPublishList: data
  }
}

export default connect(mapStateToProps, {
  getWrapPublishList,
  passWrapPublish, 
  refuseWrapPublish
})(WrapCheck)