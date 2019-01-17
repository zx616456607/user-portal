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
import { connect } from 'react-redux'
import { Table, Pagination, Spin, Button } from 'antd'
import './style/Virtual.less'
import * as rcIntegrationActions from '../../../actions/rightCloud/integration'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '../../../../constants'
import NotificationHandler from '../../../../src/components/Notification'
import Search from '../../../components/SearchInput'

const notify = new NotificationHandler()

const mapStateToProps = state => {
  const virtualNetworks = getDeepValue(state, [ 'rightCloud', 'virtualNetworks', 'data' ])
  const isFetching = getDeepValue(state, [ 'rightCloud', 'virtualNetworks', 'isFetching' ])
  const currentEnv = getDeepValue(state, ['rightCloud', 'currentEnv', 'currentEnv'])
  return {
    virtualNetworks,
    isFetching,
    currentEnv,
  }
}

@connect(mapStateToProps, {
  getVirtualNetworks: rcIntegrationActions.getVirtualNetworks,
})
export default class VirtualNet extends React.PureComponent {

  state = {
    current: DEFAULT_PAGE,
    portGroupNameLike: '',
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
    const { current, portGroupNameLike } = this.state
    const { getVirtualNetworks, currentEnv } = props || this.props
    query = Object.assign({}, query, {
      pagesize: DEFAULT_PAGE_SIZE,
      pagenum: current - 1,
      cloudEnvId: currentEnv,
    })
    if (portGroupNameLike) {
      query.portGroupNameLike = portGroupNameLike
    }
    const result = await getVirtualNetworks(query)
    if (result.error) {
      notify.warn('获取虚拟网络失败')
    }
  }

  handlePage = current => {
    this.setState({
      current,
    }, this.loadData)
  }

  refreshData = () => {
    this.setState({
      portGroupNameLike: '',
    }, () => this.loadData({ current: 1 }))
  }

  searchChange = value => {
    this.setState({
      portGroupNameLike: value,
    })
  }

  render() {
    const { current, portGroupNameLike } = this.state
    const { isFetching, currentEnv, virtualNetworks } = this.props
    const { totalCount, data } = virtualNetworks || { totalCount: 0, data: [] }
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
      dataIndex: 'name',
    }, {
      title: '类型',
      dataIndex: 'type',
      render: text => text === 'INTERNAL' ? '内部网络' : '外部网络',
    }, {
      title: 'Vlan',
      dataIndex: 'vlanId',
    }, {
      title: 'Nic',
      dataIndex: 'nic',
    }, {
      title: '状态',
      dataIndex: 'status',
      render: text => <span className="successColor">{text === 'FREE' ? '可用' : '在用'}</span>,
    }]
    return (
      <div className="layout-content virtual-manage">
        <div className="layout-content-btns clearfix">
          <Button size={'large'} type={'ghost'} onClick={this.refreshData}><i className="fa fa-refresh"/> 刷新</Button>
          <Search
            size={'large'}
            placeholder={'请输入关键词搜索'}
            onChange={this.searchChange}
            value={portGroupNameLike}
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
