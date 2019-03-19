/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * ClusterSysServiceManage Container
 *
 * @author Songsz
 * @date 2018-12-20
 *
*/

import React from 'react'
import { Card, Button, Spin } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import AlarmCard from './AlarmCard'
import { getSysList } from '../../actions/sysServiceManage'
import { connect } from 'react-redux'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import sortBy from 'lodash/sortBy'

const mapState = state => ({
  serviceList: getDeepValue(state, 'sysServiceManage.services.data'.split('.')) || {},
  isFetching: getDeepValue(state, 'sysServiceManage.services.isFetching'.split('.')),
})

@connect(mapState, { getSysList })
class ClusterSysServiceManage extends React.Component {
  async componentDidMount() {
    this.refresh()
  }
  refresh = () => {
    this.props.clusterID && this.props.getSysList(this.props.clusterID)
  }
  getTypes = list => {
    const baseArr = []
    const netArr = []
    const metricArr = []
    const logArr = []
    const otherArr = []
    const metric = [ 'kube-state-metrics', 'metrics-server', 'node-exporter', 'alertmanager', 'custom-metrics-apiserver',
      'elastalert', 'prometheus', 'grafana' ]
    const net = [ 'calico-node', 'kube-proxy', 'service-proxy', 'kube-dns', 'coredns', 'kube-dns-autoscaler', 'kubectl', 'kube-controller' ]
    const log = [ 'fluentd-elk', 'elasticsearch-logging', 'kibana' ]
    list.map(l => {
      if (l.type === 'Pod') {
        return baseArr.push(l)
      }
      if (metric.includes(l.name)) {
        return metricArr.push(l)
      }
      if (net.includes(l.name)) {
        return netArr.push(l)
      }
      if (log.includes(l.name)) {
        return logArr.push(l)
      }
      return otherArr.push(l)
    })
    return ([
      { name: 'Kubernetes 基础组件', list: baseArr },
      { name: '网络组件', list: netArr },
      { name: '监控组件', list: metricArr },
      { name: '日志组件', list: logArr },
      { name: '其他组件', list: otherArr },
    ])
  }
  render() {
    const { clusterID, isFetching } = this.props
    const list = this.props.serviceList[clusterID] || []
    return (
      <QueueAnim>
        <Card key="card" className="clusterSysServiceManage">
          <div className="actions">
            {/* <Tooltip title="全局告警：下面列表中任意一个组件状态异常，将会触发告警">
              <Button size="large" className="alarmBtn" icon="notification" type="primary">全局告警</Button>
            </Tooltip>*/}
            <Button onClick={this.refresh} size="large"><i className="fa fa-refresh" />&nbsp;&nbsp;刷新</Button>
          </div>
          <Spin spinning={list && isFetching}>
            {
              this.getTypes(list).map((t, i) => (
                <div key={i}>
                  <div className="title">{t.name}</div>
                  <div className="cards">
                    {sortBy(t.list, o => o.name).map((item, i) =>
                      <AlarmCard data={item} clusterID={clusterID} key={i}/>
                    )}
                  </div>
                </div>
              ))
            }
          </Spin>
        </Card>
      </QueueAnim>
    )
  }
}

export default ClusterSysServiceManage
