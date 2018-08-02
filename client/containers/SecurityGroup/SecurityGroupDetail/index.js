/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * SecurityGroupDetail
 *
 * v0.1 - 2018-07-24
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Card } from 'antd'
import './style/index.less'
import DetailHeader from './DetailHeader'
import IsolatedObj from './IsolatedObj'
import WhiteList from './WhiteList'
import * as securityActions from '../../../actions/securityGroup'
import Notification from '../../../../src/components/Notification'

const notification = new Notification()
class SecurityGroupDetail extends React.Component {

  state={
    current: '',
  }
  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    const { params, getfSecurityGroupDetail, cluster } = this.props
    getfSecurityGroupDetail(cluster, params.name, {
      failed: {
        func: error => {
          const { message } = error
          notification.close()
          notification.warn('获取安全组数据出错', message.message)
        },
      },
    }).then(res => this.setState({
      current: res.response.result.data,
    }))
  }
  render() {
    const { current } = this.state
    return <div className="securityPageDetail">
      <QueueAnim className="detail">
        <DetailHeader key="securityDetail"
          current={current}
          loadData={this.loadData}/>
        <Card key="securityDetailCard">
          <p className="detailTitle">隔离对象</p>
          <IsolatedObj current={current} />
          <p className="detailTitle">隔离对象的访问白名单</p>
          <WhiteList type="ingress" current={current} />
          <div className="ingressDriver"></div>
          <WhiteList typpe="egress" current={current} />
        </Card>
      </QueueAnim>
    </div>
  }
}

const mapStateToProps = ({
  entities: { current },
  securityGroup: { getSecurityGroupList: { data, isFetching } },
}) => {
  const listData = []
  data && data.map(item => listData.push({
    name: item.metadata.annotations.policyName,
    target: item.spec.podSelector.matchExpressions
              && item.spec.podSelector.matchExpressions[0].values,
    time: item.metadata.creationTimestamp,
    key: item.metadata.name,
  }))
  return {
    cluster: current.cluster.clusterID,
    listData,
    isFetching,
  }
}

export default connect(mapStateToProps, {
  getfSecurityGroupDetail: securityActions.getfSecurityGroupDetail,
})(SecurityGroupDetail)
