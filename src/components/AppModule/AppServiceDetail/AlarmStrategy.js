/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Alarm Strategy component
 *
 * v0.1 - 2017-3-16
 * @author Baiyu
 */
import React, { Component, PropTypes } from 'react'
import { Spin, Table, InputNumber, Select, Modal, Dropdown, Menu, Button } from 'antd'
import { connect } from 'react-redux'
import { calcuDate } from '../../../common/tools.js'
import './style/AlarmStrategy.less'

class AlarmStrategy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lookModel: false
    }
  }
  hnadDelete(record) {
    // Dropdown delete action
    console.log('index  in...', record)
  }

  dropdowns (record){
    // Dropdown delete btn
    return(
      <Menu onClick={()=> this.hnadDelete(record)}
          style={{ width: '80px' }}
      >
      <Menu.Item >
        <span>删除</span>
      </Menu.Item>
    </Menu>

    )
  }
  render() {
    const columns = [
      {
      title: '服务',
      dataIndex: 'app',
      key:'app',
      render: text => <a href="#">{text}</a>,
      }, {
        title: '名称',
        dataIndex: 'name',
        key:'name'
      }, {
        title: '状态',
        dataIndex: 'status',
        key:'status',
        render: (text)=> {
          if (text == 1) {
            return <div style={{color:'#33b867'}}><i className="fa fa-circle" /> &nbsp;启用</div>
          }
          return <div style={{color:'#f23e3f'}}><i className="fa fa-circle" /> &nbsp;停用</div>
        }
      },
      {
        title: '监控周期',
        dataIndex: 'time',
        key:'tiem',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key:'createTime',
        sorter: (a, b) => Date.parse(a.createTime) - Date.parse(b.createTime),
      },
      {
        title: '最后修改人',
        dataIndex: 'editUser',
        key:'edit',
      },
      {
        title: '操作',
        dataIndex: 'name',
        key:'action',
        render: (text, record) => {
          return <Dropdown.Button type="ghost" overlay={ this.dropdowns(record) } onClick={()=> this.setState({lookModel: true})}>忽略</Dropdown.Button>
        }
      }
    ];

    const data = [
      {
        app: 'func',
        name: '大事业部',
        status: 1,
        time:'5分钟',
        createTime: '2017-03-06 15:35:21',
        editUser:'baiyu',
      }, {
        app: 'wrap',
        name: 'test It',
        status: 1,
        time:'15分钟',
        createTime: '2017-03-03 10:35:21',
        editUser:'admin',
      }, {
        app: 'fun2',
        name: '统计',
        status: 0,
        time:'2分钟',
        createTime: '2017-03-02 13:35:21',
        editUser:'baiyu',
      }
    ];
    // 通过 rowSelection 对象表明需要行选择
    // checkbox selected is callback
    const rowSelection = {
      // onChange(selectedRowKeys, selectedRows) {
      //   console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      // },
      // onSelect(record, selected, selectedRows) {
      //   console.log(record, selected, selectedRows);
      // },
      // onSelectAll(selected, selectedRows, changeRows) {
      //   console.log(selected, selectedRows, changeRows);
      // },
    };
    return (
      <div id="AlarmStrategy">
        <div className="topRow">
          <Button icon="reload" size="large" type="primary">刷新</Button>
          <Button icon="delete" size="large" type="ghost">删除</Button>
        </div>
        <Table className="strategyTable" rowSelection={ rowSelection } onRowClick={(record, index)=>console.log('click', record, index)} columns={columns} dataSource={data} pagination={false} />
        <Modal title="忽略" visible={this.state.lookModel}
          onOk={()=> this.handOverlook()} onCancel={()=> this.setState({lookModel: false})}
          okText="提交"
        >
          <div className="alertRow">注意：在忽略时间内我们将不会发送告警邮件通知！</div>
          <div className="modalParams">
            <span className="keys">忽略时长</span>
            <InputNumber size="large" min={1} style={{margin:'0 10px'}}/>
            <Select style={{width: 80}} size="large" defaultValue={'minute'}>
              <Option value="hour">小时</Option>
              <Option value="minute">分钟</Option>
              <Option value="second">秒</Option>
            </Select>
          </div>
        </Modal>
      </div>
    )
  }
}

export default AlarmStrategy