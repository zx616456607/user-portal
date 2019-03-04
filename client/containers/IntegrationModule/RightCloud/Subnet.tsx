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
import { connect } from 'react-redux'
import { Table, Pagination, Spin, Button } from 'antd'
import './style/Subnet.less'
import * as rcIntegrationActions from '../../../actions/rightCloud/integration'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '../../../../constants'
import NotificationHandler from '../../../../src/components/Notification'
import { renderNetStatus } from './utils'
import Search from '../../../components/SearchInput'

const notify = new NotificationHandler()

const mapStateToProps = state => {
  const subnets = getDeepValue(state, [ 'rightCloud', 'subnets' ])
  const isFetching = getDeepValue(state, [ 'rightCloud', 'subnets', 'isFetching' ])
  const currentEnv = getDeepValue(state, ['rightCloud', 'currentEnv', 'currentEnv'])
  return {
    subnets,
    isFetching,
    currentEnv,
  }
}

@connect(mapStateToProps, {
  getSubnets: rcIntegrationActions.getSubnets,
})
export default class Subnet extends React.PureComponent {

  state = {
    current: DEFAULT_PAGE,
    nameLike: '',
  }

  componentDidMount() {
   this.loadData()
  }

/*  componentWillReceiveProps(nextProps) {
    const { currentEnv } = nextProps
    if (this.props.currentEnv !== currentEnv) {
      this.loadData(null, nextProps)
    }
  }*/

  loadData = async (query, props) => {
    const { current, nameLike } = this.state
    const { getSubnets, currentEnv, location } = props || this.props
    const { query: locationQuery } = location
    query = Object.assign({}, query, {
      pagesize: DEFAULT_PAGE_SIZE,
      pagenum: current - 1,
      cloudEnvId: currentEnv,
    })
    if (nameLike) {
      query.nameLike = nameLike
    }
    const vpcId = locationQuery && locationQuery.vpcId || currentEnv
    const result = await getSubnets(vpcId, query)
    if (result.error) {
      notify.warn('获取子网失败')
    }
  }

  handlePage = current => {
    this.setState({
      current,
    }, this.loadData)
  }

  renderStatus = status => {
    const { text, cls } = renderNetStatus(status)
    return <span className={cls}>{text}</span>
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

  render() {
    const { current, nameLike } = this.state
    const { isFetching, currentEnv, subnets } = this.props
    const { totalCount, data } = subnets || { totalCount: 0, data: [] }
    if (isFetching || !currentEnv) {
      return <div className="loadingBox">
        <Spin size="large" />
      </div>
    }
    const pagination = {
      simple: true,
      current,
      pageSize: DEFAULT_PAGE_SIZE,
      total: totalCount || 0,
      onChange: this.handlePage,
    }
    const columns = [{
      title: '名称',
      dataIndex: 'networkName',
    }, {
      title: '网络地址',
      dataIndex: 'cidr',
    }, {
      title: '网关',
      dataIndex: 'gateway',
    }, {
      title: '状态',
      dataIndex: 'status',
      render: this.renderStatus,
    }, {
      title: '可用 IP 数量',
      dataIndex: 'unused',
      render: (text, record) => currentEnv === 1457 ? record.totalIp - record.usedIp : text,
    }, {
      title: '描述',
      dataIndex: 'comments',
    }]
    return (
      <div className="layout-content subnet-manage">
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
