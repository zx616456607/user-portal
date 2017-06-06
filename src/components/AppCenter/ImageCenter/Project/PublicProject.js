/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Modal, Tabs, Table, Icon, Button, Card, Input } from 'antd'
import QueueAnim from 'rc-queue-anim'
import '../style/Project.less'
import { Link } from 'react-router'
import Logs from '../ImageItem/Logs'
import Management from '../ImageItem/Management'
import CodeRepo from '../ImageItem/CodeRepo'
const TabPane = Tabs.TabPane

class PublicProject extends Component {
  constructor(props) {
    super()
    this.state = {
      isProject: true, // top project type
      sortedInfo: null,
      filteredInfo: null
    }
  }
  render() {
    let { sortedInfo, filteredInfo } = this.state
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}
    const { route } = this.props

    const dataSource = [
      {
        name: 'demo-1',
        type: 1,
        role: '1',
        ropo: '90',
        createTime: '2017-4-5'
      },
      {
        name: 'demo-2',
        type: 2,
        role: '2',
        ropo: '30',
        createTime: '2017-8-5'
      },
      {
        name: 'demo-33',
        type: 1,
        role: '3',
        ropo: '50',
        createTime: '2017-4-0'
      }
    ]
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
              <div className="action"><Button size="large" type="primary">设为公开</Button><Button size="large" type="ghost">删除</Button></div>
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
      },
      onSelect(record, selected, selectedRows) {
        console.log(record, selected, selectedRows);
      },
      onSelectAll(selected, selectedRows, changeRows) {
        console.log(selected, selectedRows, changeRows);
      },
    };
    return (
      <div className="imageProject">
        <br />
        <div className="alertRow">镜像仓库用于存放镜像，您可关联第三方镜像仓库，使用公开云中私有空间镜像；关联后，该仓库也用于存放通过TenxFlow构建出来的镜像</div>
        <QueueAnim>
          <div key="projects">

            <Card className="project">
              <div className="topRow">
                <Input placeholder="搜索" className="search" size="large" />
                <i className="fa fa-search"></i>
                <span className="totalPage">共计：{dataSource.length} 条</span>
              </div>
              <Table className="myImage" dataSource={dataSource} columns={columns} rowSelection={rowSelection} pagination={{ simple: true }} />
            </Card>

          </div>
        </QueueAnim>
      </div>
    )
  }
}

export default PublicProject