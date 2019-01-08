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
import isEmpty from 'lodash/isEmpty'
import Search from '../../../components/SearchInput'
import * as rcIntegrationActions from '../../../actions/rightCloud/integration'
import { getDeepValue } from '../../../util/util'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '../../../../constants'
import NotificationHandler from '../../../../src/components/Notification'
import './style/Host.less'

const notify = new NotificationHandler()

const mapStateToProps = state => {
  const envs = getDeepValue(state, ['rightCloud', 'envs', 'data', 'data'])
  const hostList = getDeepValue(state, ['rightCloud', 'hostList', 'data'])
  const currentEnv = getDeepValue(state, ['rightCloud', 'currentEnv', 'currentEnv'])
  const { isFetching } = state.rightCloud.hostList
  return {
    envs,
    hosts: hostList,
    isFetching,
    currentEnv,
  }
}

@connect(mapStateToProps, {
  hostList: rcIntegrationActions.hostList,
})
export default class HostManage extends React.PureComponent {

  state = {
    current: DEFAULT_PAGE,
    instanceNameLike: '',
  }

  componentDidMount() {
    this.loadData()
  }

  componentWillReceiveProps(nextProps) {
    const { currentEnv } = nextProps
    if (currentEnv !== this.props.currentEnv) {
      this.loadData(null, nextProps)
    }
  }

  loadData = async (query, props) => {
    const { current, instanceNameLike } = this.state
    const { hostList, currentEnv } = props || this.props
    query = Object.assign({}, query, {
      pagesize: DEFAULT_PAGE_SIZE,
      pagenum: current - 1,
      cloudEnvId: currentEnv,
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
      current,
    }, this.loadData)
  }

  refreshData = () => {
    this.setState({
      instanceNameLike: '',
    }, () => this.loadData({ current: 1 }))
  }

  renderStatus = status => {
    let clsName = ''
    let statusName = ''
    switch (status) {
      case 'pending':
        statusName = '待创建'
        clsName = 'themeColor'
        break
      case 'setting':
        statusName = '配置中'
        clsName = 'themeColor'
        break
      case 'creating':
        statusName = '创建中'
        clsName = 'themeColor'
        break
      case 'starting':
        statusName = '启动中'
        clsName = 'successColor'
        break
      case 'running':
        statusName = '正常'
        clsName = 'successColor'
        break
      case 'stopping':
        statusName = '停止中'
        clsName = 'failedColor'
        break
      case 'stopped':
        statusName = '已停止'
        clsName = 'failedColor'
        break
      case 'deleting':
        statusName = '删除中'
        clsName = 'failedColor'
        break
      case 'create_failure':
        statusName = '创建失败'
        clsName = 'failedColor'
        break
      case 'failure':
        statusName = '异常'
        clsName = 'failedColor'
        break
      case 'deleted':
        statusName = '已删除'
        clsName = 'failedColor'
        break
      case 'suspended':
        statusName = '已挂起'
        break
      case 'expired':
        statusName = '已过期'
        clsName = 'hintColor'
        break
      default:
        break
    }
    return <span className={clsName}>{statusName}</span>
  }

  renderCloudEnvName = envId => {
    const { envs } = this.props
    if (isEmpty(envs)) {
      return envs
    }
    const currentEnv = envs.filter(item => item.id === envId)[0]
    return currentEnv.cloudEnvName
  }

  render() {
    const { current, instanceNameLike } = this.state
    const { isFetching, hosts } = this.props
    const { totalCount, data } = hosts || { totalCount: 0, data: [] }
    const pagination = {
      simple: true,
      current,
      pageSize: DEFAULT_PAGE_SIZE,
      total: totalCount || 0,
      onChange: this.handlePage,
    }
    const columns = [{
      title: '主机列表',
      dataIndex: 'instanceName',
      width: '30%',
    }, {
      title: '状态',
      dataIndex: 'status',
      width: '10%',
      render: (status, record) => this.renderStatus(status, record),
    }, {
      title: '云环境',
      dataIndex: 'cloudEnvId',
      width: '10%',
      render: this.renderCloudEnvName,
    }, {
      title: 'IP 地址',
      dataIndex: 'innerIp',
      width: '10%',
    }, {
      title: '系统',
      dataIndex: 'osCategory',
      width: '10%',
    }, {
      title: 'CPU',
      dataIndex: 'cpu',
      width: '10%',
    }, {
      title: '内存',
      dataIndex: 'memory',
      width: '10%',
    }]
    return (
      <div className="host-manage layout-content">
        <div className="layout-content-btns">
          {/*<Button size={'large'} type={'primary'} icon={'plus'}>创建主机</Button>*/}
          <Button size={'large'} type={'ghost'} onClick={this.refreshData}><i className="fa fa-refresh"/> 刷新</Button>
          <Search
            size={'large'}
            placeholder={'请输入关键词搜索'}
            onChange={this.searchChange}
            value={instanceNameLike}
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
