/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Host Storage Detail component
 *
 * v0.1 - 2017-9-13
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Card, Tabs, Input, Row, Col } from 'antd'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import Title from '../../Title'
import './style/HostStorageDetail.less'
import storagePNG from '../../../assets/img/storage.png'

const TabPane = Tabs.TabPane

class HostStorageDetail extends Component {
  constructor(props) {
    super(props)
    this.renderServiceList = this.renderServiceList.bind(this)
    this.state = {

    }
  }

  renderServiceList(){
    const arr = []
    for(let i = 0; i < 6; i++){
      let item = {
        service: 'adads',
        app: 'qwe',
        point: '/var/log',
        readOnly: true,
      }
      if(i%2 == 0){
        item.readOnly = false
      }
      arr.push(item)
    }
    return arr.map((item, index) => {
      return <Row key={`service${index}`} className='list_style'>
        <Col key={`${item.service}`} span="6">
          <div className='img_box'>
            picture
            {/*<img src="" alt="" className='img_style'/>*/}
          </div>
          服务：{item.service}
        </Col>
        <Col key={`${item.app}`} span="6">
          所属应用：{item.app}
        </Col>
        <Col key={`${item.point}`} span="6" className='point_style'>
          挂在点：{item.point}
        </Col>
        <Col key={`${item.readOnly}`} span="6">
          { item.readOnly ? <span>服务对存储只读</span> : <span>服务对存储可读可写</span> }
        </Col>
      </Row>
    })
  }

  render() {
    return(
      <QueueAnim type="right">
        <div id='host_storage_detail' key="host_storage_detail">
          <Title title="存储详情" />
          <div className="topRow">
              <span
                className="back"
                onClick={() => browserHistory.push(`/app_manage/storage/hostMemory`)}
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
                <div className='search_box'>
                  <Input
                    size="large"
                    placeholder="按服务名称搜索"
                  />
                  <i className="fa fa-search search_icon" aria-hidden="true"></i>
                </div>
                <div className='service_list'>
                  { this.renderServiceList() }
                </div>
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

})(HostStorageDetail)