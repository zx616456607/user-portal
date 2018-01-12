/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AutoScaleList
 *
 * v0.1 - 2018-01-12
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Button, Table, Icon, Pagination } from 'antd'
import SearchInput from '../../CommonSearchInput'

import './style/index.less'

class LoadBalance extends React.Component {
  state = {
    
  }
  componentWillMount() {
    
  }
  
  render() {
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
    const columns = [{
      title: '姓名',
      dataIndex: 'name',
      render: text => <a href="#">{text}</a>,
    }, {
      title: '年龄',
      dataIndex: 'age',
    }, {
      title: '住址',
      dataIndex: 'address',
    }];
    const data = []
    for (let i = 0; i < 3; i ++ ) {
      data.push({
        key: i,
        name: `${i}mao`,
        age: `1${i}`,
        address: `00${i}`
      })
    }
    return (
      <div className="loadBalance layout-content">
        <div className="layout-content-btns">
          <Button type="primary" size="large" icon="plus">创建负载均衡</Button>
          <Button type="ghost" size="large"><i className='fa fa-refresh' /> 刷新</Button>
          <Button type="ghost" size="large" icon="delete">删除</Button>
          <SearchInput
            placeholder="请输入关键词搜索"
            size="large"
          />
          <Pagination
            simple
            className="page-box"
          />
        </div>
        <Table 
          className="loadBalanceTable reset_antd_table_header"
          rowSelection={rowSelection} 
          columns={columns}
          dataSource={data}
          pagination={false}
        />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    
  }
}

export default connect(mapStateToProps, {
  
})(LoadBalance)