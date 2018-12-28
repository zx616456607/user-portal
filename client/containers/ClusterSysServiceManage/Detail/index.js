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
import { browserHistory } from 'react-router'
import ReturnButton from '@tenx-ui/return-button/lib'
import QueueAnmi from 'rc-queue-anim'
import './style/index.less'
import Title from '../../../../src/components/Title'
import { Card } from 'antd'
import TenxIcon from '@tenx-ui/icon/es/_old'
import DetailTabs from './Tabs'

class ClusterSysServiceManageDetail extends React.PureComponent {
  returnSysServiceManage = () => browserHistory.replace(`/cluster?clusterID=${this.props.location.query.clusterID}&from=sysServiceManageDetail`)

  render() {
    return (
      <QueueAnmi className="clusterSysServiceManageDetail">
        <div key="rtn">
          <Title title="系统服务详情"/>
          <ReturnButton onClick={this.returnSysServiceManage}>返回</ReturnButton>
          <span className="first-title rtnBtn">系统服务详情</span>
        </div>
        <Card className="baseInfo" key="baseInfo">
          <TenxIcon className="leftIcon" type="AppsO" size={60} />
          <div className="right">
            <div className="name">monitor</div>
            <div className="status">
              <span>状态:</span>
              <span>
                <TenxIcon type="Circle"/>
                正常
              </span>
            </div>
            <div className="detail">详情: 应用运行正常</div>
          </div>
        </Card>
        <DetailTabs key="tabs" {...this.props}/>
      </QueueAnmi>
    )
  }
}

export default ClusterSysServiceManageDetail
