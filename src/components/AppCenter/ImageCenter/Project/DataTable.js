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

class DataTable extends Component {
  constructor(props) {
    super()
    this.state = {
      sortedInfo: null,
      filteredInfo: null,
      selectedRows:[]
    }
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
        render: text => <Link to={`/app_center/projects/detail/${text}`}>{text}</Link>
      },
      {
        title: '访问级别',
        dataIndex: 'type',
        key: 'type',
        filters: [
          { text: '私有', value: '1' },
          { text: '公开', value: '2' },
        ],
        filteredValue: filteredInfo.type,
        onFilter: (value, record) => record.type.indexOf(value) == 1,
        render: (text) => {
          if (text == 1) {
            return '私有'
          }
          return '公开'
        }
      },
      {
        title: '我的角色',
        dataIndex: 'role',
        key: 'role',
        filters: [
          { text: '项目管理员', value: '1' },
          { text: '开发人员', value: '2' },
          { text: '访客', value: '3' },
        ],
        filteredValue: filteredInfo.type,
        onFilter: (value, record) => record.type.indexOf(value) == 1,
        render: (text) => {
          if (text == 1) {
            return '项目管理员'
          }
          if (text == 2) {
            return '开发人员'
          }
          return '访客'
        }
      },
      {
        title: '镜像仓库数',
        dataIndex: 'ropo',
        key: 'ropo',
        sorter: (a, b) => a.ropo - b.ropo,
        sortOrder: sortedInfo.columnKey === 'ropo' && sortedInfo.order
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        sorter: (a, b) => a.createTime - b.createTime,
        sortOrder: sortedInfo.columnKey === 'createTime' && sortedInfo.order
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, row) => {
          if (row.role == 1) {
            return (
              <div className="action"><Button size="large" type="primary">设为公开</Button><Button size="large" type="ghost" onClick={()=>scope.setState({deleteItem:true,selectedRows:[row]})}>删除</Button></div>
            )
          }
          return (
            <div className="action"><Button size="large" disabled={true} type="primary">设为{row.type == 2 ? '私有' : '公开'}</Button><Button size="large" disabled={true} type="ghost">删除</Button></div>
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
      <Table className="myImage" dataSource={dataSource} columns={columns} rowSelection={rowSelection} pagination={{ simple: true }} />
    )
  }
}

export default DataTable