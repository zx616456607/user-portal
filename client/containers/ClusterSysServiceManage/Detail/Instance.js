/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * serviceInstance of SysServiceManageDetail
 *
 * @author Songsz
 * @date 2018-12-24
 *
*/

import React from 'react'
import { connect } from 'react-redux'
import { sysServiceInstance } from '../../../actions/sysServiceManage'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { Table } from 'antd'
import ContainerStatus from '../../../../src/components/TenxStatus/ContainerStatus.js'
import './style/instance.less'

@connect(() => ({}), {
  sysServiceInstance,
})
export default class Instance extends React.PureComponent {
  state = {
    list: [],
  }
  async componentDidMount() {
    const { type, name, clusterID } = this.props
    const res = await this.props.sysServiceInstance(clusterID, type, name,
      { failed: { func: () => {} } })
    if (type !== 'Pod') {
      const { statusCode, data } = getDeepValue(res, 'response.result'.split('.')) || {}
      if (statusCode === 200 && data) {
        this.setState({
          list: data.items || [],
        })
      }
      return
    }
    const { cluster, data } = getDeepValue(res, 'response.result'.split('.')) || {}
    if (cluster && data) {
      this.setState({
        list: [ data ],
      })
    }
  }
  getTableColumn = () => [
    {
      title: '服务实例',
      key: 'name',
      render: data => <div>
        {
          data.metadata.name
        }
      </div>,
    },
    {
      title: '状态',
      key: 'status',
      render: data => <ContainerStatus container={data}/>,
    },
    {
      title: '所属节点',
      key: 'nodeName',
      render: data => data.spec.nodeName,
    },
  ]

  render() {
    return (
      <div className="clusterSysServiceManageInstance">
        <Table
          columns={this.getTableColumn()}
          dataSource={this.state.list}
          onChange={this.handleTableChange}
          pagination={false}
        />
      </div>

    )
  }
}
