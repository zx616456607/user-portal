/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: service list
 *
 * v0.1 - 2017-07-18
 * @author ZhangXuan
 */

import React from 'react'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { Card, Row, Col, Form, Input, Button, Checkbox, Collapse, Table, Menu, Dropdown  } from 'antd'
import QueueAnim from 'rc-queue-anim'
import CommonSearchInput from '../../CommonSearchInput'
import './style/VMServiceList.less'

export default class VMServiceList extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      selectedRowKeys: []
    }
  }
  handleButtonClick(e) {
  }
  
  handleMenuClick(e) {
  }
  rowClick(record) {
    const { selectedRowKeys } = this.state;
    let newKeys = selectedRowKeys.slice(0)
    if (newKeys.indexOf(record.key) > -1) {
      newKeys.splice(newKeys.indexOf(record.key),1)
    }else {
      newKeys.push(record.key)
    }
    this.setState({
      selectedRowKeys:newKeys
    })
  }
  selectAll(selectedRows) {
    let arr = []
    for (let i = 0; i < selectedRows.length; i++) {
      arr.push(selectedRows[i].key)
    }
    this.setState({
      selectedRowKeys: arr
    })
  }
  render() {
    const { selectedRowKeys } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="1">第一个菜单项</Menu.Item>
        <Menu.Item key="2">第二个菜单项</Menu.Item>
        <Menu.Item key="3">第三个菜单项</Menu.Item>
      </Menu>
    );
    const columns = [{
      title: '服务名',
      dataIndex: 'name',
      render: text => <a href="#">{text}</a>,
    }, {
      title: '状态',
      dataIndex: 'status',
    }, {
      title: '部署包（版本标签）',
      dataIndex: 'packet',
    },{
      title: '部署环境IP',
      dataIndex: 'ip'
    },{
      title: '最后修改人',
      dataIndex: 'man'
    },{
      title: '操作',
      render: ()=>
        <Dropdown.Button onClick={this.handleButtonClick} overlay={menu} type="ghost">
        重新部署
        </Dropdown.Button>
    }];
    const data = [{
      key: '1',
      name: 'service',
      status: 32,
      packet: '西湖区湖底公园1号',
      ip: '192.168.0.1',
      man: '胡彦斌'
    }, {
      key: '2',
      name: 'service',
      status: 32,
      packet: '西湖区湖底公园1号',
      ip: '192.168.0.1',
      man: '胡彦斌'
    }, {
      key: '3',
      name: 'service',
      status: 32,
      packet: '西湖区湖底公园1号',
      ip: '192.168.0.1',
      man: '胡彦斌'
    }, {
      key: '4',
      name: 'service',
      status: 32,
      packet: '西湖区湖底公园1号',
      ip: '192.168.0.1',
      man: '胡彦斌'
    }];

// 通过 rowSelection 对象表明需要行选择
    const rowSelection = {
      selectedRowKeys,
      onSelect:(record)=> this.rowClick(record),
      onSelectAll: (selected, selectedRows)=>this.selectAll(selectedRows),
    };
    return (
      <div className="vmServiceList">
        <div className="serviceListBtnBox">
          <Button type="primary" size="large" onClick={()=>browserHistory.push('/app_manage/app_create/vm_wrap')}><i className="fa fa-plus" /> 创建传统服务</Button>
          <Button size="large" className="refreshBtn"><i className='fa fa-refresh'/> 刷新</Button>
          <Button size="large" icon="delete" className="deleteBtn">删除</Button>
          <CommonSearchInput size="large" placeholder="请输入服务名搜索"/>
          <span className="pull-right totalNum">共计 3 条</span>
        </div>
        <Table rowSelection={rowSelection} columns={columns} dataSource={data} onRowClick={(record)=>this.rowClick(record)}/>
      </div>
    )
  }
}