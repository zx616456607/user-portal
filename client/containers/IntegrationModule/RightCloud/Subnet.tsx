/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Subnet
 *
 * @author zhangxuan
 * @date 2018-11-20
 */
import React from 'react'
import { Table, Pagination } from 'antd'
import './style/Subnet.less'

export default class Subnet extends React.PureComponent {
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
      title: '网络地址',
    }, {
      title: '网关',
    }, {
      title: '状态',
    }, {
      title: 'IP 地址',
    }, {
      title: '可用 IP 地址',
    }, {
      title: '描述',
    }]
    return (
      <div className="layout-content subnet-manage">
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
