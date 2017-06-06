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
  }
  render() {
     const dataSource = [
      {
        name: 'shwart-1',
        imageName: 'shwart/hello word',
        labels: 'lates',
        action: 'create',
        createTime: '2017-6-8'
      },
      {
        name: 'demo',
        imageName: 'demo/testing',
        labels: '2017',
        action: 'delete',
        createTime: '2017-6-4'
      },
      {
        name: 'test',
        imageName: 'test/hello word',
        labels: '666',
        action: 'put',
        createTime: '2017-6-18'
      }
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
          <Input placeholder="搜索" className="search" size='large' />
          <i className="fa fa-search"></i>
          <span className="totalPage">共计：{dataSource.length} 条</span>
        </div>
        <Table className="myImage" dataSource={dataSource} columns={columns} pagination={{ simple: true }} />
      </div>
    )
  }


}

export default Logs