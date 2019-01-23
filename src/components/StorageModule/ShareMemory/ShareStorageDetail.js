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
import { Card, Row, Col, Tabs, Spin, Progress } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/ShareStorageDetail.less'
import Title from '../../Title'
import { injectIntl, FormattedMessage } from 'react-intl'
import storagePNG from '../../../assets/img/storage.png'
import { browserHistory } from 'react-router'
import { loadStorageInfo } from '../../../actions/storage'
import { formatDate } from '../../../common/tools'
import MountServiceList from '../MountServiceList'
import NotificationHandler from '../../Notification/index'
import StorageDetailIntl from '../StorageDetailIntl'

const notification = new NotificationHandler()

const TabPane = Tabs.TabPane

class ShareStorageDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentWillMount() {
    const { loadStorageInfo, params, intl } = this.props;
    loadStorageInfo(params.cluster, params.share_name, {fstype: this.props.location.query.diskType}, {
      failed:{
        func: err => {
          notification.warn(intl.formatMessage(StorageDetailIntl.getDetail))
        },
        isAsync: true,
      }
    })
  }

  render() {
    const { StorageInfo, isFetching, params, cluster, intl } = this.props
    const { formatMessage } = intl
    if (isFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large"></Spin>
        </div>
      )
    }
    const clusterID = cluster.clusterID
    const volumeName = params.share_name;
    return(
      <QueueAnim type="right">
        <Title title={formatMessage(StorageDetailIntl.detail)}/>
        <div id='share_storage_detail' key="share_storage_detail">
          <div className="topRow">
            <span
              className="back"
              onClick={() => browserHistory.push(`/app_manage/storage/shared`)}
            >
              <span className="backjia"></span>
              <span className="btn-back"><FormattedMessage {...StorageDetailIntl.back} /></span>
            </span>
            <span className="title"><FormattedMessage {...StorageDetailIntl.detail} /></span>
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
                    <FormattedMessage {...StorageDetailIntl.storageType} />：<FormattedMessage {...StorageDetailIntl.SharedStorage} />（{ this.props.location.query.diskType === 'glusterfs' ? 'GlusterFS' : 'NFS' }）
                  </Col>
                  <Col span="15">
                    <div className="createDate">
                      <FormattedMessage {...StorageDetailIntl.createTime} />：{ formatDate(StorageInfo.createTime) }
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span="9">
                    <FormattedMessage {...StorageDetailIntl.storageService} />：{ StorageInfo.storageServer }
                  </Col>
                  <Col span="15">
                  {
                    this.props.location.query.diskType === 'glusterfs' ?
                    <div className="use"><FormattedMessage {...StorageDetailIntl.total} />:  { StorageInfo.size } </div>
                    :
                    null
                  }
                  {/*<div className="use">用量
                      ：&nbsp;&nbsp;
                      <Progress strokeWidth={8} showInfo={false} status="active" percent={ StorageInfo.consumption * 100 } />
                      &nbsp;&nbsp;{ StorageInfo.consumption * parseInt(StorageInfo.size) } / { parseInt(StorageInfo.size) }M
                    </div>*/}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <FormattedMessage {...StorageDetailIntl.serviceCommonDir} />：
                    <span>{StorageInfo.customFolder || StorageInfo.nfsActualPath || formatMessage(StorageDetailIntl.systemRandom)}</span>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
          <Card>
            <Tabs>
              <TabPane tab={<FormattedMessage {...StorageDetailIntl.bindService} />} key="service">
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
})(injectIntl(ShareStorageDetail,{
  withRef: true
}))
