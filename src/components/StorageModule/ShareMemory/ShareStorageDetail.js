/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Share Storage Detail component
 *
 * v0.1 - 2017-9-13
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Card, Row, Col, Tabs } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/ShareStorageDetail.less'
import Title from '../../Title'
import storagePNG from '../../../assets/img/storage.png'
import { browserHistory } from 'react-router'
import StorageBind from '../StorageBind'

const TabPane = Tabs.TabPane

class ShareStorageDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  render() {
    return(
      <QueueAnim type="right">
        <Title title="存储详情"/>
        <div id='share_storage_detail' key="share_storage_detail">
          <div className="topRow">
              <span
                className="back"
                onClick={() => browserHistory.push(`/app_manage/storage`)}
              >
                <span className="backjia"></span>
                <span className="btn-back">返回</span>
              </span>
            <span className="title">存储详情</span>
          </div>
          <Card className='topCard'>
            <div className="imgBox">
              <img src={storagePNG} />
            </div>
            <div className="infoBox">
              <div className="appTitle">
                我是存储卷名称
              </div>
              <div className="info">
                <Row>
                  <Col span="9">
                    存储类型：独享型（RBD）
                  </Col>
                  <Col span="15">
                    <div className="createDate">
                      创建时间：2012-12-12
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span="9">
                    RBD集群名称：aaaaa
                  </Col>
                  <Col span="15">
                    <div className="use">
                      用量
                      ：100M
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
          <Card>
            <Tabs>
              <TabPane tab="绑定服务" key="service">
                <StorageBind />
              </TabPane>
              {/*<TabPane tab="租赁信息" key="rentInfo">*/}
              {/*租赁信息*/}
              {/*</TabPane>*/}
            </Tabs>
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProp(state, props) {

  return {

  }
}

export default connect(mapStateToProp, {

})(ShareStorageDetail)