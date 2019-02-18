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
import { connect } from 'react-redux'
import { loadNotifyGroups } from '../../../actions/alert'
import { formatDate } from '../../../common/tools'

const TabPane = Tabs.TabPane

class GroupDetail extends React.Component {
  state = {
    data: {
      receivers:{}
    }
  }

  componentWillMount() {
    const { cluster, location } = this.props
    const { query } = location
    this.props.loadNotifyGroups({id: query.id}, cluster.clusterID, {
      success: {
        func: (res) => {
          if (res.data.length) {
            this.setState({data: res.data[0]})
          }
        }
      }
    })
  }

  render() {
    const { params } = this.props
    const { data } = this.state
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
                <div className="rowTitle">邮箱：{data.receivers.email ? data.receivers.email.length : 0} 个</div>
                <div>
                  创建时间：{formatDate(data.createTime)}
                </div>
              </Col>
              <Col span={7}>
                <div className="rowTitle">手机：{data.receivers.tel ? data.receivers.tel.length : 0} 个</div>
                <div>描述：{data.desc}</div>
              </Col>
              <Col span={7} className="rowTitle">钉钉：{data.receivers.ding ? data.receivers.ding.length : 0} 个</Col>
            </Row>
          </Card>
          <div className="br"></div>
          <Card>
            <Tabs defaultActiveKey="1">
              <TabPane key="1" tab="已绑定策略">
                <BindRule strategies={data.strategies || []} autoStrategies={data.autoScaleStrategies || []}/>
              </TabPane>
              <TabPane key='2' tab="通知方式">
                <Notice receivers={data.receivers} />
              </TabPane>
            </Tabs>
          </Card>

        </div>
      </div>
    )
  }

}

function mapStatetoProps(state) {

  const { current } = state.entities
  const { cluster } = current
  return {
    cluster
  }

}

export default connect(mapStatetoProps,{
  loadNotifyGroups
})(GroupDetail)
