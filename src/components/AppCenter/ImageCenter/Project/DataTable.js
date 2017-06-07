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

class DataTable extends Component {
  constructor(props) {
    super()
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      sortedInfo: null,
      filteredInfo: null,
      selectedRows: [],
    }
  }

  handleChange(pagination, filters, sorter) {
    console.log('各类参数是', pagination, filters, sorter);
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
    const columns = [
      {
        title: '项目名称',
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
          { text: '项目管理员', value: 1 },
          { text: '开发人员', value: 2 },
          { text: '访客', value: 3 },
        ],
        filteredValue: filteredInfo[camelize('current_user_role_id')],
        onFilter: (value, record) => record[camelize('current_user_role_id')] == value,
        render: text => {
          if (text == 1) {
            return '项目管理员'
          }
          if (text == 2) {
            return '开发人员'
          }
          if (text == 3) {
            return '访客'
          }
          return '未知'
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
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, row) => {
          if (row[camelize('current_user_role_id')] == 1 || row[camelize('current_user_role_id')] == 2) {
            return (
              <div className="action">
                <Button size="large" type="primary">
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
    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        scope.setState({selectedRows})
      }
    }
    const { dataSource } = this.props
    return (
      <Table className="myImage"
        dataSource={dataSource.list}
        columns={columns}
        rowSelection={rowSelection}
        pagination={{ simple: true }}
        onChange={this.handleChange}
      />
    )
  }
}

export default DataTable