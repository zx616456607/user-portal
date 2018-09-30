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
import { connect } from 'react-redux'
import { Modal, Tabs, Menu, Dropdown, Table, Icon, Button, Input, Select } from 'antd'
import '../style/Logs.less'
import { loadProjectLogs } from '../../../../actions/harbor'
import { DEFAULT_REGISTRY,  } from '../../../../constants'
import { formatDate } from '../../../../common/tools'
import SearchInput from '../../../SearchInput'
import { injectIntl } from 'react-intl'
import logIntl from './intl/logs'
const Option = Select.Option

class PageLogs extends Component {
  constructor(props) {
    super()
    this.state = {
      currentPage: 1,
      pageSize: 10,
      searchType: 'username',
      Name:'',
    }
  }
  loadData(query, data) {
    const { loadProjectLogs, params, harbor } = this.props
    query.harbor = harbor
    loadProjectLogs(DEFAULT_REGISTRY, params.id, query, data)
  }
  componentWillMount() {
    this.loadData({
      page: this.state.currentPage,
      page_size: this.state.pageSize
    })
    const { formatMessage } = this.props.intl
    this.select = <Select style={{width: '90px'}} defaultValue="username" onChange={(e) => this.searchType(e)}>
      <Option key="username">{formatMessage(logIntl.memberName)}</Option>
      <Option key="repo_name">{formatMessage(logIntl.imageName)}</Option>
    </Select>
  }
  componentDidUpdate() {
    let searchInput = document.getElementById('logSearch')
    searchInput && searchInput.focus()
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
  searchLogs(keyword) {
    //const keyword = e.target.value
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
    })
  }
  render() {
    const { projectLogs, intl } = this.props
    const { formatMessage } = intl
    const { isFetching, list, total } = projectLogs
    let filterKey = [
      { text: 'Pull', value: 'pull' },
      { text: 'Push', value: 'push' },
      { text: 'Create', value: 'create' },
      { text: 'Delete', value: 'Delete' },
      { text: formatMessage(logIntl.other), value: 'other' },
    ]
    const columns = [
      {
        title: formatMessage(logIntl.memberName),
        dataIndex: 'username',
        key: 'username',
        width: '20%',
      }, {
        title: formatMessage(logIntl.imageName),
        dataIndex: 'repoName',
        key: 'repoName',
        width: '30%',
      }, {
        title: formatMessage(logIntl.tag),
        dataIndex: 'repoTag',
        key: 'repoTag',
        width: '10%',
        render(value) {
          if(value === 'N/A') {
            return '-'
          }
          return value
        }
      },{
        title: formatMessage(logIntl.option),
        dataIndex: 'operation',
        filters: filterKey,
        key: 'operation',
        width: '10%',
      }, {
        title: formatMessage(logIntl.timestamp),
        dataIndex: 'opTime',
        key: 'opTime',
        width: '30%',
        render(value, row, index) {
          if(row.opTime) {
            return formatDate(row.opTime)
          }
          return ''
        }
      }
    ]

    const pagination = {
      size: "small",
      defaultPageSize:
      this.state.pageSize,
      total: total ? total : 0,
      current: this.state.currentPage,
      showTotal: total => `${formatMessage(logIntl.total, {total})}`,
    }

    return (
      <div id="logs">
        <div className='littleLeft'>
          <i className='fa fa-search' onClick={this.searchLogs.bind(this, this.state.Name)} />
        </div>
        <div className="topRow">
          <Input addonBefore={this.select} placeholder={formatMessage(logIntl.searchPlaceholder)} onChange={(e) => {this.setState({Name: e.target.value})}} className="search" id="logSearch" size='large' onPressEnter={(e) => this.searchLogs(e.target.value)} />
          {/*{total >0 ?
            <span className="totalPage">共计：{total} 条</span>
          :null
          }*/}
        </div>
        <Table style={{ marginTop: '20px' }} className="myImage"
          dataSource={list}
          columns={columns}
          locale={{
            emptyText: formatMessage(logIntl.noData),
            filterConfirm:  formatMessage(logIntl.confirm),
            filterReset:  formatMessage(logIntl.reset)
          }}
          pagination={pagination}
          onChange={(pagination, filter, sort) => this.filter(pagination, filter, sort)}
          loading={isFetching} />
      </div>
    )
  }
}
const Logs = injectIntl(PageLogs, {
  withRef: true
})
function mapStateToProps(state, props) {
  const defaultProjectLogs = {
    isFetching: false,
    list: []
  }
  let projectLogs = state.harbor.projectLogs
  if(projectLogs[DEFAULT_REGISTRY]) {
    projectLogs = projectLogs[DEFAULT_REGISTRY]
  } else {
    projectLogs = defaultProjectLogs
  }

  const { cluster } =  state.entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    projectLogs,
    harbor,
  }
}

export default connect(mapStateToProps, {
  loadProjectLogs
})(Logs)
