/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Virtual network
 *
 * @author zhangxuan
 * @date 2018-11-20
 */
import React from 'react'
import { Table, Pagination } from 'antd'
import './style/Virtual.less'

export default class VirtualNet extends React.PureComponent {
  render() {
    const pagination = {
      simple: true,
      pageSize: 10,
      total: 10,
    }
    const data = []
    const columns = [{
      title: '名称',
    }, {
      title: '类型',
    }, {
      title: 'Vlan',
    }, {
      title: 'Nic',
    }, {
      title: '状态',
    }]
    return (
      <div className="layout-content virtual-manage">
        <div className="layout-content-btns clearfix">
          <div className="page-box">
            <span className="total">共计 10 条</span>
            <Pagination {...pagination}/>
          </div>
        </div>
        <Table
          className={'reset_antd_table_header'}
          pagination={false}
          columns={columns}
          dataSource={data}
        />
      </div>
    )
  }
}
