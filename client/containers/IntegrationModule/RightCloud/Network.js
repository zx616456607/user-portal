/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Network
 *
 * v0.1 - 2019-01-04
 * @author zhangxuan
 */
import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { Table, Pagination, Spin, Button } from 'antd'
import './style/Network.less'
import * as rcIntegrationActions from '../../../actions/rightCloud/integration'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '../../../../constants'
import NotificationHandler from '../../../../src/components/Notification'
import { formatDate } from '../../../../src/common/tools'
import { renderNetStatus } from './utils'
import Search from '../../../components/SearchInput'

const notify = new NotificationHandler()

const mapStateToProps = state => {
  const networks = getDeepValue(state, [ 'rightCloud', 'networks' ])
  const isFetching = getDeepValue(state, [ 'rightCloud', 'networks', 'isFetching' ])
  const currentEnv = getDeepValue(state, [ 'rightCloud', 'currentEnv', 'currentEnv' ])
  return {
    networks,
    isFetching,
    currentEnv,
  }
}
@connect(mapStateToProps, {
  getNetWorks: rcIntegrationActions.getNetWorks,
})
export default class Network extends React.PureComponent {

  state = {
    current: DEFAULT_PAGE,
    nameLike: '',
  }

  componentDidMount() {
    this.loadData()
  }

  componentWillReceiveProps(nextProps) {
    const { currentEnv } = nextProps
    if (this.props.currentEnv !== currentEnv) {
      this.loadData(null, nextProps)
    }
  }

  loadData = async (query, props) => {
    const { current, nameLike } = this.state
    const { getNetWorks, currentEnv } = props || this.props
    query = Object.assign({}, query, {
      pagesize: DEFAULT_PAGE_SIZE,
      pagenum: current - 1,
    })
    if (nameLike) {
      query.nameLike = nameLike
    }
    const result = await getNetWorks(currentEnv, query)
    if (result.error) {
      notify.warn('获取网络失败')
    }
  }

  handlePage = current => {
    this.setState({
      current,
    }, this.loadData)
  }

  refreshData = () => {
    this.setState({
      nameLike: '',
    }, () => this.loadData({ current: 1 }))
  }

  searchChange = value => {
    this.setState({
      nameLike: value,
    })
  }

  toSubnets = record => {
    browserHistory.push(`/cluster/integration/rightCloud/env/subnet?vpcId=${record.id}`)
  }

  renderStatus = status => {
    const { text, cls } = renderNetStatus(status)
    return <span className={cls}>{text}</span>
  }

  render() {
    const { current, nameLike } = this.state
    const { isFetching, currentEnv, networks } = this.props
    const { totalCount, data } = networks || { totalCount: 0, data: [] }
    if (isFetching || !currentEnv) {
      return <div className="loadingBox">
        <Spin size="large" />
      </div>
    }
    const columns = [{
      title: '名称',
      dataIndex: 'name',
      render: (text, record) =>
        <span className="pointer themeColor" onClick={() => this.toSubnets(record)}>{text}</span>,
    }, {
      title: '网段',
      dataIndex: 'cidr',
    }, {
      title: '状态',
      dataIndex: 'status',
      render: this.renderStatus,
    }, {
      title: '修改日期',
      dataIndex: 'updatedDt',
      render: text => formatDate(text),
    }, {
      title: '描述',
      dataIndex: 'description',
    }]
    const pagination = {
      simple: true,
      current,
      pageSize: DEFAULT_PAGE_SIZE,
      total: totalCount || 0,
      onChange: this.handlePage,
    }
    return (
      <div className="network-manage">
        <div className="layout-content-btns clearfix">
          <Button size={'large'} type={'ghost'} onClick={this.refreshData}><i className="fa fa-refresh"/> 刷新</Button>
          <Search
            size={'large'}
            placeholder={'请输入关键词搜索'}
            onChange={this.searchChange}
            value={nameLike}
            onSearch={this.loadData}
          />
          <div className="page-box">
            <span className="total">共计 {totalCount} 条</span>
            <Pagination {...pagination}/>
          </div>
        </div>
        <Table
          className={'reset_antd_table_header'}
          pagination={false}
          columns={columns}
          dataSource={data}
          loading={isFetching}
        />
      </div>
    )
  }
}
