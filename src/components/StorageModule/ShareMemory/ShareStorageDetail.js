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
import { Card, Row, Col, Tabs, Spin } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/ShareStorageDetail.less'
import Title from '../../Title'
import storagePNG from '../../../assets/img/storage.png'
import { browserHistory } from 'react-router'
import { loadStorageInfo } from '../../../actions/storage'
import { formatDate } from '../../../common/tools'
import MountServiceList from '../MountServiceList'

const TabPane = Tabs.TabPane

class ShareStorageDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentWillMount() {
    const { loadStorageInfo, params } = this.props
    loadStorageInfo(params.cluster, params.share_name)
  }

  render() {
    const { StorageInfo, isFetching, params, cluster } = this.props
    if (isFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large"></Spin>
        </div>
      )
    }
    const clusterID = cluster.clusterID
    const volumeName = params.share_name
    return(
      <QueueAnim type="right">
        <Title title="存储详情"/>
        <div id='share_storage_detail' key="share_storage_detail">
          <div className="topRow">
              <span
                className="back"
                onClick={() => browserHistory.push(`/app_manage/storage/shareMemory`)}
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
                { StorageInfo.volumeName }
              </div>
              <div className="info">
                <Row>
                  <Col span="9">
                    存储类型：共享型（nfs）
                  </Col>
                  <Col span="15">
                    <div className="createDate">
                      创建时间：{ formatDate(StorageInfo.createTime) }
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span="9">
                    存储server：{ StorageInfo.storageServer }
                  </Col>
                  <Col span="15">
                    <div className="use">
                      总量
                      ：{ parseInt(StorageInfo.size) }M
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
          <Card>
            <Tabs>
              <TabPane tab="绑定服务" key="service">
                <MountServiceList
                  clusterID={clusterID}
                  volumeName={volumeName}
                  query={null}
                />
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
  const { entities, storage } = state
  const { cluster } = state.entities.current
  const defaultInfo = {
    imagePool: props.params.pool,
    volumeName: props.params.storage_name,
    cluster: cluster.clusterID
  }
  const StorageInfo  = state.storage.storageDetail.StorageInfo || defaultInfo

  return {
    cluster,
    isFetching: state.storage.storageDetail.isFetching,
    StorageInfo,
    resourcePrice: cluster.resourcePrice
  }
}

export default connect(mapStateToProp, {
  loadStorageInfo,
})(ShareStorageDetail)
