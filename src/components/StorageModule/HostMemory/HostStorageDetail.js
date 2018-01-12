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
import StorageBind from '../StorageBind'

const TabPane = Tabs.TabPane

class HostStorageDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentWillMount() {

  }

  render() {
    const { cluster, params, location, StorageInfo } = this.props
    const clusterID = cluster.clusterID
    const hostName = params.host_name
    const { path, ip } = location.query
    const query ={
      storagetype: 'host',
      path,
      ip,
    }
    return(
      <QueueAnim type="right">
        <div id='host_storage_detail' key="host_storage_detail">
          <Title title="存储详情" />
          <div className="topRow">
              <span
                className="back"
                onClick={() => browserHistory.push(`/app_manage/storage/host`)}
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
                { hostName }
              </div>
              <div className="info">
                <Row>
                  <Col span="9">
                    存储类型：host
                  </Col>
                  <Col span="15">
                    {/*<div className="createDate">
                      创建时间：2012-12-12
                    </div>*/}
                  </Col>
                </Row>
                <Row>
                  <Col span="9">
                    宿主机目录：{ path }
                  </Col>
                  <Col span="15">
                    存储节点：{ ip ? ip : '-' }
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
          <Card>
            <Tabs>
              <TabPane tab="绑定服务" key="service">
                <StorageBind
                  pool={StorageInfo.imagePool}
                  cluster={clusterID}
                  volumeName={'host'}
                  query={query}
                />
              </TabPane>
              {/*<TabPane tab="租赁信息" key="rentInfo">
                租赁信息
              </TabPane>*/}
            </Tabs>
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProp(state, props) {
  const { entities, storage } = state
  const { current } = entities
  const { cluster } = current
  const defaultInfo = {
    imagePool: props.params.pool,
    volumeName: props.params.storage_name,
    cluster: cluster.clusterID,
    storageServer: '-',
    consumption: 0,
    size: 0
  }
  const StorageInfo  = storage.storageDetail.StorageInfo || defaultInfo
  return {
    cluster,
    StorageInfo,
  }
}

export default connect(mapStateToProp, {

})(HostStorageDetail)