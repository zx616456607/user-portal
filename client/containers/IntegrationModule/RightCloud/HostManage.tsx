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
import { connect } from 'react-redux'
import { Button, Table, Pagination } from 'antd'
import Search from '../../../components/SearchInput'
import * as rcIntegrationActions from '../../../actions/rightCloud/integration'
import { getDeepValue } from '../../../util/util'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '../../../../constants'
import NotificationHandler from '../../../../src/components/Notification'

const notify = new NotificationHandler()

const mapStateToProps = state => {
  const hostList = getDeepValue(state, ['rightCloud', 'hostList', 'data'])
  const { isFetching } = state.rightCloud.hostList
  return {
    hosts: hostList || [],
    isFetching,
  }
}

@connect(mapStateToProps, {
  hostList: rcIntegrationActions.hostList,
})
export default class HostManage extends React.PureComponent {

  state = {
    current: DEFAULT_PAGE,
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = async query => {
    const { current, instanceNameLike } = this.state
    const { hostList } = this.props
    query = Object.assign({}, query, {
      pagesize: DEFAULT_PAGE_SIZE,
      pagenum: current - 1,
    })
    if (instanceNameLike) {
      query.instanceNameLike = instanceNameLike
    }
    const result = await hostList(query)
    if (result.error) {
      notify.warn('获取主机列表失败')
    }
  }

  searchChange = value => {
    this.setState({
      instanceNameLike: value,
    })
  }

  handlePage = current => {
    this.setState({
      pagenum: current,
    })
    this.loadData({ pagenum: current })
  }

  render() {
    const { current, instanceNameLike } = this.state
    const { hosts, isFetching } = this.props
    const pagination = {
      simple: true,
      current,
      pageSize: DEFAULT_PAGE_SIZE,
      total: hosts && hosts.length || 0,
      onChange: this.handlePage,
    }
    const columns = [{
      title: '主机列表',
      dataIndex: 'instanceName',
    }, {
      title: '状态',
      dataIndex: 'statusName',
    }, {
      title: '云环境',
      dataIndex: 'cloudEnvName',
    }, {
      title: 'IP 地址',
      dataIndex: 'innerIp',
    }, {
      title: '系统',
      dataIndex: 'platform',
    }, {
      title: 'CPU',
      dataIndex: 'cpu',
    }, {
      title: '内存',
      dataIndex: 'memory',
    }]
    return (
      <div className="layout-content">
        <div className="layout-content-btns">
          <Button size={'large'} type={'primary'} icon={'plus'}>创建主机</Button>
          <Button size={'large'} type={'ghost'}><i className="fa fa-refresh"/> 刷新</Button>
          <Search
            size={'large'}
            placeholder={'请输入关键词搜索'}
            onChange={this.searchChange}
            value={instanceNameLike}
            onSearch={this.loadData}
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
          dataSource={hosts}
          loading={isFetching}
        />
      </div>
    )
  }
}
