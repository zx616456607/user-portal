/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Host manage
 *
 * @author zhangxuan
 * @date 2018-11-20
 */
import React from 'react'
import { Button, Table, Pagination } from 'antd'
import Search from '../../../components/SearchInput'

export default class HostManage extends React.PureComponent {

  state = {
    current: 0,
  }

  render() {
    const { current } = this.state
    const pagination = {
      simple: true,
      current,
      pageSize: 10,
      total: 10,
    }
    const data = []
    const columns = [{
      title: '主机列表',
    }, {
      title: '状态',
    }, {
      title: '云环境',
    }, {
      title: 'IP 地址',
    }, {
      title: '系统',
    }, {
      title: 'CPU',
    }, {
      title: '内存',
    }]
    return (
      <div className="layout-content">
        <div className="layout-content-btns">
          <Button size={'large'} type={'primary'} icon={'plus'}>创建主机</Button>
          <Button size={'large'} type={'ghost'}><i className="fa fa-refresh"/> 刷新</Button>
          <Search
            size={'large'}
            placeholder={'请输入关键词搜索'}
          />
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
