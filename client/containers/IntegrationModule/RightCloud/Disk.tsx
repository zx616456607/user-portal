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
import { connect } from 'react-redux'
import { Table, Pagination, Spin, Button } from 'antd'
import Ellipsis from '@tenx-ui/ellipsis/lib'
import './style/Disk.less'
import * as rcIntegrationActions from '../../../actions/rightCloud/integration'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '../../../../constants'
import NotificationHandler from '../../../../src/components/Notification'
import Search from '../../../components/SearchInput'

const notify = new NotificationHandler()

const mapStateToProps = state => {
  const volumes = getDeepValue(state, ['rightCloud', 'volumes', 'data'])
  const { isFetching } = state.rightCloud.volumes
  const currentEnv = getDeepValue(state, ['rightCloud', 'currentEnv', 'currentEnv'])
  return {
    volumes,
    isFetching,
    currentEnv,
  }
}

@connect(mapStateToProps, {
  volumeList: rcIntegrationActions.volumeList,
})
export default class Disk extends React.PureComponent {

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
    const { volumeList, currentEnv } = props || this.props
    query = Object.assign({}, query, {
      pagesize: DEFAULT_PAGE_SIZE,
      pagenum: current - 1,
      cloudEnvId: currentEnv,
    })
    if (nameLike) {
      query.nameLike = nameLike
    }
    const result = await volumeList(query)
    if (result.error) {
      notify.warn('获取磁盘列表失败')
    }
  }

  handlePage = current => {
    this.setState({
      current,
    }, this.loadData)
  }

  frontEndFilter = query => {
    const { volumes } = this.props
    const { data } = volumes
    const current = query.current || DEFAULT_PAGE
    const from = (current - 1) * DEFAULT_PAGE_SIZE
    const end = current * DEFAULT_PAGE_SIZE
    this.setState({
      current,
      filterData: data.slice(from, end),
    })
  }

  renderAttachments = data => {
    return (data || []).filter(item => item.instanceName)
      .map(item => {
        return <div key={item.instanceName} style={{ width: 200 }}>
          <Ellipsis>
            连接到 <span className="failedColor">{item.instanceName}</span> 的设备
            <span className="failedColor">{item.device}</span>
          </Ellipsis>
      </div>
    })
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

  renderStatus = status => {
    let text = ''
    let clsName = ''
    switch (status) {
      case 'creating':
        text = '创建中'
        break
      case 'setting':
        text = '配置中'
        break
      case 'recovering':
        text = '恢复中'
        clsName = 'successColor'
        break
      case 'normal':
        text = '正常'
        clsName = 'successColor'
        break
      case 'failure':
        text = '创建失败'
        clsName = 'failedColor'
        break
      case 'deleting':
        text = '销毁中'
        clsName = 'failedColor'
        break
      case 'deleted':
        text = '已删除'
        clsName = 'hintColor'
        break
      case 'modifying':
        text = '修改中'
        clsName = 'themeColor'
        break
      case 'error':
        text = '错误'
        clsName = 'failedColor'
        break
      default:
        break
    }
    return <span className={clsName}>{text}</span>
  }

  render() {
    const { current, nameLike } = this.state
    const { isFetching, currentEnv, volumes } = this.props
    const { totalCount, data } = volumes || { totalCount: 0, data: [] }
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
      width: '15%',
      render: name => <div style={{ width: 200 }}><Ellipsis>{name}</Ellipsis></div>,
    }, {
      title: '存储类型',
      dataIndex: 'volumeType',
      width: '8%',
    }, {
      title: '状态',
      dataIndex: 'status',
      width: '8%',
      render: this.renderStatus,
    }, {
      title: '大小',
      dataIndex: 'size',
      width: '8%',
      render: size => size + 'GB',
    }, {
      title: '挂载到',
      dataIndex: 'attachments',
      width: '20%',
      render: this.renderAttachments,
    }, {
      title: '硬盘属性',
      dataIndex: 'storagePurpose',
      width: '8%',
      render: _ => _ === '01' ? '系统盘' : '数据盘',
    },
      /*{
      title: '运行时长',
      dataIndex: 'startTime',
      width: '20%',
      render: (time, record) => formatDuration(time, record.endTime || new Date()),
    },*/
      {
      title: '描述',
      width: '8%',
      dataIndex: 'description',
    }]
    return (
      <div className="layout-content disk-manage">
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
