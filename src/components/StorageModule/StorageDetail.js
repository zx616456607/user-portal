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
import { Tabs, Card, Menu, Progress, Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import StorageStatus from "./StorageStatus"
import StorageBind from './StorageBind.js'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadStorageInfo } from '../../actions/storage'
import "./style/StorageDetail.less"
import { DEFAULT_IMAGE_POOL } from '../../constants'

function loadData(props) {
  const { loadStorageInfo } = props
  loadStorageInfo(props.params.pool, props.params.cluster, props.params.storage_name)
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
    defaultMessage: '绑定容器'
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
    document.title = "存储详情 | 时速云"
    loadData(this.props)
  }
  render() {
    const { formatMessage } = this.props.intl
    const { currentKey } = this.state
    const { StorageInfo, isFetching } = this.props
    if (isFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large"></Spin> 
        </div>
       ) 
    }
    const color = StorageInfo.isUsed ? '#f85a5a' : '#5cb85c'

    const consumption = (StorageInfo.consumption / StorageInfo.size) * 100
    return (
      <div id="StorageDetail">
        <QueueAnim className="demo-content"
          key="demo"
          type="right"
          >
          <div key="ca" className="AppInfo">
            <Card className="topCard">
              <div className="imgBox">
                <img src="/img/storage.png" />
              </div>
              <div className="infoBox">
                <div className="appTitle">
                  {StorageInfo.volumeName}
                </div>
                <div className="info">
                  <FormattedMessage {...messages.useStatus} />
                  &nbsp;：
                    <span>
                    <i className= 'fa fa-circle error' style={ {color: color} }></i>&nbsp;
                      <span className={StorageInfo.isUsed ? 'error' : 'normal'} style={{ color: color }}>{StorageInfo.isUsed ? <FormattedMessage {...messages.using} /> : <FormattedMessage {...messages.stop} />}</span>
                  </span>
                  <div className="createDate">
                    <FormattedMessage {...messages.create} />：
                   { StorageInfo.createTime }
                  </div>
                  <div className="use">
                    <FormattedMessage {...messages.useLevel} />
                    ：&nbsp;&nbsp;
                    <Progress strokeWidth={8} showInfo={false} status="active" percent={ consumption} />
                    &nbsp;&nbsp;{ StorageInfo.consumption } / { StorageInfo.size } MB
                  </div>
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
                <TabPane tab={<FormattedMessage {...messages.bindContainer} />} key="1" >
                  <StorageBind pool={StorageInfo.imagePool} cluster={StorageInfo.cluster} volumeName={ StorageInfo.volumeName } />
                </TabPane>
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
  const defaultInfo = {
    imagePool: props.params.pool,
    volumeName: props.params.storage_name,
    cluster: cluster.clusterID
  }
  const StorageInfo  = state.storage.storageDetail.StorageInfo || defaultInfo
  return {
    isFetching: state.storage.storageDetail.isFetching,
    StorageInfo
  }
}

export default connect(mapStateToProps,{
  loadStorageInfo,
})(injectIntl(StorageDetail,{withRef: true}))