/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Logs component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Modal, Tabs, Menu, Dropdown, Table, Icon, Button, Input } from 'antd'
import '../style/Logs.less'


class Logs extends Component {
  constructor(props) {
    super()
    this.state = {
      currentPage: 1,
      pageSize: 10,
      searchType: 'username'
    }
  }
  loadData(query, data) {
    const { loadProjectLogs, params } = this.props
    loadProjectLogs(DEFAULT_REGISTRY, params.id, query, data)
  }
  componentWillMount() {
    this.loadData({
      page: this.state.currentPage,
      page_size: this.state.pageSize
    })
    this.select = <Select style={{width: '90px'}} defaultValue="username" onChange={(e) => this.searchType(e)}>
      <Option key="username">成员名</Option>
      <Option key="repo_name">镜像名称</Option>
    </Select>
  }
  searchType(e) {
    this.setState({
      searchType: e
    })
  }
  pageChange(page) {
    this.setState({
      currentPage: page
    })
    const postBody = {
    }
    if(this.state.keyword) {
      postBody[this.state.searchType] = this.state.keyword
    }
    if(this.state.filterOp) {
      postBody.keywords = this.state.filterOp
    }
    this.loadData({
      page: page,
      page_size: this.state.pageSize
    }, postBody)
  }
  searchLogs(e) {
    const keyword = e.target.value
    if(!keyword) return
    this.setState({
      keyword,
      currentPage: 1
    })
    const postBody = {
      [this.state.searchType]: keyword
    }
    if(this.state.filterOp) {
      postBody.keywords = this.state.filterOp
    }
    this.loadData({
      page: 1,
      page_size: this.state.pageSize
    }, postBody)
  }
  filter(pagination, filter, sort) {
    let page = pagination.current
    if(page == this.state.page) {
      page = 1
    }
    let filterOp = ''
    if(filter.operation && filter.operation.length > 0) {
      filterOp = filter.operation.join('/')
    }
    this.setState({
      currentPage: page,
      filterOp: filterOp,
    })
    const postBody = {
    }
    if(filterOp) {
      postBody.keywords = filterOp
    }
    if(this.state.keyword) {
      postBody[this.state.searchType] = this.state.keyword
    }
    this.loadData({
      page: page,
      page_size: this.state.pageSize
    }, postBody)
  }
  render() {
    const { projectLogs } = this.props
    const { isFetching, list, total } = projectLogs
    let filterKey = [
      { text: 'Pull', value: 'pull' },
      { text: 'Push', value: 'push' },
      { text: 'Create', value: 'create' },
      { text: 'Delete', value: 'Delete' },
      { text: '其他', value: 'other' },
    ]
    const columns = [
      {
        title: '成员名',
        dataIndex: 'name',
        key: 'name',

      }, {
        title: '镜像名称',
        dataIndex: 'imageName',
        key: 'imageName',
      }, {
        title: '标签',
        dataIndex: 'labels',
        key: 'labels',
      }, {
        title: '操作',
        dataIndex: 'action',
        key: 'action'
      }, {
        title: '时间戳',
        dataIndex: 'createTime',
        key: 'createTime'
      }
    ]
    return (
      <div id="logs">
        <div className="topRow">
          <Input addonBefore={this.select} placeholder="搜索" className="search" size='large' onPressEnter={(e) => this.searchLogs(e)} />
          {total >0 ?
            <span className="totalPage">共计：{total} 条</span>
          :null
          }
        </div>
        <Table className="myImage" dataSource={dataSource} columns={columns} pagination={{ simple: true }} />
      </div>
    )
  }


}

export default Logs