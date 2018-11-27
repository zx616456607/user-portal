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
import { Table, Pagination, Spin } from 'antd'
import './style/Disk.less'
import * as rcIntegrationActions from '../../../actions/rightCloud/integration'
import { getDeepValue } from '../../../util/util'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '../../../../constants'
import NotificationHandler from '../../../../src/components/Notification'

const notify = new NotificationHandler()

const mapStateToProps = state => {
  const volumes = getDeepValue(state, ['rightCloud', 'volumes', 'data'])
  const { isFetching } = state.rightCloud.volumes
  const currentEnv = getDeepValue(state, ['rightCloud', 'envs', 'currentEnv'])
  return {
    volumes: volumes || [],
    isFetching,
    currentEnv: currentEnv || '1442',
  }
}

@connect(mapStateToProps, {
  volumeList: rcIntegrationActions.volumeList,
})
export default class Disk extends React.PureComponent {

  state = {
    current: DEFAULT_PAGE,
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = async query => {
    const { current } = this.state
    const { volumeList, currentEnv } = this.props
    query = Object.assign({}, query, {
      pagesize: DEFAULT_PAGE_SIZE,
      pagenum: current - 1,
      envId: currentEnv,
    })
    const result = await volumeList(query)
    if (result.error) {
      notify.warn('获取磁盘列表失败')
    }
  }

  render() {
    const { volumes, isFetching, currentEnv } = this.props
    if (isFetching || !currentEnv) {
      return <div className="loadingBox">
        <Spin size="large" />
      </div>
    }
    const pagination = {
      simple: true,
      pageSize: DEFAULT_PAGE_SIZE,
      total: volumes && volumes.length || 0,
    }
    const columns = [{
      title: '名称',
      dataIndex: 'name',
    }, {
      title: '存储类型',
      dataIndex: 'volumeType',
    }, {
      title: '状态',
      dataIndex: 'status',
    }, {
      title: '大小',
      dataIndex: 'size',
    }, {
      title: '挂载到',
      dataIndex: 'device',
    }, {
      title: '硬盘属性',
    }, {
      title: '运行时长',
    }, {
      title: '描述',
      dataIndex: 'description',
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
          dataSource={volumes}
          loading={isFetching}
        />
      </div>
    )
  }
}
