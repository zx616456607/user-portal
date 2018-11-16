/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * notice group component
 *
 * v0.1 - 2018-10-16
 * @author BaiYu
 */

import React from 'react'
import { Table } from 'antd'

export default class Notice extends React.Component {

  render () {
    const { receivers } = this.props
    const columns = [{
      title: '联系方式',
      dataIndex: 'addr',
      width: 300,
    }, {
      title: '备注',
      dataIndex: 'desc',
    }];
    const telColumns = [{
      title: '联系方式',
      dataIndex: 'number',
      width: 300,
    }, {
      title: '备注',
      dataIndex: 'desc',
    }];

    return (
      <div className="Notice">
        <div className="titleName">邮箱</div>
        <div className="notice-body">
          <Table size="small" columns={columns} dataSource={receivers.email || []} pagination={false} />
        </div>
        <div className="titleName">手机号</div>
        <div className="notice-body">
          <Table size="small" columns={telColumns} dataSource={receivers.tel || []} pagination={false} />
        </div>
        <div className="br"></div>
      </div>
    )
  }
}