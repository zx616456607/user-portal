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
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadStorageInfo } from '../../actions/storage'
import "./style/StorageDetail.less"
import { DEFAULT_IMAGE_POOL } from '../../constants'
import storagePNG from '../../assets/img/storage.png'
import Title from '../Title'
import { SHOW_BILLING } from '../../constants'
import { formatDate } from '../../common/tools'
import NotificationHandler from '../Notification/index'
const notification = new NotificationHandler()

function loadData(props) {
  const { loadStorageInfo } = props
  loadStorageInfo(props.params.cluster, props.params.storage_name, {}, {
    failed:{
      func: err => {
        notification.warn("获取存储详情失败")
      },
      isAsync: true,
    }
  })
}

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const TabPane = Tabs.TabPane

const messages = defineMessages({
  useStatus: {
    id: "StorageDetail.header.useStatus",
    defaultMessage: '状态'
  },
  using: {
    id: "StorageDetail.header.using",
    defaultMessage: '使用中'
  },
  stop: {
    id: "StorageDetail.header.stop",
    defaultMessage: '未使用'
  },
  create: {
    id: "StorageDetail.header.create",
    defaultMessage: '创建时间'
  },
  useLevel: {
    id: "StorageDetail.header.useLevel",
    defaultMessage: '用量'
  },
  bindContainer: {
    id: "StorageBind.bind.bindContainer",
    defaultMessage: '绑定服务'
  },
  operating: {
    id: "StorageDetail.operating",
    defaultMessage: '操作'
  },
})

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
    const { currentKey } = this.state
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
            <Title title="存储详情" />
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
                      存储类型：独享型（块存储）
                    </Col>
                    <Col span="15">
                      <div className="createDate">
                        <FormattedMessage {...messages.create} />：
                        { StorageInfo.createTime ? formatDate(StorageInfo.createTime) : '-' }
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col span="9">
                      块存储集群名称：{ StorageInfo.storageServer}
                    </Col>
                    <Col span="15">
                      <div className="use">
                        <FormattedMessage {...messages.useLevel} />
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
                [<TabPane tab={<FormattedMessage {...messages.bindContainer} />} key="1" >
                  <StorageBind
                    pool={StorageInfo.imagePool}
                    cluster={params.cluster}
                    volumeName={params.storage_name}
                  />
                </TabPane>,
                <TabPane tab="租赁信息" key="2" >
                  <StorageRental config={this.props.resourcePrice} size={StorageInfo.size}/>
                </TabPane>]
                :
                <TabPane tab={<FormattedMessage {...messages.bindContainer} />} key="1" >
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