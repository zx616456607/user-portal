/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * DataTable project component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Table,Button } from 'antd'
import { Link } from 'react-router'
import { camelize } from 'humps'
import { formatDate } from '../../../../common/tools'
import { DEFAULT_REGISTRY } from '../../../../constants'
import NotificationHandler from '../../../../common/notification_handler'

const notification = new NotificationHandler()

class DataTable extends Component {
  constructor(props) {
    super()
    this.handleChange = this.handleChange.bind(this)
    this.setProjectPublic = this.setProjectPublic.bind(this)
    this.state = {
      sortedInfo: null,
      filteredInfo: null,
      selectedRows: [],
    }
    this.setPulicBtnLoading = {}
  }

  setProjectPublic(project) {
    this.setPulicBtnLoading[project.name] = true
    const { func } = this.props
    const body = {
      public: Math.abs(project.public - 1)
    }
    func.updateProject(DEFAULT_REGISTRY, project[camelize('project_id')], body, {
      success: {
        func: () => {
          func.loadData()
          this.setPulicBtnLoading[project.name] = false
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          notification.error(`更新仓库组 ${projet.name} 失败`)
          this.setPulicBtnLoading[project.name] = false
        },
      }
    })
  }

  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    })
  }

  render() {
    let { sortedInfo, filteredInfo } = this.state
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}
    const scope = this.props.func.scope
    const defaultColumns = [
      {
        title: '仓库组名称',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => <Link to={`/app_center/projects/detail/${record[camelize('project_id')]}`}>{text}</Link>
      },
      {
        title: '访问级别',
        dataIndex: 'public',
        key: 'public',
        filters: [
          { text: '私有', value: 0 },
          { text: '公开', value: 1 },
        ],
        filteredValue: filteredInfo.public,
        onFilter: (value, record) => record.public == value,
        render: text => {
          if (text === 0) {
            return '私有'
          }
          return '公开'
        }
      },
      {
        title: '我的角色',
        dataIndex: camelize('current_user_role_id'),
        key: camelize('current_user_role_id'),
        filters: [
          { text: '管理员', value: 1 },
          { text: '开发人员', value: 2 },
          { text: '访客', value: 3 },
        ],
        filteredValue: filteredInfo[camelize('current_user_role_id')],
        onFilter: (value, record) => record[camelize('current_user_role_id')] == value,
        render: text => {
          if (text == 1) {
            return '管理员'
          }
          if (text == 2) {
            return '开发人员'
          }
          if (text == 3) {
            return '访客'
          }
          return ''
        }
      },
      {
        title: '镜像仓库数',
        dataIndex: camelize('repo_count'),
        key: camelize('repo_count'),
        sorter: (a, b) => a[camelize('repo_count')] - b[camelize('repo_count')],
        sortOrder: sortedInfo.columnKey === camelize('repo_count') && sortedInfo.order
      },
      {
        title: '创建时间',
        dataIndex: camelize('creation_time'),
        key: camelize('creation_time'),
        render: text => formatDate(text),
        sorter: (a, b) => new Date(a[camelize('creation_time')]) - new Date(b[camelize('creation_time')]),
        sortOrder: sortedInfo.columnKey === camelize('creation_time') && sortedInfo.order
      },
      {
        title: '更新时间',
        dataIndex: camelize('update_time'),
        key: camelize('update_time'),
        render: text => formatDate(text),
        sorter: (a, b) => new Date(a[camelize('update_time')]) - new Date(b[camelize('update_time')]),
        sortOrder: sortedInfo.columnKey === camelize('update_time') && sortedInfo.order
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, row) => {
          if (row[camelize('current_user_role_id')] == 1) {
            return (
              <div className="action">
                <Button
                  size="large"
                  type="primary"
                  loading={this.setPulicBtnLoading[row.name]}
                  onClick={this.setProjectPublic.bind(this, row)}
                >
                  {row.public == 1 ? '设为私有' : '设为公开'}
                </Button>
                <Button size="large" type="ghost" onClick={()=>scope.setState({deleteItem:true,selectedRows:[row]})}>
                  删除
                </Button>
              </div>
            )
          }
          return (
            <div className="action">
              <Button size="large" disabled={true} type="primary">
                {row.public == 1 ? '设为私有' : '设为公开'}
              </Button>
              <Button size="large" disabled={true} type="ghost">删除</Button>
            </div>
          )
        }
      }
    ]
    const columns = []
    defaultColumns.forEach(column => {
      if (this.props.from === 'public') {
        if (([ 'public', 'action', camelize('current_user_role_id') ]).indexOf(column.dataIndex) > -1) {
          return
        }
      }
      columns.push(column)
    })
    /*const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        scope.setState({selectedRows})
      }
    }*/
    const { dataSource, func } = this.props
    const paginationOpts = {
      simple: true,
      pageSize: 10,
      total: dataSource.total,
      onChange: current => func.loadData({ page: current })
    }
    return (
      <Table className="myImage"
        dataSource={dataSource.list}
        columns={columns}
        loading={dataSource.isFetching}
        pagination={paginationOpts}
        onChange={this.handleChange}
      />
    )
  }
}

export default DataTable