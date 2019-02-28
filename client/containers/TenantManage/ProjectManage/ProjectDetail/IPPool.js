/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 *
 * ipPool
 *
 * v0.1 - 2019-02-15
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import * as IPPoolActions from '../../../../actions/ipPool'
import { Table, Button, Select, Icon, Tooltip } from 'antd'
import Notification from '../../../../../src/components/Notification'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { ip4ToInt } from '../../../../../kubernetes/ip'
import isCidr from 'is-cidr'

const notification = new Notification()

class IPPoolPage extends React.Component {

  state = {
    selectedCluster: undefined,
    isMacvaln: false,
  }

  componentDidMount() {
    const { clusterList } = this.props
    const { selectedCluster } = this.state
    if (!selectedCluster && clusterList && clusterList.length) {
      this.onChangeCluster(clusterList[0].clusterID)
    }
  }

  loadData = () => {
    const { selectedCluster } = this.state
    const { clusterList, getIPPoolList } = this.props
    clusterList.forEach(item => {
      if (item.clusterID === selectedCluster && item.networkType === 'macvlan') {
        this.loadMacvlanAssignment()
      } else {
        // calico
        getIPPoolList(selectedCluster, { version: 'v1' })
      }
    })
  }

  loadMacvlanAssignment = () => {
    const { selectedCluster } = this.state
    const { getIPAssignment, projectDetail: { namespace } } = this.props
    const query = {
      project: namespace,
    }
    getIPAssignment(selectedCluster, query, {
      failed: {
        func: error => {
          const { statusCode } = error
          if (statusCode !== 401) {
            notification.warn('获取项目地址池失败')
          }
        },
      },
    })
  }

  onChangeCluster = selectedCluster => {
    const { clusterList } = this.props
    clusterList.forEach(item => {
      if (item.clusterID === selectedCluster) {
        this.setState({
          selectedCluster,
          isMacvaln: item.networkType === 'macvlan',
        }, this.loadData)
      }
    })
  }

  showCluster = () => {
    const { selectedCluster } = this.state
    const { clusterList } = this.props
    let clusterName
    clusterList.forEach(item => {
      if (item.clusterID === selectedCluster) clusterName = item.clusterName
    })
    return clusterName
  }

  computedIPNum = row => {
    const { begin, end } = row.spec
    const beginInt = ip4ToInt(begin)
    const endInt = ip4ToInt(end)
    return endInt - beginInt + 1
  }
  dealWith = value => {
    if (!value) return '--'
    const isIPV4 = isCidr.v4(value)
    const mask = value.split('/')[1]
    if (isIPV4) {
      return <span>{Math.pow(2, 32 - mask)}</span>
    }
    const isIPV6 = isCidr.v6(value)
    if (isIPV6) {
      return <span>{Math.pow(2, 128 - mask)}</span>
    }
  }
  render() {
    const { isFetching, listData, clusterList, calicoPool } = this.props
    const { selectedCluster, isMacvaln } = this.state
    const column = [
      {
        title: '授权集群',
        key: 'spec.cluster',
        dataIndex: 'spec.cluster',
        width: '20%',
        render: this.showCluster,
      }, {
        title: '网络模式',
        key: 'spec.project.namespace',
        dataIndex: 'spec.project.namespace',
        width: '20%',
        render: () => 'macvlan',
      }, {
        title: '地址池名称',
        key: 'metadata.name',
        dataIndex: 'metadata.name',
        width: '20%',
        render: (text, record) => {
          const isDefault = record.spec.default
          return <div>
            {text}&nbsp;&nbsp;
            {isDefault && <Tooltip title="默认" >
              <Icon type="exclamation-circle" />
            </Tooltip>
            }
          </div>
        },
      }, {
        title: 'IP 地址池（Macvlan 为起始-结束）',
        key: 'ip',
        dataIndex: 'ip',
        width: '25%',
        render: (text, record) => `${record.spec.begin} - ${record.spec.end}`,
      }, {
        title: 'IP 数',
        key: 'sum',
        dataIndex: 'sum',
        width: '15%',
        render: (text, record) => this.computedIPNum(record),
      },
    ]
    const calicoCol = [
      {
        title: '授权集群',
        key: 'spec.cluster',
        dataIndex: 'spec.cluster',
        width: '20%',
        render: this.showCluster,
      }, {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
        width: '20%',
      }, {
        title: '网络模式',
        key: 'mode',
        dataIndex: 'mode',
        width: '20%',
        render: () => 'calico',
      }, {
        title: 'IP 地址池',
        key: 'cidr',
        dataIndex: 'cidr',
        width: '20%',
      }, {
        title: 'IP 数',
        key: 'num',
        dataIndex: 'num',
        width: '20%',
        render: (text, record) => this.dealWith(record.cidr),
      },
    ]
    return <div style={{ padding: 24, paddingTop: 0 }}>
      <div>
        集群:&nbsp;&nbsp;
        <Select
          style={{ minWidth: 120 }}
          value={selectedCluster}
          onChange={v => this.onChangeCluster(v)}
        >
          {
            clusterList.map(v => <Select.Option
              value={v.clusterID}
              key={v.clusterID}
            >
              {v.clusterName}
            </Select.Option>)
          }
        </Select>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Button
          type="primary"
          onClick={this.loadData}
        >
          刷新
        </Button>
      </div>
      <Table
        className="reset_antd_table_header"
        columns={ isMacvaln ? column : calicoCol}
        dataSource={ isMacvaln ? listData : calicoPool.data}
        loading={ isMacvaln ? isFetching : calicoPool.isFetching}
        pagination={false}
      />
    </div>
  }
}

const mapStateToProps = ({
  ipPool: { ipAssignmentList, getIPPoolList },
  projectAuthority: { projectClusterList },
}, { projectDetail }) => {
  let clusterList = getDeepValue(projectClusterList, [ projectDetail.namespace, 'data' ]) || []
  clusterList = clusterList.filter(item => item.status === 2)
  return {
    isFetching: ipAssignmentList.isFetching || false,
    listData: ipAssignmentList.data || [],
    clusterList,
    calicoPool: getIPPoolList || {},
  }
}

export default connect(mapStateToProps, {
  getIPAssignment: IPPoolActions.getIPAssignment,
  getIPPoolList: IPPoolActions.getIPPoolList,
})(IPPoolPage)

