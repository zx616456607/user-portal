/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * notice group component
 *
 * v0.1 - 2018-10-16
 * @author BaiYu
 */

import React from 'react'
import { browserHistory } from 'react-router'
import { Card, Row, Col, Tabs } from 'antd'
import BindRule from './BindRule'
import Notice from './Notice'
import './style/Detail.less'
import noticeImg from '../../../assets/img/account/notice.png'

const TabPane = Tabs.TabPane

export default class GroupDetail extends React.Component {

  render() {
    const { params } = this.props
    return (
      <div id="groupDetail">
        <div className="detailTop">
          <span className="back" onClick={()=> browserHistory.push('/account/noticeGroup')}><span className="backjia"></span><span className="btn-back">返回</span></span>
          <span className="titleName">{params.name}</span>
        </div>
        <div className="detailContent">
          <div className="br"></div>
          <Card>
            <Row>
              <Col span={3}>
                <img src={noticeImg} />
              </Col>
              <Col span={7}>
                <div className="rowTitle">邮箱：3个</div>
                <div>
                  创建时间：2018-07-09：15：56：34
                </div>
              </Col>
              <Col span={7}>
                <div className="rowTitle">手机：2个</div>
                <div>描述：我是一个test</div>
              </Col>
              <Col span={7}>钉钉：1个</Col>
            </Row>
          </Card>
          <div className="br"></div>
          <Card>
            <Tabs defaultActiveKey="1">
              <TabPane key="1" tab="已绑定策略">
                <BindRule />
              </TabPane>
              <TabPane key='2' tab="通知方式">
                <Notice />
              </TabPane>
            </Tabs>
          </Card>

        </div>
      </div>
    )
  }

}