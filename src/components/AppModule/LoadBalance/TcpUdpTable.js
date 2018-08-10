/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Tcp and udp monitor table
 *
 * @author zhangxuan
 * @date 2018-08-01
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Table, Button, Pagination } from 'antd'
import TenxPage from '@tenx-ui/page'

export default class TcpUdpTable extends React.PureComponent{
  static propTypes = {
    type: PropTypes.oneOf(['TCP', 'UDP']).isRequired,
  }
  render() {
    const { type, togglePart } = this.props
    const pagination = {
      simple: true,
      total: 10,
      pageSize: 5,
      current: 1,
      // onChange: this.handlePage
    }
    const columns = [
      {
        title: '监听端口',
        dataIndex: 'monitorPort',
        width: '25%',
      },
      {
        title: '后端服务',
        dataIndex: 'serviceName',
        width: '25%',
      },
      {
        title: '服务端口',
        dataIndex: 'port',
        width: '25%',
      },
      {
        title: '操作',
        width: '25%',
        render: (text, row) =>
          <div>
            <Button type="primary" className="editBtn" onClick={() => togglePart(false, row, type)}>编辑</Button>
            <Button type="ghost">删除</Button>
          </div>
      }
    ]
    const data = [{
      monitorPort: 233,
      serviceName: 'hahaha',
      port: '8080'
    }]
    return (
      <TenxPage inner>
        <div className="layout-content-btns">
          <Button type="primary" size="large" icon="plus" onClick={() => togglePart(false, null, type)}>
            {`创建 ${type} 监听`}
          </Button>
          <div className="page-box">
            <span className="total">共计 10 条</span>
            <Pagination {...pagination}/>
          </div>
        </div>
        <Table
          className="reset_antd_table_header"
          columns={columns}
          dataSource={data}
          pagination={false}
        />
      </TenxPage>
    )
  }
}
