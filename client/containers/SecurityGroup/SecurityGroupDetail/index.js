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
import QueueAnim from 'rc-queue-anim'
import { Card } from 'antd'
import './style/index.less'
import DetailHeader from './DetailHeader'
import IsolatedObj from './IsolatedObj'
import WhiteList from './WhiteList'
class SecurityGroupDetail extends React.Component {
  render() {
    return <div className="securityPageDetail">
      <QueueAnim className="detail">
        <DetailHeader key="securityDetail"/>
        <Card key="secutiryDetailcard">
          <p className="detailTitle">隔离对象</p>
          <IsolatedObj />
          <p className="detailTitle">隔离对象的访问白名单</p>
          <WhiteList type="ingress" />
          <div className="ingressDriver"></div>
          <WhiteList typpe="egress" />
        </Card>
      </QueueAnim>
    </div>
  }
}
export default SecurityGroupDetail
