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
    const columns = [{
      title: '联系方式',
      dataIndex: 'name',
      width: 150,
    }, {
      title: '备注',
      dataIndex: 'notice',
    }];

    const data = [];
    for (let i = 0; i < 5; i++) {
      data.push({
        key: i,
        name: `李大嘴${i}`,
        notice: `西湖区湖底公园${i}号`,
      });
    }
    return (
      <div className="Notice">
        <div className="titleName">邮箱</div>
        <div className="notice-body">
          <Table size="small" columns={columns} dataSource={data} pagination={false} />
        </div>
        <div className="br"></div>
        <div className="br"></div>
        <div className="titleName">手机号</div>
        <div className="notice-body">
          <Table size="small" columns={columns} dataSource={data} pagination={false} />
        </div>
        <div className="br"></div>
      </div>
    )
  }
}