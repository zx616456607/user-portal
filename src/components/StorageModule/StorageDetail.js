/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/22
 * @author ZhaoXueYu
 */
import React, { Component, PropTypes } from 'react'
import { Tabs, Card, Menu, Progress, Spin, Row, Col } from 'antd'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
// import StorageStatus from "./StorageStatus"
import StorageBind from './StorageBind'
import StorageRental from './StorageRental'
import { injectIntl, FormattedMessage } from 'react-intl'
import { loadStorageInfo } from '../../actions/storage'
import "./style/StorageDetail.less"
import storagePNG from '../../assets/img/storage.png'
import Title from '../Title'
import { formatDate } from '../../common/tools'
import StorageDetailIntl from './StorageDetailIntl'
import NotificationHandler from '../Notification/index'
const notification = new NotificationHandler()

function loadData(props) {
  const { loadStorageInfo,intl } = props
  loadStorageInfo(props.params.cluster, props.params.storage_name, {}, {
    failed:{
      func: err => {
        notification.warn(intl.formatMessage(StorageDetailIntl.getDetail))
      },
      isAsync: true,
    }
  })
}

const TabPane = Tabs.TabPane

class StorageDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentKey: "1"
    }
  }
  componentWillMount() {
    loadData(this.props)
  }
  render() {
    const { formatMessage } = this.props.intl
    const { StorageInfo, isFetching, params, billingEnabled } = this.props
    if (isFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large"></Spin>
        </div>
       )
    }
    return (
      <div id="StorageDetail">
        <QueueAnim className="demo-content"
          key="demo"
          type="right"
          >
          <div key="ca" className="AppInfo">
            <Title title={formatMessage(StorageDetailIntl.detail)} />
            <div className="topRow">
              <span
                className="back"
                onClick={() => browserHistory.push(`/app_manage/storage`)}
              >
                <span className="backjia"></span>
                <span className="btn-back">{formatMessage(StorageDetailIntl.back)}</span>
              </span>
              <span className="title">{formatMessage(StorageDetailIntl.detail)}</span>
            </div>
            <Card className="topCard">
              <div className="imgBox">
                <img src={storagePNG} />
              </div>
              <div className="infoBox">
                <div className="appTitle">
                  {StorageInfo.volumeName}
                </div>
                <div className="info">
                  <Row>
                    <Col span="9">
                      { formatMessage(StorageDetailIntl.storageType)}：{ formatMessage(StorageDetailIntl.exclusiveStorage)}（{ formatMessage(StorageDetailIntl.blockStorage)}）
                    </Col>
                    <Col span="15">
                      <div className="createDate">
                        <FormattedMessage {...StorageDetailIntl.createTime} />：
                        { StorageInfo.createTime ? formatDate(StorageInfo.createTime) : '-' }
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col span="9">
                      <FormattedMessage {...StorageDetailIntl.blockName} />：{ StorageInfo.storageServer}
                    </Col>
                    <Col span="15">
                      <div className="use">
                        <FormattedMessage {...StorageDetailIntl.use} />
                        ：&nbsp;&nbsp;
                        <Progress strokeWidth={8} showInfo={false} status="active" percent={ StorageInfo.consumption / parseInt(StorageInfo.size) *100 } />
                        &nbsp;&nbsp;{ StorageInfo.consumption } / { parseInt(StorageInfo.size) } M
                      </div>
                    </Col>
                  </Row>


                </div>
                <div style={{ clear:"both" }}></div>
              </div>

              <div style={{ clear:"both" }}></div>
            </Card>
            <Card className="bottomCard">
              <Tabs
                tabPosition="top"
                defaultActiveKey="1"
              >
              {billingEnabled ?
                [<TabPane tab={<FormattedMessage {...StorageDetailIntl.bindService} />} key="1" >
                  <StorageBind
                    pool={StorageInfo.imagePool}
                    cluster={params.cluster}
                    volumeName={params.storage_name}
                  />
                </TabPane>,
                <TabPane tab={<FormattedMessage {...StorageDetailIntl.LeaseholdInfo} />} key="2" >
                  <StorageRental config={this.props.resourcePrice} size={StorageInfo.size}/>
                </TabPane>]
                :
                <TabPane tab={<FormattedMessage {...StorageDetailIntl.bindService} />} key="1" >
                  <StorageBind pool={StorageInfo.imagePool} cluster={params.cluster} volumeName={ StorageInfo.volumeName } />
                </TabPane>
              }
              </Tabs>
            </Card>
          </div>
        </QueueAnim>
      </div>
    )
  }
}

StorageDetail.propTypes = {
  intl: PropTypes.object.isRequired,
  loadStorageInfo: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const { billingConfig } = state.entities.loginUser.info
  const { enabled: billingEnabled } = billingConfig
  const defaultInfo = {
    imagePool: props.params.pool,
    volumeName: props.params.storage_name,
    cluster: cluster.clusterID,
    storageServer: '-',
    consumption: 0,
    size: 0
  }
  const StorageInfo  = state.storage.storageDetail.StorageInfo || defaultInfo
  return {
    isFetching: state.storage.storageDetail.isFetching,
    StorageInfo,
    resourcePrice: cluster.resourcePrice,
    billingEnabled
  }
}

export default connect(mapStateToProps,{
  loadStorageInfo,
})(injectIntl(StorageDetail,{withRef: true}))