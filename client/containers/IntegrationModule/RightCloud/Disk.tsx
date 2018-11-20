/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Hard disk
 *
 * @author zhangxuan
 * @date 2018-11-20
 */
import React from 'react'
import { Table, Pagination } from 'antd'
import './style/Disk.less'

export default class Disk extends React.PureComponent {
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
      title: '存储类型',
    }, {
      title: '状态',
    }, {
      title: '大小',
    }, {
      title: '挂载到',
    }, {
      title: '硬盘属性',
    }, {
      title: '运行时长',
    }, {
      title: '描述',
    }]
    return (
      <div className="layout-content disk-manage">
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
